import type { FinancialStatus, FulfillmentStatus, OrderSummary } from "./types";

// Fixed time zone so the server and the browser print the same date (no hydration mismatch).
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export type BadgeTone = "done" | "progress" | "attention" | "neutral";

/** One customer-facing status per order, with a tone for the badge colour. */
export function orderStatus(o: Pick<OrderSummary, "cancelled" | "fulfillmentStatus">): {
  label: string;
  tone: BadgeTone;
} {
  if (o.cancelled) return { label: "Cancelled", tone: "neutral" };
  const map: Record<FulfillmentStatus, { label: string; tone: BadgeTone }> = {
    FULFILLED: { label: "Shipped", tone: "done" },
    PARTIALLY_FULFILLED: { label: "Partly shipped", tone: "progress" },
    IN_PROGRESS: { label: "Preparing", tone: "progress" },
    PENDING_FULFILLMENT: { label: "Preparing", tone: "progress" },
    OPEN: { label: "Order placed", tone: "progress" },
    UNFULFILLED: { label: "Order placed", tone: "progress" },
    SCHEDULED: { label: "Scheduled", tone: "progress" },
    ON_HOLD: { label: "On hold", tone: "attention" },
    RESTOCKED: { label: "Returned", tone: "neutral" },
  };
  return map[o.fulfillmentStatus];
}

export function paymentStatus(s: FinancialStatus | null): string {
  const map: Record<FinancialStatus, string> = {
    PAID: "Paid",
    PENDING: "Payment pending",
    AUTHORIZED: "Payment authorised",
    PARTIALLY_PAID: "Partly paid",
    PARTIALLY_REFUNDED: "Partly refunded",
    REFUNDED: "Refunded",
    VOIDED: "Payment voided",
    EXPIRED: "Payment expired",
  };
  return s ? map[s] : "Payment status unavailable";
}

export const formatPhone = (e164: string) => {
  const d = e164.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : e164;
};
