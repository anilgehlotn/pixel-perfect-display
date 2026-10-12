import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "@phosphor-icons/react";
import { home } from "@/data/content";
import { media } from "@/data/media";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { cornerLabel, hasTag, money, type Product } from "@/lib/shopify/types";
import { ProductImage } from "@/components/site/ProductImage";
import { Img, LoopVideo, PlayPill, VideoDialog } from "./media";

/* 3. PRODUCT ROW: products from getProducts(). Swipe on phones, four columns on desktop. */
export function ProductRow({ products }: { products: Product[] }) {
  return (
    <section id="shop" aria-labelledby="shop-title" className="section-y scroll-mt-20">
      <div className="container-x">
        <h2 id="shop-title" data-anim="lines" className="title max-w-xl">
          {home.products.title}
        </h2>
      </div>
      <ul
        data-anim="cards"
        className="no-scrollbar mx-auto mt-10 flex max-w-[80rem] snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 md:mt-14 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible"
      >
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </ul>
    </section>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const variant = p.variants[0];
  const art = media.products[p.handle] ?? media.productDefault;
  const badge = hasTag(p, "best-seller") ? "Best seller" : null;
  const label = cornerLabel(p);
  const available = !!variant?.availableForSale;
  return (
    <li data-video-hover className="lift w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
      <div className="relative">
        <LoopVideo
          video={art.video}
          trigger="hover"
          className="aspect-[4/5] w-full rounded-card bg-blush"
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
              sizes="(min-width: 1024px) 18rem, 78vw"
              className="h-full w-full"
            />
          )}
        </LoopVideo>
        {(badge || label) && (
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            {badge && (
              <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-green">
                {badge}
              </span>
            )}
            {label && (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                {label}
              </span>
            )}
          </div>
        )}
      </div>
      <h3 className="mt-5 px-1 text-xl leading-snug">{p.title}</h3>
      <p className="mt-1 px-1 text-muted-foreground">
        {home.products.from} {inr(money(p.priceRange.minVariantPrice))}
      </p>
      <button
        type="button"
        onClick={() => variant && add(p, variant)}
        disabled={!available}
        className="btn btn-outline mt-5 w-full"
      >
        {available ? home.products.cta : "Sold out"}
      </button>
    </li>
  );
}

/* 4. BUNDLE: copy and a 2x2 collage. The button adds the 4-pouch pack. */
export function Bundle({ product }: { product: Product }) {
  const { add } = useCart();
  const pack = product.variants.find((v) => v.title === home.bundle.variantTitle);
  const [a, b, c, d] = media.bundle;
  return (
    <section id="bundle" aria-labelledby="bundle-title" className="scroll-mt-20 px-4 md:px-6">
      <div className="mx-auto grid max-w-[84rem] items-center gap-10 rounded-card bg-blush p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-16">
        <div className="max-w-md">
          <h2 id="bundle-title" data-anim="lines" className="title">
            {home.bundle.title}
          </h2>
          <p data-anim="fade" className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {home.bundle.text}
          </p>
          {pack && (
            <div data-anim="fade" className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => add(product, pack)}
                disabled={!pack.availableForSale}
                className="btn btn-primary"
              >
                {home.bundle.cta}
              </button>
              <p className="text-muted-foreground">
                {inr(money(pack.price))}
                {pack.compareAtPrice && (
                  <span className="ml-2 line-through">{inr(money(pack.compareAtPrice))}</span>
                )}
              </p>
            </div>
          )}
        </div>
        <div data-anim="cards" className="grid grid-cols-2 gap-3 sm:gap-4">
          {a && (
            <div className="aspect-square overflow-hidden rounded-[1.5rem]">
              <Img media={a} sizes="(min-width: 1024px) 18rem, 45vw" className="h-full w-full" />
            </div>
          )}
          {b && (
            <div className="aspect-square overflow-hidden rounded-full">
              <Img media={b} sizes="(min-width: 1024px) 18rem, 45vw" className="h-full w-full" />
            </div>
          )}
          {c && (
            <div className="aspect-square overflow-hidden rounded-[1.5rem] rounded-tl-full">
              <Img media={c} sizes="(min-width: 1024px) 18rem, 45vw" className="h-full w-full" />
            </div>
          )}
          {d && (
            <div className="aspect-square overflow-hidden rounded-[1.5rem]">
              <Img media={d} sizes="(min-width: 1024px) 18rem, 45vw" className="h-full w-full" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* 5. HOW IT WORKS: deep green block, true-fact counters, steeping video, two columns. */
export function HowItWorks() {
  const copy = home.howItWorks;
  return (
    <section
      id="ingredients"
      aria-labelledby="ingredients-title"
      className="section-y scroll-mt-20 px-4 md:px-6"
    >
      <div className="mx-auto grid max-w-[84rem] gap-12 rounded-card bg-green p-6 text-cream sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:p-16">
        <div className="flex flex-col">
          <h2 id="ingredients-title" data-anim="lines" className="title max-w-xl text-cream">
            {copy.title}
          </h2>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-cream/20 py-8">
            {copy.facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="order-2 mt-2 text-sm leading-snug text-cream/85">{f.label}</dt>
                <dd data-count className="display order-1 text-cream">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
          <div data-anim="cards" className="mt-10 grid gap-8 sm:grid-cols-2">
            {copy.columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xl text-cream">{col.title}</h3>
                <p className="mt-3 leading-relaxed text-cream/85">{col.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div data-anim="media" className="overflow-hidden rounded-card">
          <LoopVideo
            video={media.howItWorks.video}
            className="aspect-[4/5] h-full w-full rounded-card bg-green-soft lg:aspect-auto lg:min-h-[32rem]"
          />
        </div>
      </div>
    </section>
  );
}

/* 6. TCM 101: stacked copy, then a wide video thumbnail with a play pill (video modal). */
export function Tcm101() {
  const copy = home.tcm;
  const [open, setOpen] = useState(false);
  return (
    <section id="learn" aria-labelledby="learn-title" className="section-y scroll-mt-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="learn-title" data-anim="lines" className="title">
            {copy.title}
          </h2>
          <p data-anim="fade" className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {copy.text}
          </p>
          <div data-anim="fade" className="mt-8">
            <Link to={copy.cta.href} className="btn btn-outline">
              {copy.cta.label}
            </Link>
          </div>
        </div>
        <div
          data-anim="media"
          className="relative mt-12 aspect-[4/5] overflow-hidden rounded-card bg-beige sm:aspect-[16/9] md:mt-16"
        >
          <Img
            media={media.tcm.thumbnail}
            sizes="(min-width: 1280px) 80rem, 100vw"
            className="h-full w-full"
          />
          <PlayPill
            label={copy.play}
            onClick={() => setOpen(true)}
            className="absolute bottom-5 left-5 md:bottom-8 md:left-8"
          />
        </div>
      </div>
      <VideoDialog
        video={media.tcm.video}
        title={copy.videoTitle}
        open={open}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}

/* 8. SOURCING: location label, heading, large rounded image. Origin copy is demo. */
export function Sourcing() {
  const copy = home.sourcing;
  return (
    <section id="sourcing" aria-labelledby="sourcing-title" className="section-y scroll-mt-20">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div data-anim="media" className="overflow-hidden rounded-card bg-beige">
          <Img
            media={media.sourcing}
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="aspect-[4/5] w-full lg:aspect-square"
          />
        </div>
        <div className="max-w-md">
          <p
            data-anim="fade"
            className="label-caps flex items-center gap-2.5 text-muted-foreground"
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
            {copy.location}
          </p>
          <h2 id="sourcing-title" data-anim="lines" className="title mt-5">
            {copy.title}
          </h2>
          <p data-anim="fade" className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {copy.text}
          </p>
          <Link
            to={copy.cta.href}
            data-anim="fade"
            className="group mt-8 inline-flex min-h-11 items-center gap-2 font-medium text-green underline underline-offset-4"
          >
            {copy.cta.label}
            <ArrowRight size={18} weight="light" className="arrow-nudge" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* 9. CLOSING CTA: a soft bookend. */
export function ClosingCta() {
  const copy = home.closing;
  return (
    <section aria-labelledby="closing-title" className="px-4 pb-16 md:px-6 md:pb-24">
      <div className="mx-auto grid max-w-[84rem] items-center gap-10 overflow-hidden rounded-card bg-blush p-6 sm:p-10 lg:grid-cols-[1fr_1.3fr_1fr] lg:gap-12 lg:p-14">
        <div data-anim="media" className="hidden overflow-hidden rounded-stadium lg:block">
          <Img media={media.closing.portrait} sizes="18rem" className="aspect-[3/4.5] w-full" />
        </div>
        <div className="text-center">
          <h2 id="closing-title" data-anim="lines" className="display">
            {copy.title}
          </h2>
          <p data-anim="fade" className="mx-auto mt-5 max-w-sm text-lg text-muted-foreground">
            {copy.line}
          </p>
          <div data-anim="fade" className="mt-8">
            <a href={copy.cta.href} className="btn btn-primary">
              {copy.cta.label}
            </a>
          </div>
        </div>
        <div
          data-anim="media"
          className="mx-auto w-2/3 overflow-hidden rounded-full sm:w-1/2 lg:w-full"
        >
          <Img
            media={media.closing.circle}
            sizes="(min-width: 1024px) 18rem, 50vw"
            className="aspect-square w-full"
          />
        </div>
      </div>
    </section>
  );
}
