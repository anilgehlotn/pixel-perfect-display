import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react";
import { fetchOrder } from "@/lib/customer/functions";
import { formatDate, orderStatus, paymentStatus } from "@/lib/customer/format";
import type { OrderDetail, OrderLine } from "@/lib/customer/types";
import { isOrderId } from "@/lib/customer/validation";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { money, type Money } from "@/lib/shopify/types";
import { ProductImage } from "@/components/site/ProductImage";
import { AddressBlock } from "@/components/account/AddressBlock";
import { Panel, SkeletonBlock, StatusBadge } from "@/components/account/ui";

export const Route = createFileRoute("/account/_dashboard/orders/$id")({
  loader: async ({ params }) => {
    if (!isOrderId(params.id)) throw notFound();
    const order = await fetchOrder({ data: { id: params.id } });
    if (!order) throw notFound();
    return order;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData ? `Order ${loaderData.name}` : "Order"} | SkinFusion` },
      { name: "robots", content: "noindex" },
    ],
  }),
  pendingMs: 150,
  pendingMinMs: 300,
  pendingComponent: OrderSkeleton,
  notFoundComponent: OrderNotFound,
  component: Order,
});

const amount = (m: Money | null) => (m ? inr(money(m)) : "Not available");

function Order() {
  const order = Route.useLoaderData();
  const status = orderStatus(order);
  return (
    <article className="grid gap-8">
      <div>
        <Link
          to="/account/orders"
          className="group label-caps inline-flex min-h-11 items-center gap-2 text-[0.65rem] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} weight="light" className="arrow-nudge-back" aria-hidden="true" />
          All orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-xl">Order {order.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.processedAt)}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </div>

      <Panel title={`Items (${order.itemCount})`} action={<BuyAgain order={order} />}>
        <ul className="grid gap-5">
          {order.lines.map((l) => (
            <LineItem key={l.id} line={l} />
          ))}
        </ul>
        <dl className="mt-8 grid gap-2 border-t pt-6 tabular-nums">
          <Row label="Subtotal" value={amount(order.subtotal)} />
          <Row
            label="Shipping"
            value={money(order.shipping) === 0 ? "Free" : amount(order.shipping)}
          />
          {order.tax && money(order.tax) > 0 ? <Row label="Tax" value={amount(order.tax)} /> : null}
          <div className="mt-2 flex justify-between border-t pt-4 text-lg">
            <dt>Total</dt>
            <dd>{amount(order.totalPrice)}</dd>
          </div>
        </dl>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Shipping address">
          {order.shippingAddress ? (
            <AddressBlock address={order.shippingAddress} />
          ) : (
            <p className="text-muted-foreground">No shipping address on this order.</p>
          )}
        </Panel>
        <Panel title="Status">
          <dl className="grid gap-4">
            <div>
              <dt className="label-caps text-[0.65rem] text-muted-foreground">Payment</dt>
              <dd className="mt-1">{paymentStatus(order.financialStatus)}</dd>
            </div>
            <div>
              <dt className="label-caps text-[0.65rem] text-muted-foreground">Delivery</dt>
              <dd className="mt-1">{status.label}</dd>
            </div>
            {order.tracking.length ? (
              <div>
                <dt className="label-caps text-[0.65rem] text-muted-foreground">Tracking</dt>
                {order.tracking.map((t, i) => (
                  <dd key={t.number ?? i} className="mt-1">
                    {t.url ? (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4"
                      >
                        {t.company ?? "Track parcel"} {t.number}
                        <ArrowSquareOut size={16} weight="light" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : (
                      `${t.company ?? ""} ${t.number ?? ""}`.trim() || "Tracking details pending"
                    )}
                  </dd>
                ))}
              </div>
            ) : null}
            {order.statusPageUrl ? (
              <div>
                <a
                  href={order.statusPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4"
                >
                  Order status page
                  <ArrowSquareOut size={16} weight="light" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            ) : null}
          </dl>
        </Panel>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function LineItem({ line }: { line: OrderLine }) {
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-4">
      <div className="aspect-[4/5] overflow-hidden bg-beige">
        {line.image ? (
          <ProductImage image={line.image} alt={line.title} className="h-full w-full" />
        ) : null}
      </div>
      <div>
        <p>{line.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {[line.variantTitle, `Qty ${line.quantity}`].filter(Boolean).join(", ")}
        </p>
      </div>
      <p className="tabular-nums">{amount(line.totalPrice)}</p>
    </li>
  );
}

function BuyAgain({ order }: { order: OrderDetail }) {
  const { addLines } = useCart();
  const lines = order.lines
    .filter((l) => l.variantId && l.price)
    .map((l) => ({
      quantity: l.quantity,
      merchandise: {
        id: l.variantId as string,
        title: l.variantTitle ?? "",
        price: l.price as Money,
        image: l.image,
        product: { handle: "", title: l.title },
      },
    }));
  if (!lines.length) return null;
  return (
    <button onClick={() => addLines(lines, { openDrawer: true })} className="btn btn-primary">
      Buy again
    </button>
  );
}

function OrderNotFound() {
  return (
    <div className="border border-dashed px-6 py-14 text-center">
      <h2 className="text-base">Order not found</h2>
      <p className="mx-auto mt-3 max-w-[40ch] text-muted-foreground">
        This order isn’t on your account. It may belong to a different email address.
      </p>
      <Link to="/account/orders" className="btn btn-outline mt-8">
        All orders
      </Link>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-label="Loading order">
      <div>
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="mt-4 h-7 w-44" />
        <SkeletonBlock className="mt-2 h-4 w-32" />
      </div>
      <div className="border bg-background p-6 md:p-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="mt-5 grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 first:mt-0"
          >
            <SkeletonBlock className="aspect-[4/5]" />
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-5 w-16" />
          </div>
        ))}
        <SkeletonBlock className="mt-8 h-24 w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="h-44" />
      </div>
    </div>
  );
}
