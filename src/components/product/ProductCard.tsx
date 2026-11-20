import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CaretDown } from "@phosphor-icons/react";
import { home } from "@/data/content";
import { media } from "@/data/media";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { cornerLabel, hasTag, money, type Product } from "@/lib/shopify/types";
import { ProductImage } from "@/components/site/ProductImage";
import { Stars } from "@/components/site/Stars";
import { Img } from "@/components/home/media";
import { savePercent } from "./purchase";

/**
 * Product card: photo on a cream backdrop, "Best seller" tag, rating, name, price with the
 * MRP crossed out and "% OFF", a pack dropdown when there are several packs, and a full-width
 * "Add to cart". The photo and the name open the product page.
 */
export function ProductCard({ p, sizes }: { p: Product; sizes?: string }) {
  const { add } = useCart();
  const selectId = useId();
  const firstAvailable = p.variants.find((v) => v.availableForSale) ?? p.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id);
  const variant = p.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const art = media.products[p.handle] ?? media.productDefault;
  const tag = hasTag(p, "best-seller") ? "Best seller" : cornerLabel(p);
  const available = !!variant?.availableForSale;
  const price = variant ? money(variant.price) : money(p.priceRange.minVariantPrice);
  const mrp = variant?.compareAtPrice ? money(variant.compareAtPrice) : 0;
  const off = variant ? savePercent(variant) : 0;
  return (
    <li className="flex flex-col">
      <div className="relative">
        <Link
          to="/products/$handle"
          params={{ handle: p.handle }}
          tabIndex={-1}
          aria-hidden="true"
          className="zoom block aspect-square overflow-hidden bg-sand"
        >
          {p.featuredImage ? (
            <ProductImage
              image={p.featuredImage}
              alt={p.featuredImage.altText ?? p.title}
              className="h-full w-full"
            />
          ) : (
            <Img
              media={art.fallback}
              sizes={sizes ?? "(min-width: 1024px) 20rem, 70vw"}
              className="h-full w-full"
            />
          )}
        </Link>
        {tag && (
          <span className="pointer-events-none absolute left-0 top-3 bg-rose px-3 py-1 text-xs font-medium text-green">
            {tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        {p.rating && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={p.rating.value} size={14} />
            <span>
              {p.rating.value.toFixed(1)} ({p.rating.count.toLocaleString("en-IN")})
            </span>
          </p>
        )}
        <h3 className="mt-2 text-[1.05rem] font-medium leading-snug text-ink">
          <Link
            to="/products/$handle"
            params={{ handle: p.handle }}
            className="underline-offset-4 hover:underline"
          >
            {p.title}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-lg text-ink">{inr(price)}</span>
          {mrp > price && (
            <span className="text-sm text-muted-foreground line-through">{inr(mrp)}</span>
          )}
          {off > 0 && (
            <span className="bg-rose px-1.5 py-0.5 text-xs font-medium text-green">{off}% OFF</span>
          )}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          {p.variants.length > 1 && (
            <div className="relative">
              <label htmlFor={selectId} className="sr-only">
                Pack for {p.title}
              </label>
              <select
                id={selectId}
                value={variant?.id}
                onChange={(e) => setVariantId(e.target.value)}
                className="h-11 w-full appearance-none border border-input bg-surface px-3 pr-9 text-sm text-ink"
              >
                {p.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                    {v.title}
                    {v.note ? ` (${v.note})` : ""}
                  </option>
                ))}
              </select>
              <CaretDown
                size={14}
                weight="light"
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => variant && add(p, variant)}
            disabled={!available}
            aria-label={available ? `${home.products.cta}: ${p.title}` : undefined}
            className="btn btn-primary w-full"
          >
            {available ? home.products.cta : home.products.soldOut}
          </button>
        </div>
      </div>
    </li>
  );
}
