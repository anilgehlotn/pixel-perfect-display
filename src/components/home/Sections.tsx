import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { home, productDetails, trust } from "@/data/content";
import { media } from "@/data/media";
import type { Product } from "@/lib/shopify/types";
import { BuyBox } from "@/components/product/BuyBox";
import { usePurchase } from "@/components/product/purchase";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionIntro } from "@/components/product/Blocks";
import { Icon } from "@/components/product/icons";
import { Img, PlayPill, VideoDialog } from "./media";

/* 2. TRUST STRIP: four true facts under the hero. Two columns on phones. */
export function TrustBar() {
  return (
    <section aria-label="Why SkinFusion" className="border-b bg-surface">
      <ul className="mx-auto grid max-w-[80rem] grid-cols-2 gap-y-5 px-4 py-6 md:grid-cols-4 md:px-6 md:py-7">
        {trust.map((t) => (
          <li
            key={t.label}
            className="flex items-center justify-center gap-3 text-center text-[0.72rem] font-medium uppercase tracking-[0.16em] md:text-xs"
          >
            <Icon name={t.icon} size={22} className="shrink-0 text-jujube" />
            {t.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* 3. BESTSELLERS: product cards from getProducts(). Swipe on phones, four columns on desktop. */
export function Bestsellers({ products }: { products: Product[] }) {
  return (
    <section id="shop" aria-labelledby="shop-title" className="scroll-mt-24 section-y">
      <div className="px-4 md:px-6">
        <SectionIntro id="shop-title" eyebrow={home.products.eyebrow} title={home.products.title} />
      </div>
      <ul
        data-anim="cards"
        className="no-scrollbar mx-auto mt-12 flex max-w-[80rem] snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:px-6 lg:mt-16 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible [&>li]:w-[72%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-[44%] lg:[&>li]:w-auto"
      >
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </ul>
    </section>
  );
}

/* 4. FEATURED RITUAL: the featured product with its pack choice, bought right here. */
export function FeaturedRitual({ product }: { product: Product }) {
  const purchase = usePurchase(product);
  const details = productDetails[product.handle];
  const art = media.products[product.handle] ?? media.productDefault;
  return (
    <section
      id="bundle"
      aria-labelledby="featured-title"
      className="scroll-mt-24 bg-surface section-y px-4 md:px-6"
    >
      <div className="mx-auto grid max-w-[80rem] items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div data-anim="media" className="relative">
          <div className="aspect-square overflow-hidden bg-blush">
            <Img
              media={art.fallback}
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="h-full w-full"
            />
          </div>
          <div className="absolute -bottom-6 -right-2 w-[34%] overflow-hidden rounded-full border-[6px] border-surface sm:-right-6 lg:-bottom-10 lg:-right-10">
            <Img media={media.ingredients.jujube} sizes="14rem" className="aspect-square w-full" />
          </div>
        </div>
        <div className="min-w-0 max-w-xl">
          <p className="label-caps text-jujube">{home.featured.eyebrow}</p>
          <div className="mt-6">
            <BuyBox
              product={product}
              details={details}
              purchase={purchase}
              compact
              heading={
                <h2 id="featured-title" className="headline">
                  {product.title}
                </h2>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* TCM 101: wide video thumbnail with a play button (full-screen dialog) and copy. */
export function Tcm101() {
  const copy = home.tcm;
  const [open, setOpen] = useState(false);
  return (
    <section
      id="learn"
      aria-labelledby="learn-title"
      className="scroll-mt-24 section-y px-4 md:px-6"
    >
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div
          data-anim="media"
          className="relative aspect-[4/3] overflow-hidden bg-beige lg:aspect-[16/11]"
        >
          <Img
            media={media.tcm.thumbnail}
            sizes="(min-width: 1024px) 46rem, 100vw"
            className="h-full w-full"
          />
          <PlayPill
            label={copy.play}
            onClick={() => setOpen(true)}
            className="absolute bottom-5 left-5 md:bottom-8 md:left-8"
          />
        </div>
        <div>
          <p data-anim="fade" className="label-caps text-jujube">
            {copy.eyebrow}
          </p>
          <h2 id="learn-title" data-anim="lines" className="headline mt-4">
            {copy.title}
          </h2>
          <p
            data-anim="fade"
            className="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            {copy.text}
          </p>
          <button
            type="button"
            data-anim="fade"
            onClick={() => setOpen(true)}
            className="group link-caps mt-7 text-ink"
          >
            {copy.cta.label}
            <ArrowRight size={16} weight="light" className="arrow-nudge" aria-hidden="true" />
          </button>
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

/* SOURCING: tall photo and origin copy (demo until the client confirms). */
export function Sourcing() {
  const copy = home.sourcing;
  return (
    <section
      id="sourcing"
      aria-labelledby="sourcing-title"
      className="scroll-mt-24 bg-beige px-4 md:px-6"
    >
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 py-16 lg:grid-cols-2 lg:gap-24 lg:py-24">
        <div data-anim="media" className="overflow-hidden">
          <Img
            media={media.sourcing}
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="aspect-[4/5] w-full lg:aspect-[5/6]"
          />
        </div>
        <div className="max-w-md">
          <p data-anim="fade" className="label-caps flex items-center gap-2.5 text-jujube">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-jujube" />
            {copy.location}
          </p>
          <h2 id="sourcing-title" data-anim="lines" className="headline mt-5">
            {copy.title}
          </h2>
          <p
            data-anim="fade"
            className="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            {copy.text}
          </p>
          <a href={copy.cta.href} data-anim="fade" className="group link-caps mt-7 text-ink">
            {copy.cta.label}
            <ArrowRight size={16} weight="light" className="arrow-nudge" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* CLOSING CTA: jujube bookend before the footer. */
export function ClosingCta() {
  const copy = home.closing;
  return (
    <section
      aria-labelledby="closing-title"
      className="relative overflow-hidden bg-jujube text-cream"
    >
      <div className="grid items-stretch lg:grid-cols-2">
        <div className="px-6 py-16 text-center lg:py-28 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-16 lg:text-left">
          <p data-anim="fade" className="label-caps text-cream/80">
            {copy.eyebrow}
          </p>
          <h2 id="closing-title" data-anim="lines" className="display mt-5 text-cream">
            {copy.title}
          </h2>
          <p data-anim="fade" className="mx-auto mt-5 max-w-sm text-lg text-cream/85 lg:mx-0">
            {copy.line}
          </p>
          <div data-anim="fade" className="mt-9">
            <a href={copy.cta.href} className="btn btn-cream">
              {copy.cta.label}
            </a>
          </div>
        </div>
        <div data-anim="media" className="hidden h-full overflow-hidden lg:block">
          <Img media={media.closing} sizes="50vw" className="h-full min-h-[32rem] w-full" />
        </div>
      </div>
    </section>
  );
}
