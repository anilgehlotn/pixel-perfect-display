import { Link } from "@tanstack/react-router";
import { home, packaging } from "@/data/content";
import { media } from "@/data/media";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { cornerLabel, hasTag, money, type Product } from "@/lib/shopify/types";
import { ProductImage } from "@/components/site/ProductImage";
import { Stars } from "@/components/site/Stars";
import { Img } from "@/components/home/media";
import { Pouch } from "./Pouch";

/**
 * Product tile: the pouch on its colour backdrop (a lifestyle photo fades in on hover, desktop
 * only), round "Best seller" badge, name, rating, price and a full-width "Add to cart" (first
 * variant). The picture and the name open the product page. A Shopify packshot replaces the
 * pouch illustration once the store has one.
 */
export function ProductCard({ p, sizes }: { p: Product; sizes?: string }) {
  const { add } = useCart();
  const variant = p.variants[0];
  const art = media.products[p.handle] ?? media.productDefault;
  const look = packaging[p.handle];
  const bestSeller = hasTag(p, "best-seller");
  const label = cornerLabel(p);
  const available = !!variant?.availableForSale;
  const price = money(p.priceRange.minVariantPrice);
  const compareAt = p.compareAtPriceRange ? money(p.compareAtPriceRange.minVariantPrice) : 0;
  const many = p.variants.length > 1;
  // Shopify packshots (absolute CDN URLs) win; the bundled stand-in photo does not.
  const realPhoto = !!p.featuredImage?.url.startsWith("http");
  return (
    <li className="flex flex-col">
      <div className="relative">
        <Link
          to="/products/$handle"
          params={{ handle: p.handle }}
          tabIndex={-1}
          aria-hidden="true"
          className="group/tile relative block aspect-[4/5] overflow-hidden"
          style={{ background: look?.backdrop ?? "var(--sand)" }}
        >
          {realPhoto && p.featuredImage ? (
            <ProductImage
              image={p.featuredImage}
              alt={p.featuredImage.altText ?? p.title}
              className="h-full w-full"
            />
          ) : look ? (
            <Pouch look={look} className="absolute inset-x-[16%] top-[10%] h-[82%] w-[68%]" />
          ) : (
            <Img media={art.fallback} sizes={sizes ?? "20rem"} className="h-full w-full" />
          )}
          <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 [@media(hover:hover)_and_(pointer:fine)]:group-hover/tile:opacity-100">
            <Img
              media={art.fallback}
              sizes={sizes ?? "(min-width: 1024px) 20rem, 70vw"}
              className="h-full w-full"
            />
          </span>
        </Link>
        {bestSeller && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 grid h-14 w-14 place-items-center rounded-full bg-rose text-center text-[0.6rem] font-medium uppercase leading-[1.15] tracking-[0.08em] text-wine">
            Best
            <br />
            seller
          </span>
        )}
        {label && (
          <span className="pointer-events-none absolute right-3 top-3 z-10 bg-surface px-2.5 py-1 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-wine">
            {label}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center px-1 pt-5 text-center">
        <h3 className="text-[0.88rem] font-medium uppercase leading-snug tracking-[0.18em]">
          <Link
            to="/products/$handle"
            params={{ handle: p.handle }}
            className="underline-offset-4 hover:underline"
          >
            {p.title}
          </Link>
        </h3>
        {p.rating && (
          <p className="mt-2 flex items-center gap-2 text-[0.8rem] text-ink/75">
            <Stars value={p.rating.value} size={14} />
            <span>{p.rating.count.toLocaleString("en-IN")} reviews</span>
          </p>
        )}
        <p className="mt-1.5 text-[0.88rem] uppercase tracking-[0.12em]">
          {many && <span>{home.products.from} </span>}
          {inr(price)}
          {compareAt > price && (
            <span className="ml-2 text-muted-foreground line-through">{inr(compareAt)}</span>
          )}
        </p>
        <div className="mt-auto w-full pt-4">
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
