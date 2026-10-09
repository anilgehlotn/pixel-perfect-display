import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "@phosphor-icons/react";
import { FEATURED_PRODUCT_HANDLE } from "@/data/content";
import { fetchOverview } from "@/lib/customer/functions";
import { getProduct } from "@/lib/shopify/products";
import { money, type Product } from "@/lib/shopify/types";
import { useCart } from "@/lib/cart/context";
import { rs } from "@/lib/format";
import { ProductImage } from "@/components/site/ProductImage";
import { AddressBlock } from "@/components/account/AddressBlock";
import { OrderCard, OrderCardSkeleton } from "@/components/account/OrderCard";
import { Panel, SkeletonBlock } from "@/components/account/ui";

export const Route = createFileRoute("/account/_dashboard/")({
  // Account data and the product card load in parallel.
  loader: async () => {
    const [overview, product] = await Promise.all([
      fetchOverview(),
      getProduct(FEATURED_PRODUCT_HANDLE),
    ]);
    return { overview, product };
  },
  pendingMs: 150,
  pendingMinMs: 300,
  pendingComponent: OverviewSkeleton,
  component: Overview,
});

const LINKS = [
  { to: "/account/orders", label: "Order history", text: "Track and reorder" },
  { to: "/account/addresses", label: "Addresses", text: "Add or change delivery addresses" },
  { to: "/account/details", label: "Account details", text: "Your name and email preferences" },
] as const;

function Overview() {
  const { overview, product } = Route.useLoaderData();
  const { latestOrder, defaultAddress } = overview;
  return (
    <div className="grid gap-10">
      <div data-anim="cards" className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Latest order"
          action={
            latestOrder ? (
              <Link
                to="/account/orders"
                className="label-caps text-[0.65rem] underline underline-offset-4"
              >
                All orders
              </Link>
            ) : null
          }
        >
          {latestOrder ? (
            <OrderCard order={latestOrder} />
          ) : (
            <div>
              <p className="text-muted-foreground">You haven't placed an order yet.</p>
              <Link to="/" hash="shop" className="btn btn-primary mt-6">
                Start your glow ritual
              </Link>
            </div>
          )}
        </Panel>
        <Panel
          title="Default address"
          action={
            <Link
              to="/account/addresses"
              className="label-caps text-[0.65rem] underline underline-offset-4"
            >
              {defaultAddress ? "Manage" : "Add address"}
            </Link>
          }
        >
          {defaultAddress ? (
            <AddressBlock address={defaultAddress} />
          ) : (
            <p className="text-muted-foreground">
              Save an address and checkout fills it in for you.
            </p>
          )}
        </Panel>
      </div>

      <nav aria-label="Account shortcuts">
        <ul className="grid border-t sm:grid-cols-3 sm:border-t-0 sm:border-l">
          {LINKS.map((l) => (
            <li key={l.to} className="border-b sm:border-r sm:border-b-0">
              <Link
                to={l.to}
                className="group flex min-h-11 items-center justify-between gap-4 py-5 sm:px-6"
              >
                <span>
                  <span className="label-caps block text-[0.7rem]">{l.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{l.text}</span>
                </span>
                <ArrowRight
                  size={18}
                  weight="light"
                  className="arrow-nudge shrink-0"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {product ? <ShopAgain product={product} /> : null}
    </div>
  );
}

function ShopAgain({ product }: { product: Product }) {
  const { add } = useCart();
  const variant = product.variants[0];
  return (
    <section
      aria-labelledby="shop-again"
      className="grid items-center gap-6 bg-blush p-6 sm:grid-cols-[9rem_1fr] md:p-8"
    >
      {product.featuredImage ? (
        <div className="overflow-hidden bg-beige">
          <ProductImage image={product.featuredImage} className="aspect-[4/5] w-full" />
        </div>
      ) : null}
      <div>
        <h2 id="shop-again" className="text-sm md:text-base">
          Shop again
        </h2>
        <p className="mt-3">{product.title}</p>
        {variant ? (
          <p className="mt-1 text-muted-foreground tabular-nums">
            {rs(money(variant.price))}
            {product.subtitle ? `, ${product.subtitle}` : ""}
          </p>
        ) : null}
        <button
          onClick={() => variant && add(product, variant, 1, { openDrawer: true })}
          disabled={!variant?.availableForSale}
          className="btn btn-primary mt-6 w-full sm:w-auto"
        >
          Add to cart
        </button>
      </div>
    </section>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-10" aria-busy="true" aria-label="Loading overview">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="border bg-background p-6 md:p-8">
          <SkeletonBlock className="h-5 w-32" />
          <div className="mt-6">
            <OrderCardSkeleton />
          </div>
        </div>
        <div className="border bg-background p-6 md:p-8">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="mt-6 h-28 w-full" />
        </div>
      </div>
      <SkeletonBlock className="h-20 w-full" />
      <SkeletonBlock className="h-48 w-full" />
    </div>
  );
}
