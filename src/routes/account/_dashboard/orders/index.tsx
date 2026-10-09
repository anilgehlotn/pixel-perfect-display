import { useState, useTransition } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { fetchOrders } from "@/lib/customer/functions";
import type { OrderSummary } from "@/lib/customer/types";
import { OrderCard, OrderCardSkeleton } from "@/components/account/OrderCard";
import { EmptyState, FormAlert, SkeletonBlock } from "@/components/account/ui";

export const Route = createFileRoute("/account/_dashboard/orders/")({
  loader: () => fetchOrders({ data: { after: null } }),
  head: () => ({
    meta: [{ title: "Orders | SkinFusion" }, { name: "robots", content: "noindex" }],
  }),
  pendingMs: 150,
  pendingMinMs: 300,
  pendingComponent: OrdersSkeleton,
  component: Orders,
});

function Orders() {
  const first = Route.useLoaderData();
  const loadMore = useServerFn(fetchOrders);
  const [orders, setOrders] = useState<OrderSummary[]>(first.orders);
  const [cursor, setCursor] = useState(first.endCursor);
  const [hasMore, setHasMore] = useState(first.hasNextPage);
  const [error, setError] = useState(false);
  const [loading, startLoading] = useTransition();

  const more = () =>
    startLoading(async () => {
      setError(false);
      try {
        const page = await loadMore({ data: { after: cursor } });
        setOrders((prev) => [...prev, ...page.orders]);
        setCursor(page.endCursor);
        setHasMore(page.hasNextPage);
      } catch {
        setError(true);
      }
    });

  if (!orders.length)
    return (
      <EmptyState
        title="No orders yet"
        text="When you place an order it appears here, with its status and tracking."
        action={
          <Link to="/" hash="shop" className="btn btn-primary">
            Start your glow ritual
          </Link>
        }
      />
    );

  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title" className="text-sm md:text-base">
        Order history
      </h2>
      <ul data-anim="cards" className="mt-6 grid gap-4">
        {orders.map((o) => (
          <li key={o.id}>
            <OrderCard order={o} />
          </li>
        ))}
      </ul>
      {loading ? (
        <div className="mt-4 grid gap-4" aria-hidden="true">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite">
        {loading ? "Loading more orders" : `Showing ${orders.length} orders`}
      </p>
      {error ? (
        <div className="mt-6">
          <FormAlert message="We couldn't load more orders. Check your connection and try again." />
        </div>
      ) : null}
      {hasMore ? (
        <div className="mt-8 text-center">
          <button onClick={more} disabled={loading} className="btn btn-outline">
            {error ? "Try again" : loading ? "Loading" : "Load more"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function OrdersSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading orders">
      <SkeletonBlock className="h-5 w-36" />
      <div className="mt-6 grid gap-4">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    </div>
  );
}
