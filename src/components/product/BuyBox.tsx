import { useId, type ReactNode, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Minus, Plus } from "@phosphor-icons/react";
import { home, pdp, type ProductDetails } from "@/data/content";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { Stars } from "@/components/site/Stars";
import { Icon } from "./icons";
import { pouches, savePercent, type Purchase } from "./purchase";

/**
 * Product buy box: rating, price, pack choice, quantity and "Add to cart". Used on the
 * product page (full, with highlights and "Why you'll love it") and on the homepage
 * (compact, with a link to the product page).
 */
export function BuyBox({
  product,
  details,
  purchase,
  heading,
  compact = false,
  addRef,
}: {
  product: Product;
  details?: ProductDetails | undefined;
  purchase: Purchase;
  heading: ReactNode;
  compact?: boolean;
  addRef?: RefObject<HTMLButtonElement | null>;
}) {
  const { add } = useCart();
  const { variant, setVariantId, qty, setQty } = purchase;
  const name = useId();
  if (!variant) return null;
  const price = money(variant.price);
  const was = variant.compareAtPrice ? money(variant.compareAtPrice) : 0;
  const save = savePercent(variant);
  const perCup = details ? price / (pouches(variant) * details.cupsPerPouch) : 0;

  return (
    <div>
      {product.subtitle && <p className="label-caps text-muted-foreground">{product.subtitle}</p>}
      <div className="mt-3">{heading}</div>
      {product.rating && (
        <a
          href={compact ? undefined : "#reviews"}
          className="mt-4 inline-flex min-h-11 items-center gap-2.5 text-sm text-muted-foreground"
        >
          <Stars value={product.rating.value} size={15} />
          <span>
            <span className="text-ink">{product.rating.value.toFixed(1)}</span> ·{" "}
            {product.rating.count.toLocaleString("en-IN")} reviews
          </span>
        </a>
      )}

      <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl tracking-[0.02em] text-ink">{inr(price)}</span>
        {was > price && (
          <span className="text-lg text-muted-foreground line-through">{inr(was)}</span>
        )}
        {save > 0 && (
          <span className="bg-rose px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink">
            {pdp.save} {save}%
          </span>
        )}
      </p>
      {perCup > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          {inr(perCup)} {pdp.perCup} · {pouches(variant) * (details?.cupsPerPouch ?? 0)} tea bags
        </p>
      )}

      {(details?.tagline || (!details && product.description)) && (
        <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">
          {details?.tagline ?? product.description}
        </p>
      )}

      {product.variants.length > 1 && (
        <fieldset className="mt-8">
          <legend className="label-caps text-ink">{pdp.pack}</legend>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {product.variants.map((v) => {
              const on = v.id === variant.id;
              return (
                <label
                  key={v.id}
                  className={`relative flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center border px-2 py-3 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${on ? "border-jujube bg-jujube text-cream" : "border-input bg-surface hover:border-ink"} ${v.availableForSale ? "" : "cursor-not-allowed opacity-50"}`}
                >
                  <input
                    type="radio"
                    name={name}
                    value={v.id}
                    checked={on}
                    disabled={!v.availableForSale}
                    onChange={() => setVariantId(v.id)}
                    className="sr-only"
                  />
                  <span className="text-[0.8rem] font-medium uppercase tracking-[0.14em]">
                    {v.title}
                  </span>
                  <span
                    className={`mt-1 text-sm ${on ? "text-cream/85" : "text-muted-foreground"}`}
                  >
                    {inr(money(v.price))}
                  </span>
                  {v.note && (
                    <span
                      className={`mt-1 text-[0.7rem] leading-tight ${on ? "text-cream" : "text-jujube"}`}
                    >
                      {v.note}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex gap-3">
        <div className="flex items-center border border-input bg-surface">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="grid h-[52px] w-11 place-items-center disabled:opacity-40"
          >
            <Minus size={14} weight="light" />
          </button>
          <span aria-live="polite" className="w-7 text-center tabular-nums">
            <span className="sr-only">{pdp.quantity} </span>
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty(Math.min(20, qty + 1))}
            className="grid h-[52px] w-11 place-items-center"
          >
            <Plus size={14} weight="light" />
          </button>
        </div>
        <button
          ref={addRef}
          type="button"
          disabled={!variant.availableForSale}
          onClick={() => add(product, variant, qty, { openDrawer: true })}
          className="btn btn-primary flex-1 px-4"
        >
          {variant.availableForSale ? (
            <>
              {pdp.add}
              <span aria-hidden="true">·</span>
              {inr(price * qty)}
            </>
          ) : (
            pdp.soldOut
          )}
        </button>
      </div>

      {details && (
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {details.highlights.map((h) => (
            <li key={h} className="flex items-center gap-1.5">
              <Check size={15} weight="light" className="text-jujube" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      )}

      {compact ? (
        <Link
          to="/products/$handle"
          params={{ handle: product.handle }}
          className="group link-caps mt-6 text-ink"
        >
          {home.featured.details}
          <span className="sr-only">: {product.title}</span>
          <ArrowRight size={16} weight="light" className="arrow-nudge" aria-hidden="true" />
        </Link>
      ) : (
        <>
          {details && (
            <div className="mt-9 border-t pt-7">
              <p className="label-caps text-ink">{pdp.loveIt}</p>
              <ul className="mt-4 space-y-3">
                {details.loveIt.map((l) => (
                  <li key={l.title} className="flex gap-3 leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-jujube"
                    />
                    <span>
                      <strong className="font-medium">{l.title}</strong>
                      <span className="text-muted-foreground">: {l.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ul
            className={`mt-8 grid gap-3 border-y py-5 ${details ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {/* Ingredient claims only for products with confirmed details. */}
            {pdp.assurance.slice(0, details ? 3 : 2).map((a) => (
              <li key={a.label} className="flex flex-col items-center gap-2 text-center">
                <Icon name={a.icon} size={24} className="text-jujube" />
                <span className="text-xs leading-snug text-muted-foreground">{a.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
