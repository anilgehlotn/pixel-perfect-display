import { Link } from "@tanstack/react-router";
import { home } from "@/data/content";
import { media } from "@/data/media";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { cornerLabel, hasTag, money, type Product } from "@/lib/shopify/types";
import { ProductImage } from "@/components/site/ProductImage";
import { Stars } from "@/components/site/Stars";
import { Img, LoopVideo } from "@/components/home/media";

/**
 * Product tile: square photo (a short video plays on hover / in view), round "Best seller"
 * badge, name, rating, price and a full-width "Add to cart" (first variant). The photo and
 * name open the product page.
 */
export function ProductCard({ p, sizes }: { p: Product; sizes?: string }) {
  const { add } = useCart();
  const variant = p.variants[0];
  const art = media.products[p.handle] ?? media.productDefault;
  const bestSeller = hasTag(p, "best-seller");
  const label = cornerLabel(p);
  const available = !!variant?.availableForSale;
  const price = money(p.priceRange.minVariantPrice);
  const compareAt = p.compareAtPriceRange ? money(p.compareAtPriceRange.minVariantPrice) : 0;
  const many = p.variants.length > 1;
  return (
    <li data-video-hover className="flex flex-col">
      <div className="relative">
        <Link
          to="/products/$handle"
          params={{ handle: p.handle }}
          tabIndex={-1}
          aria-hidden="true"
          className="zoom block overflow-hidden bg-beige"
        >
          <LoopVideo video={art.video} trigger="hover" className="aspect-[4/5] w-full">
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
          </LoopVideo>
        </Link>
        {bestSeller && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 grid h-16 w-16 place-items-center rounded-full bg-rose text-center text-[0.62rem] font-medium uppercase leading-tight tracking-[0.12em] text-ink">
            Best
            <br />
            seller
          </span>
        )}
        {label && (
          <span className="pointer-events-none absolute right-3 top-3 z-10 bg-surface px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-jujube">
            {label}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center px-1 pt-5 text-center">
        <h3 className="text-[0.95rem] font-medium uppercase leading-snug tracking-[0.14em]">
          <Link
            to="/products/$handle"
            params={{ handle: p.handle }}
            className="underline-offset-4 hover:underline"
          >
            {p.title}
          </Link>
        </h3>
        {p.rating && (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={p.rating.value} size={13} />
            <span>{p.rating.count.toLocaleString("en-IN")} reviews</span>
          </p>
        )}
        <p className="mt-2 tracking-[0.06em]">
          {many && <span className="text-muted-foreground">{home.products.from} </span>}
          {inr(price)}
          {compareAt > price && (
            <span className="ml-2 text-muted-foreground line-through">{inr(compareAt)}</span>
          )}
        </p>
        <div className="mt-auto w-full pt-5">
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
