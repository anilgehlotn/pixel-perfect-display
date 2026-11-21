// Server functions the checkout page calls (the only bridge from the browser). Handler bodies
// and everything they import from ./server run on the server only; secrets never reach the
// browser bundle.
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { priceCart } from "./pricing";
import { paymentConfig, paymentMode } from "./server/env";
import { encodeNotes } from "./server/notes";
import { createRzpOrder, verifyPaymentSignature } from "./server/razorpay";
import { recordPaidOrder } from "./server/record";
import type { ConfirmResult, StartPaymentResult } from "./types";
import { parseForm, parseItems } from "./validation";

type Result<T> = { ok: true; value: T } | { ok: false; message: string };
const GENERIC = "Something went wrong. Please try again.";
const userMessage = (e: unknown) =>
  e instanceof Error && !e.message.startsWith("[") ? e.message : GENERIC;
const asObject = (d: unknown) => (d && typeof d === "object" ? (d as Record<string, unknown>) : {});

/** How the page can take payment: live, test (local dev only) or off. */
export const fetchPaymentMode = createServerFn({ method: "GET" }).handler(() => {
  setResponseHeader("cache-control", "private, no-store");
  return paymentMode();
});

/** Prices the cart on the server and opens a payment for exactly that amount. */
export const startPayment = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ form: asObject(d)["form"], items: asObject(d)["items"] }))
  .handler(async ({ data }): Promise<Result<StartPaymentResult>> => {
    try {
      const form = parseForm(data.form);
      const items = parseItems(data.items);
      const mode = paymentMode();
      if (mode === "off") return { ok: false, message: "Online payment opens soon." };
      const cart = await priceCart(items);
      const amount = Math.round(cart.total * 100);
      if (mode === "test")
        return {
          ok: true,
          value: { mode, orderId: `test_${Date.now()}`, amount, currency: "INR" },
        };
      const order = await createRzpOrder(amount, `web-${Date.now()}`, encodeNotes(form, items));
      return {
        ok: true,
        value: { mode, keyId: paymentConfig().keyId, orderId: order.id, amount, currency: "INR" },
      };
    } catch (e) {
      console.error("[checkout] start failed", e);
      return { ok: false, message: userMessage(e) };
    }
  });

const ORDER_ID = /^order_[A-Za-z0-9]{6,40}$/;
const PAYMENT_ID = /^pay_[A-Za-z0-9]{6,40}$/;

/** After a successful payment: checks the signature, then records the order (once). */
export const confirmPayment = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const o = asObject(d);
    const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
    return { orderId: str("orderId"), paymentId: str("paymentId"), signature: str("signature") };
  })
  .handler(async ({ data }): Promise<Result<ConfirmResult>> => {
    // Local dev without payment keys: the "test payment" path. Never in production.
    if (paymentMode() === "test" && /^test_\d+$/.test(data.orderId))
      return { ok: true, value: { reference: `TEST-${data.orderId.slice(-6)}` } };
    if (
      !ORDER_ID.test(data.orderId) ||
      !PAYMENT_ID.test(data.paymentId) ||
      !verifyPaymentSignature(data.orderId, data.paymentId, data.signature)
    )
      return { ok: false, message: "We could not verify the payment. Please contact us." };
    try {
      const { reference } = await recordPaidOrder(data.orderId, data.paymentId);
      return { ok: true, value: { reference } };
    } catch (e) {
      // The payment went through; the webhook records the order if this step failed.
      console.error("[checkout] order record failed, webhook will retry", e);
      return { ok: true, value: { reference: data.orderId.replace(/^order_/, "") } };
    }
  });
