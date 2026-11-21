import { useRef, useState } from "react";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Pause, Play } from "@phosphor-icons/react";
import { home, howItWorks, ingredientStrip, ingredients } from "@/data/content";
import { media } from "@/data/media";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { cornerLabel, hasTag, money, type Product, type ProductVariant } from "@/lib/catalog/types";
import { pouches, savePercent } from "@/components/product/purchase";
import { ProductImage } from "@/components/site/ProductImage";
import { Stars } from "@/components/site/Stars";
import { Img, LoopVideo, PlayPill, VideoDialog } from "./media";
import { SkinLayers } from "./SkinLayers";
import { useWhyEdibleStory } from "@/lib/animations/why-edible";

/* INGREDIENT STRIP: a slow moving line of the ingredients and promises under the hero.
   Desktop with a mouse: it moves (paused off-screen and in hidden tabs). Phones and reduced
   motion: still. The second copy is decorative. */
export function IngredientStrip() {
  const ref = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  usePauseWhenHidden(ref);
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {ingredientStrip.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span>{item}</span>
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
        </li>
      ))}
    </ul>
  );
  return (
    <section
      ref={ref}
      aria-label="What is in every cup"
      data-paused={paused || undefined}
      className="relative overflow-hidden bg-green py-5 text-cream"
    >
      <div className="strip-move flex w-max text-lg tracking-[-0.01em] md:text-xl">
        {row(false)}
        {row(true)}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play moving strip" : "Pause moving strip"}
        className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-green text-cream/80 ring-1 ring-cream/25 hover:text-cream lg:grid"
      >
        {paused ? (
          <Play size={12} weight="fill" aria-hidden="true" />
        ) : (
          <Pause size={12} weight="fill" aria-hidden="true" />
        )}
      </button>
    </section>
  );
}

/* 2. WHY EDIBLE (#how-it-works): SkinFusion's idea in one picture. The skin-layers drawing
   plays when it scrolls into view; three short points say the same thing in words. */
export function WhyEdible() {
  const copy = howItWorks;
  const scope = useRef<HTMLElement>(null);
  useWhyEdibleStory(scope);
  return (
    <section
      id="how-it-works"
      ref={scope}
      aria-labelledby="how-title"
      className="section-y scroll-mt-20 px-4 md:px-6"
    >
      <div className="mx-auto grid max-w-[80rem] gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
        <div className="max-w-lg">
          <h2 id="how-title" data-anim="lines" className="title">
            {copy.title}
          </h2>
          <p data-anim="fade" className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {copy.text}
          </p>
          <ul className="mt-7 space-y-4">
            {copy.points.map((pt) => (
              <li key={pt.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                />
                <p>
                  <span className="font-medium text-green">{pt.title}.</span>{" "}
                  <span className="text-muted-foreground">{pt.text}</span>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <a href={copy.cta.href} className="btn btn-primary">
              {copy.cta.label}
            </a>
          </div>
        </div>
        <div data-why-art>
          <div data-why-card className="overflow-hidden rounded-card bg-blush p-3 sm:p-8">
            <SkinLayers className="mx-auto w-full max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}

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

/**
 * Product card: a short video plays over the photo on hover (desktop) or in view (phones).
 * The picture and the name open the product page; rating, price with the MRP crossed out and
 * the saving help people decide; "Add to cart" adds the first pack.
 */
export function ProductCard({ p, sizes }: { p: Product; sizes?: string }) {
  const { add } = useCart();
  const variant = p.variants[0];
  const art = media.products[p.handle] ?? media.productDefault;
  const badge = hasTag(p, "best-seller") ? "Best seller" : null;
  const label = cornerLabel(p);
  const available = !!variant?.availableForSale;
  const price = money(p.priceRange.minVariantPrice);
  const mrp = p.compareAtPriceRange ? money(p.compareAtPriceRange.minVariantPrice) : 0;
  const off = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  return (
    <li data-video-hover className="lift w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
      <div className="relative">
        <Link
          to="/products/$handle"
          params={{ handle: p.handle }}
          tabIndex={-1}
          aria-hidden="true"
          className="block"
        >
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
                sizes={sizes ?? "(min-width: 1024px) 18rem, 78vw"}
                className="h-full w-full"
              />
            )}
          </LoopVideo>
        </Link>
        {(badge || label) && (
          <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
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
      {p.rating && (
        <p className="mt-5 flex items-center gap-2 px-1 text-sm text-muted-foreground">
          <Stars value={p.rating.value} size={14} />
          <span>
            {p.rating.value.toFixed(1)} ({p.rating.count.toLocaleString("en-IN")})
          </span>
        </p>
      )}
      <h3 className="mt-2 px-1 text-xl leading-snug">
        <Link
          to="/products/$handle"
          params={{ handle: p.handle }}
          className="underline-offset-4 hover:underline"
        >
          {p.title}
        </Link>
      </h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 px-1">
        <span className="text-muted-foreground">{home.products.from}</span>
        <span className="text-foreground">{inr(price)}</span>
        {mrp > price && (
          <span className="text-sm text-muted-foreground line-through">{inr(mrp)}</span>
        )}
        {off > 0 && (
          <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-medium text-green">
            Save {off}%
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={() => variant && add(p, variant)}
        disabled={!available}
        aria-label={available ? `${home.products.cta}: ${p.title}` : undefined}
        className="btn btn-outline mt-5 w-full"
      >
        {available ? home.products.cta : "Sold out"}
      </button>
    </li>
  );
}

/* 4. BUNDLE: a pack picker. One card per pack with price, saving, price per cup and its own
   "Add to cart"; the biggest pack is highlighted. Stacked on phones, three columns from md. */
export function Bundle({ product }: { product: Product }) {
  const { add } = useCart();
  const copy = home.bundle;
  const bags = Number(/(\d+)\s*tea bags/.exec(product.subtitle ?? "")?.[1] ?? 0);
  const best = product.variants.reduce<ProductVariant | undefined>(
    (top, v) => (!top || pouches(v) > pouches(top) ? v : top),
    undefined,
  );
  return (
    <section id="bundle" aria-labelledby="bundle-title" className="scroll-mt-20 px-4 md:px-6">
      <div className="mx-auto max-w-[84rem] rounded-card bg-blush p-5 sm:p-10 lg:p-14">
        <div className="max-w-2xl">
          <h2 id="bundle-title" data-anim="lines" className="title">
            {copy.title}
          </h2>
          <p data-anim="fade" className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {copy.text}
          </p>
        </div>
        <ul data-anim="cards" className="mt-8 grid gap-3 sm:gap-4 md:mt-10 md:grid-cols-3">
          {product.variants.map((v) => {
            const n = pouches(v);
            const price = money(v.price);
            const off = savePercent(v);
            const top = v.id === best?.id && product.variants.length > 1;
            return (
              <li
                key={v.id}
                className={`relative flex flex-col rounded-[1.5rem] bg-surface p-4 sm:p-6 ${top ? "ring-2 ring-green" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl text-green sm:text-2xl">{v.title}</h3>
                  {top && (
                    <span className="rounded-full bg-green px-3 py-1 text-xs font-medium text-cream">
                      {copy.best}
                    </span>
                  )}
                </div>
                {v.note && <p className="mt-1 text-sm text-muted-foreground">{v.note}</p>}
                <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-5">
                  <span className="text-2xl text-foreground tabular-nums sm:text-3xl">
                    {inr(price)}
                  </span>
                  {v.compareAtPrice && money(v.compareAtPrice) > price && (
                    <span className="text-muted-foreground line-through tabular-nums">
                      {inr(money(v.compareAtPrice))}
                    </span>
                  )}
                  {off > 0 && (
                    <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-medium text-green">
                      {copy.save} {off}%
                    </span>
                  )}
                </p>
                {bags > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                    {inr(price / (bags * n))} {copy.perCup}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => add(product, v)}
                  disabled={!v.availableForSale}
                  aria-label={`${copy.cta}: ${product.title}, ${v.title}`}
                  className={`btn mt-4 w-full sm:mt-6 ${top ? "btn-primary" : "btn-outline"}`}
                >
                  {copy.cta}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* 5. INGREDIENTS: deep green block. The four ingredients as round photos, the true facts,
   and how to make a cup in three short steps. */
export function HowItWorks() {
  const copy = home.howItWorks;
  return (
    <section
      id="ingredients"
      aria-labelledby="ingredients-title"
      className="section-y scroll-mt-20 px-4 md:px-6"
    >
      <div className="mx-auto grid max-w-[84rem] gap-10 rounded-card bg-green p-6 text-cream sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:p-16">
        <div className="flex flex-col">
          <h2 id="ingredients-title" data-anim="lines" className="title max-w-xl text-cream">
            {copy.title}
          </h2>
          <p data-anim="fade" className="mt-5 max-w-lg text-lg leading-relaxed text-cream/85">
            {copy.text}
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-cream/20 py-6">
            {copy.facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="order-2 mt-1 text-sm leading-snug text-cream/85">{f.label}</dt>
                <dd
                  data-count
                  className="order-1 text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] leading-none text-cream tabular-nums"
                >
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
          <div data-anim="fade" className="mt-8">
            <h3 className="text-xl text-cream">{copy.steps.title}</h3>
            <ol className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {copy.steps.items.map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-full border border-cream/30 py-2 pl-2 pr-4 text-sm">
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-cream text-xs font-medium text-green"
                    >
                      {i + 1}
                    </span>
                    {s}
                  </span>
                  {i < copy.steps.items.length - 1 && (
                    <ArrowRight
                      aria-hidden="true"
                      weight="light"
                      className="hidden h-4 w-4 text-cream/60 sm:block"
                    />
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/75">{copy.steps.note}</p>
          </div>
        </div>
        <ul
          data-anim="cards"
          className="grid grid-cols-2 content-center gap-x-4 gap-y-8 sm:gap-x-8"
        >
          {ingredients.map((ing) => (
            <li key={ing.name} className="flex flex-col items-center text-center">
              <div className="aspect-square w-full max-w-[9.5rem] overflow-hidden rounded-full bg-green-soft sm:max-w-[13rem]">
                <Img
                  media={media.ingredients[ing.image]}
                  sizes="(min-width: 1024px) 13rem, 40vw"
                  className="h-full w-full"
                />
              </div>
              <p className="mt-4 text-lg text-cream">{ing.name}</p>
              <p className="text-sm text-cream/70">
                <span lang="zh">{ing.hanzi}</span> {ing.pinyin}
              </p>
            </li>
          ))}
        </ul>
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
            <span className="sr-only"> about {copy.title.toLowerCase()}</span>
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
