import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookSignature } from "@/lib/checkout/server/razorpay";
import { recordPaidOrder } from "@/lib/checkout/server/record";

// POST /api/payment-webhook
// Razorpay webhook (Dashboard > Webhooks): URL https://<site>/api/payment-webhook, event
// "payment.captured" only, secret = RAZORPAY_WEBHOOK_SECRET. Backup for the confirm call: if
// the shopper closed the tab after paying, the order is still recorded. It waits a little so
// the confirm call (usually first) can finish, then records the order only if it is missing.
// Any failure returns 500 so Razorpay retries.

const WAIT_MS = 15_000;

export const Route = createFileRoute("/api/payment-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";
        if (!verifyWebhookSignature(raw, signature))
          return new Response("invalid", { status: 401 });

        let event: {
          event?: string;
          payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
        };
        try {
          event = JSON.parse(raw) as typeof event;
        } catch {
          return new Response("bad request", { status: 400 });
        }
        const payment = event.payload?.payment?.entity;
        if (event.event !== "payment.captured" || !payment?.id || !payment.order_id)
          return new Response("ignored", { status: 200 });

        await new Promise((r) => setTimeout(r, WAIT_MS));
        try {
          await recordPaidOrder(payment.order_id, payment.id);
          return new Response("ok", { status: 200 });
        } catch (e) {
          console.error("[webhook] order record failed", e);
          return new Response("retry", { status: 500 });
        }
      },
    },
  },
});
