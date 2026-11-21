// Server-only settings for checkout. These are NOT VITE_ variables: they never reach the
// browser. Set them in .env.local (local) and in Vercel (Project Settings > Environment
// Variables). See .env.example.
import type { PaymentMode } from "../types";

const read = (key: string) => (process.env[key] ?? "").trim();

export const paymentConfig = () => ({
  keyId: read("RAZORPAY_KEY_ID"),
  keySecret: read("RAZORPAY_KEY_SECRET"),
  webhookSecret: read("RAZORPAY_WEBHOOK_SECRET"),
});

export const storeConfig = () => ({
  domain: read("STORE_DOMAIN"),
  token: read("STORE_ADMIN_TOKEN"),
  apiVersion: read("STORE_API_VERSION") || "2026-10",
});

export const isPaymentConfigured = () => {
  const c = paymentConfig();
  return Boolean(c.keyId && c.keySecret);
};

export const isStoreConfigured = () => {
  const c = storeConfig();
  return Boolean(c.domain && c.token);
};

/**
 * live: real payments. test: no payment keys on the local dev server, a "test payment"
 * button completes the flow without charging anyone (never in a production build).
 * off: production build without payment keys, the Pay button is disabled.
 */
export const paymentMode = (): PaymentMode =>
  isPaymentConfigured() ? "live" : import.meta.env.DEV ? "test" : "off";
