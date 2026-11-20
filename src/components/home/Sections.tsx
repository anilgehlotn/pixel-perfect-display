import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { campaign, home, productDetails, rituals, trust } from "@/data/content";
import { media } from "@/data/media";
import type { Product } from "@/lib/shopify/types";
import { BuyBox } from "@/components/product/BuyBox";
import { usePurchase } from "@/components/product/purchase";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionIntro } from "@/components/product/Blocks";
import { Icon } from "@/components/product/icons";
import { ProductImage } from "@/components/site/ProductImage";
import { Img, PlayPill, VideoDialog } from "./media";

/* 2. BENEFIT STRIP: gold band with true facts. Wraps on phones, never scrolls sideways. */
export function TrustBar() {
  return (
    <section aria-label="Why SkinFusion" className="bg-gold-deep text-white">
      <ul className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3.5 md:px-6">
        {trust.map((t) => (
          <li key={t.label} className="flex items-center gap-2 text-[0.8rem] tracking-[0.04em]">
            <Icon name={t.icon} size={18} className="shrink-0" />
            {t.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* 3. SHOP BY RITUAL: arch-framed photos (like a jharokha window), one per product. */
export function ShopByRitual({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="ritual-shop-title" className="bg-blush px-4 py-16 md:px-6 lg:py-20">
      <div className="mx-auto max-w-[80rem]">
        <SectionIntro id="ritual-shop-title" eyebrow={rituals.eyebrow} title={rituals.title} />
        <ul
          data-anim="cards"
          className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 lg:mt-12 [&>li]:w-[62%] [&>li]:shrink-0 [&>li]:snap-start md:[&>li]:w-auto"
        >
          {rituals.items.map((r) => {
            const p = products.find((x) => x.handle === r.handle);
            const img = media.rituals[r.handle];
            if (!p) return null;
            return (
              <li key={r.handle}>
                <Link
                  to="/products/$handle"
                  params={{ handle: r.handle }}
                  className="zoom group block text-center"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-t-full bg-sand">
                    {img && (
                      <Img
                        media={img}
                        sizes="(min-width: 768px) 18rem, 62vw"
                        className="h-full w-full"
                      />
                    )}
                  </div>
                  <p className="mt-4 font-serif text-xl text-green">{r.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground underline-offset-4 group-hover:underline">
                    {p.title}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* 4. BESTSELLERS: product cards from getProducts(). Swipe on phones, four columns on desktop. */
export function Bestsellers({ products }: { products: Product[] }) {
  return (
    <section id="shop" aria-labelledby="shop-title" className="scroll-mt-28 py-16 lg:py-20">
      <div className="px-4 md:px-6">
        <SectionIntro id="shop-title" eyebrow={home.products.eyebrow} title={home.products.title} />
      </div>
      <ul
        data-anim="cards"
        className="no-scrollbar mx-auto mt-10 flex max-w-[80rem] snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:px-6 lg:mt-12 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible [&>li]:w-[72%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-[44%] lg:[&>li]:w-auto"
      >
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </ul>
    </section>
  );
}

/* 5. FEATURED: the signature tea with its pack choice, bought right here. */
export function FeaturedRitual({ product }: { product: Product }) {
  const purchase = usePurchase(product);
  const details = productDetails[product.handle];
  const art = media.products[product.handle] ?? media.productDefault;
  return (
    <section
      id="bundle"
      aria-labelledby="featured-intro"
      className="scroll-mt-28 bg-blush px-4 py-16 md:px-6 lg:py-20"
    >
      <SectionIntro
        id="featured-intro"
        eyebrow={home.featured.eyebrow}
        title={home.featured.title}
      />
      <div className="mx-auto mt-10 grid max-w-[68rem] items-center gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-16">
        <div
          data-anim="media"
          className="relative aspect-square overflow-hidden rounded-t-full bg-sand"
        >
          {product.featuredImage ? (
            <ProductImage
              image={product.featuredImage}
              alt={product.featuredImage.altText ?? product.title}
              className="h-full w-full"
            />
          ) : (
            <Img
              media={art.fallback}
              sizes="(min-width: 1024px) 34rem, 100vw"
              className="h-full w-full"
            />
          )}
        </div>
        <div className="min-w-0">
          <BuyBox
            product={product}
            details={details}
            purchase={purchase}
            compact
            heading={<h3 className="headline text-green">{product.title}</h3>}
          />
        </div>
      </div>
    </section>
  );
}

/* CAMPAIGN BANNER: wide photo with copy, like a magazine spread. */
export function CampaignBanner() {
  return (
    <section aria-labelledby="campaign-title" className="px-4 py-16 md:px-6 lg:py-20">
      <div className="relative mx-auto grid max-w-[80rem] overflow-hidden bg-green text-cream lg:grid-cols-[1.1fr_1fr]">
        <div data-anim="media" className="aspect-[16/10] overflow-hidden lg:aspect-auto">
          <Img
            media={media.campaign}
            sizes="(min-width: 1024px) 44rem, 100vw"
            className="h-full w-full"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <p data-anim="fade" className="text-sm tracking-[0.08em] text-rose">
            {campaign.eyebrow}
          </p>
          <h2 id="campaign-title" data-anim="fade" className="headline mt-3 text-cream">
            {campaign.title}
          </h2>
          <p data-anim="fade" className="mt-5 leading-relaxed text-cream/85">
            {campaign.text}
          </p>
          <div data-anim="fade" className="mt-8">
            <Link to={campaign.cta.href} className="btn btn-cream">
              {campaign.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* LEARN: three journal-style cards. The first plays the TCM 101 film. */
export function Learn() {
  const copy = home.learn;
  const [open, setOpen] = useState(false);
  const images = [media.tcm.thumbnail, media.ingredients.jujube, media.reviews[0]];
  return (
    <section
      id="learn"
      aria-labelledby="learn-title"
      className="scroll-mt-28 bg-blush px-4 py-16 md:px-6 lg:py-20"
    >
      <div className="mx-auto max-w-[80rem]">
        <SectionIntro id="learn-title" title={copy.title} />
        <ul data-anim="cards" className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8 lg:mt-12">
          {copy.cards.map((c, i) => {
            const img = images[i];
            return (
              <li key={c.title} className="flex flex-col bg-surface">
                <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                  {img && (
                    <Img
                      media={img}
                      sizes="(min-width: 768px) 26rem, 100vw"
                      className="h-full w-full"
                    />
                  )}
                  {c.kind === "video" && (
                    <PlayPill
                      label={home.tcm.play}
                      onClick={() => setOpen(true)}
                      className="absolute bottom-4 left-4"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-medium tracking-[0.08em] text-gold-deep">{c.tag}</p>
                  <h3 className="mt-2 font-serif text-[1.4rem] leading-snug">{c.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-ink/80">{c.text}</p>
                  {c.kind === "video" ? (
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="mt-4 inline-flex min-h-11 items-center self-start text-sm font-medium text-green underline underline-offset-[6px]"
                    >
                      {c.cta}
                    </button>
                  ) : (
                    <a
                      href={c.href}
                      className="mt-4 inline-flex min-h-11 items-center self-start text-sm font-medium text-green underline underline-offset-[6px]"
                    >
                      {c.cta}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <VideoDialog
        video={media.tcm.video}
        title={home.tcm.videoTitle}
        open={open}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}
