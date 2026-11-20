import { useState } from "react";
import { home, packaging, productDetails, trust } from "@/data/content";
import { media } from "@/data/media";
import type { Product } from "@/lib/shopify/types";
import { BuyBox } from "@/components/product/BuyBox";
import { usePurchase } from "@/components/product/purchase";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionIntro } from "@/components/product/Blocks";
import { Icon } from "@/components/product/icons";
import { Pouch } from "@/components/product/Pouch";
import { Img, PlayPill, VideoDialog } from "./media";

/* 2. TRUST STRIP: four true facts under the hero. Two columns on phones. */
export function TrustBar() {
  return (
    <section aria-label="Why SkinFusion" className="border-b border-ink/10">
      <ul className="mx-auto grid max-w-[80rem] grid-cols-2 gap-y-4 px-4 py-5 md:grid-cols-4 md:px-6">
        {trust.map((t) => (
          <li
            key={t.label}
            className="flex items-center justify-center gap-2.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.16em] md:text-[0.75rem]"
          >
            <Icon name={t.icon} size={20} className="shrink-0 text-wine" />
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
    <section id="shop" aria-labelledby="shop-title" className="scroll-mt-28 py-16 lg:py-24">
      <div className="px-4 md:px-6">
        <SectionIntro id="shop-title" eyebrow={home.products.eyebrow} title={home.products.title} />
      </div>
      <ul
        data-anim="cards"
        className="no-scrollbar mx-auto mt-10 flex max-w-[80rem] snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:px-6 lg:mt-14 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible [&>li]:w-[74%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-[44%] lg:[&>li]:w-auto"
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
  const look = packaging[product.handle];
  return (
    <section id="bundle" aria-labelledby="featured-intro" className="scroll-mt-28 pb-16 lg:pb-24">
      <div className="px-4 md:px-6">
        <SectionIntro
          id="featured-intro"
          eyebrow={home.featured.eyebrow}
          title={home.featured.title}
        />
      </div>
      <div className="mx-auto mt-10 grid max-w-[68rem] items-center gap-10 px-4 md:px-6 lg:mt-14 lg:grid-cols-2 lg:gap-16">
        <div
          data-anim="media"
          className="relative aspect-square overflow-hidden"
          style={{ background: look?.backdrop ?? "var(--sand)" }}
        >
          {look && (
            <Pouch look={look} className="absolute inset-x-[22%] top-[9%] h-[84%] w-[56%]" />
          )}
          <div className="absolute bottom-[8%] right-[6%] w-[30%] overflow-hidden rounded-full border-4 border-surface">
            <Img media={media.ingredients.jujube} sizes="12rem" className="aspect-square w-full" />
          </div>
          <span className="absolute left-4 top-4 grid h-16 w-16 place-items-center rounded-full bg-rose text-center text-[0.62rem] font-medium uppercase leading-[1.15] tracking-[0.06em] text-wine">
            {home.featured.badge.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </span>
        </div>
        <div className="min-w-0">
          <BuyBox
            product={product}
            details={details}
            purchase={purchase}
            compact
            heading={<h3 className="headline">{product.title}</h3>}
          />
        </div>
      </div>
    </section>
  );
}

/* 5. MISSION: full-bleed photograph with the brand's reason for being. */
export function Mission() {
  const copy = home.mission;
  return (
    <section aria-labelledby="mission-title" className="relative isolate overflow-hidden">
      <Img
        media={media.mission}
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full object-[50%_40%]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/45" />
      <div className="mx-auto flex min-h-[30rem] max-w-xl flex-col items-center justify-center px-6 py-20 text-center text-cream lg:min-h-[36rem]">
        <h2 id="mission-title" data-anim="fade" className="title text-cream">
          {copy.title}
        </h2>
        <p data-anim="fade" className="mt-6 text-[1.05rem] font-medium leading-relaxed">
          {copy.text}
        </p>
        <a
          href={copy.cta.href}
          data-anim="fade"
          className="mt-8 inline-flex min-h-11 items-center text-[0.8rem] font-medium uppercase tracking-[0.18em] underline underline-offset-[6px]"
        >
          {copy.cta.label}
        </a>
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
      className="scroll-mt-28 px-4 py-16 md:px-6 lg:py-24"
    >
      <div className="mx-auto max-w-[80rem]">
        <SectionIntro id="learn-title" title={copy.title} />
        <ul data-anim="cards" className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-14">
          {copy.cards.map((c, i) => {
            const img = images[i];
            return (
              <li key={c.title} className="flex flex-col">
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
                <p className="mt-5 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {c.tag}
                </p>
                <h3 className="mt-2 text-[1.05rem] font-medium uppercase leading-snug tracking-[0.14em]">
                  {c.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-ink/80">{c.text}</p>
                {c.kind === "video" ? (
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="mt-4 inline-flex min-h-11 items-center self-start text-sm underline underline-offset-[6px]"
                  >
                    {c.cta}
                  </button>
                ) : (
                  <a
                    href={c.href}
                    className="mt-4 inline-flex min-h-11 items-center self-start text-sm underline underline-offset-[6px]"
                  >
                    {c.cta}
                  </a>
                )}
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
