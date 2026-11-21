import { priceCart } from "../pricing";
import { isStoreConfigured } from "./env";
import { decodeNotes } from "./notes";
import { fetchRzpOrder, fetchRzpPayment } from "./razorpay";
import { createPaidOrder, findOrder } from "./store-orders";

export type Recorded = { reference: string; created: boolean };

/**
 * Turns a successful payment into a store order, once. Called by the confirm server function
 * (right after payment) and by the payment webhook (backup if the browser closed).
 * Everything is re-read from the payment service; nothing from the browser is trusted.
 */
export async function recordPaidOrder(
  paymentOrderId: string,
  paymentId: string,
): Promise<Recorded> {
  const [order, payment] = await Promise.all([
    fetchRzpOrder(paymentOrderId),
    fetchRzpPayment(paymentId),
  ]);
  if (payment.order_id !== order.id) throw new Error("[orders] payment does not match order");
  if (payment.status !== "captured" && payment.status !== "authorized")
    throw new Error(`[orders] payment status ${payment.status}`);
  if (payment.amount !== order.amount) throw new Error("[orders] amount mismatch");

  const fallback = { reference: order.id.replace(/^order_/, ""), created: false };
  if (!isStoreConfigured()) {
    console.error("[orders] store backend not configured: paid order not recorded", order.id);
    return fallback;
  }
  const existing = await findOrder(order.id);
  if (existing) return { reference: existing.name, created: false };

  const details = decodeNotes(order.notes);
  if (!details) throw new Error("[orders] order details missing from payment");
  const cart = await priceCart(details.items);
  // Lines and shipping come from the same catalog prices used to create the payment, so they
  // match unless prices changed in between; the transaction always records what was paid.
  if (Math.round(cart.total * 100) !== order.amount)
    console.error("[orders] catalog total differs from amount paid", order.id);
  const name = await createPaidOrder({
    form: details.form,
    cart,
    paymentOrderId: order.id,
    paymentId: payment.id,
    paid: order.amount / 100,
    method: payment.method,
  });
  return { reference: name, created: true };
}
