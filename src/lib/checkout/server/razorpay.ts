import { createHmac, timingSafeEqual } from "node:crypto";
import { paymentConfig } from "./env";

// Razorpay (payments): orders, payments and signature checks. Docs: razorpay.com/docs/api

const API = "https://api.razorpay.com/v1";

type Notes = Record<string, string>;
export type RzpOrder = {
  id: string;
  amount: number; // paise
  amount_paid: number;
  currency: string;
  status: "created" | "attempted" | "paid";
  notes: Notes | [];
};
export type RzpPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method?: string;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const { keyId, keySecret } = paymentConfig();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    // Log the status only: the body can echo request details.
    console.error(`[payments] ${init?.method ?? "GET"} ${path} failed: ${res.status}`);
    throw new Error("The payment service is not responding. Please try again.");
  }
  return (await res.json()) as T;
}

export const createRzpOrder = (amount: number, receipt: string, notes: Notes) =>
  call<RzpOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ amount, currency: "INR", receipt, notes }),
  });

export const fetchRzpOrder = (id: string) => call<RzpOrder>(`/orders/${encodeURIComponent(id)}`);

export const fetchRzpPayment = (id: string) =>
  call<RzpPayment>(`/payments/${encodeURIComponent(id)}`);

const sameHex = (a: string, b: string) => {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
};

/** The checkout window's success handler: HMAC-SHA256 of "order_id|payment_id". */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = createHmac("sha256", paymentConfig().keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return /^[a-f0-9]{64}$/.test(signature) && sameHex(expected, signature);
}

/** Webhooks: HMAC-SHA256 of the raw body with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const { webhookSecret } = paymentConfig();
  if (!webhookSecret) return false;
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return /^[a-f0-9]{64}$/.test(signature) && sameHex(expected, signature);
}
