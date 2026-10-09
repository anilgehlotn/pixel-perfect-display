import { Link } from "@tanstack/react-router";
import { ArrowRight } from "@phosphor-icons/react";
import { ProductImage } from "@/components/site/ProductImage";
import { formatDate, orderStatus } from "@/lib/customer/format";
import type { OrderSummary } from "@/lib/customer/types";
import { inr } from "@/lib/format";
import { money } from "@/lib/shopify/types";
import { SkeletonBlock, StatusBadge } from "./ui";

export function OrderThumbs({ order }: { order: OrderSummary }) {
  return (
    <ul className="flex gap-2" aria-label={`${order.itemCount} items`}>
      {order.thumbnails.map((t) => (
        <li key={t.id} className="h-16 w-14 shrink-0 overflow-hidden bg-beige">
          {t.image ? (
            <ProductImage image={t.image} alt={t.title} className="h-full w-full" />
          ) : (
            <span className="sr-only">{t.title}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** One order in a list: number, date, status, thumbnails, total, link to the details. */
export function OrderCard({ order }: { order: OrderSummary }) {
  const status = orderStatus(order);
  return (
    <article className="group relative border bg-background p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm">
            <Link
              to="/account/orders/$id"
              params={{ id: order.id }}
              className="after:absolute after:inset-0"
            >
              Order {order.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.processedAt)}</p>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <OrderThumbs order={order} />
        <p className="flex items-center gap-3">
          <span className="text-lg tabular-nums">{inr(money(order.totalPrice))}</span>
          <ArrowRight size={18} weight="light" className="arrow-nudge" aria-hidden="true" />
        </p>
      </div>
    </article>
  );
}

export function OrderCardSkeleton() {
  return (
    <div aria-hidden="true" className="border bg-background p-5 md:p-6">
      <div className="flex justify-between">
        <div>
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="mt-2 h-4 w-24" />
        </div>
        <SkeletonBlock className="h-6 w-20" />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div className="flex gap-2">
          <SkeletonBlock className="h-16 w-14" />
          <SkeletonBlock className="h-16 w-14" />
        </div>
        <SkeletonBlock className="h-6 w-20" />
      </div>
    </div>
  );
}
