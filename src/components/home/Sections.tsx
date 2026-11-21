import { useRef, useState } from "react";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Leaf,
  LockSimple,
  Pause,
  Play,
  ThermometerHot,
  Timer,
  Truck,
} from "@phosphor-icons/react";
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

/* 5. INGREDIENTS: deep green block. Heading and intro, the four ingredients as arch-shaped
   photo cards (number, name, hanzi and pinyin, a taste line), then the true facts, how to make
   a cup in three steps and a link to the product. */
const STEP_ICONS = [Leaf, ThermometerHot, Timer];

export function HowItWorks() {
  const copy = home.howItWorks;
  return (
    <section
      id="ingredients"
      aria-labelledby="ingredients-title"
      className="section-y scroll-mt-20 px-4 md:px-6"
    >
      <div className="mx-auto max-w-[84rem] rounded-card bg-green p-5 text-cream sm:p-10 lg:p-16">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
          <h2 id="ingredients-title" data-anim="lines" className="title text-cream">
            {copy.title}
          </h2>
          <p data-anim="fade" className="max-w-lg text-lg leading-relaxed text-cream/85">
            {copy.text}
          </p>
        </div>

        <ul
          data-anim="cards"
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-14 lg:grid-cols-4"
        >
          {ingredients.map((ing, i) => (
            <li
              key={ing.name}
              className="group flex flex-col rounded-[1.5rem] border border-cream/10 bg-cream/[0.06] p-2.5 sm:p-4"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-b-[1rem] rounded-t-full bg-green-soft">
                <Img
                  media={media.ingredients[ing.image]}
                  sizes="(min-width: 1024px) 18rem, 45vw"
                  className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-2 px-1">
                <h3 className="text-lg text-cream sm:text-xl">{ing.name}</h3>
                <span aria-hidden="true" className="text-xs text-cream/50 tabular-nums">
                  0{i + 1}
                </span>
              </div>
              <p className="px-1 text-sm text-cream/65">
                <span lang="zh">{ing.hanzi}</span> {ing.pinyin}
              </p>
              <p className="mt-2 px-1 pb-1 text-sm leading-snug text-cream/90">{ing.taste}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-8 border-t border-cream/15 pt-8 lg:mt-14 lg:grid-cols-[0.9fr_1.6fr] lg:gap-16 lg:pt-10">
          <dl className="grid grid-cols-3 gap-4 self-start">
            {copy.facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="order-2 mt-1 text-sm leading-snug text-cream/80">{f.label}</dt>
                <dd
                  data-count
                  className="order-1 text-[clamp(2.5rem,1.8rem+2.4vw,4rem)] leading-none text-cream tabular-nums"
                >
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
          <div data-anim="fade">
            <h3 className="text-xl text-cream">{copy.steps.title}</h3>
            <ol className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {copy.steps.items.map((s, i) => {
                const Icon = STEP_ICONS[i] ?? Leaf;
                return (
                  <li
                    key={s}
                    className="flex items-center gap-3 rounded-[1.25rem] bg-cream px-3.5 py-2.5 text-green sm:px-4 sm:py-3.5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green text-cream sm:h-10 sm:w-10">
                      <Icon aria-hidden="true" weight="light" className="h-5 w-5" />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-xs text-muted-foreground">
                        {copy.steps.step} {i + 1}
                      </span>
                      <span>{s}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-relaxed text-cream/75">{copy.steps.note}</p>
              <Link to={copy.cta.href} className="btn btn-primary shrink-0">
                {copy.cta.label}
              </Link>
            </div>
          </div>
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
            <span className="sr-only"> about {copy.title.toLowerCase()}</span>
            <ArrowRight size={18} weight="light" className="arrow-nudge" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* 9. CLOSING CTA: a blush bookend that sells. Headline, a short line and three trust points on
   the left; a card for the featured product (photo, rating, price, saving, Add to cart, View
   details) on the right, framed by two photos on desktop. */
const TRUST_ICONS = { truck: Truck, lock: LockSimple, leaf: Leaf } as const;

export function ClosingCta({ product }: { product: Product }) {
  const copy = home.closing;
  const { add } = useCart();
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const price = money(product.priceRange.minVariantPrice);
  const mrp = product.compareAtPriceRange ? money(product.compareAtPriceRange.minVariantPrice) : 0;
  const off = variant ? savePercent(variant) : 0;
  return (
    <section aria-labelledby="closing-title" className="px-4 pb-16 md:px-6 md:pb-24">
      <div className="mx-auto grid max-w-[84rem] items-center gap-10 overflow-hidden rounded-card bg-blush p-5 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:p-16">
        <div>
          <h2 id="closing-title" data-anim="lines" className="display">
            {copy.title}
          </h2>
          <p
            data-anim="fade"
            className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            {copy.line}
          </p>
          <ul data-anim="cards" className="mt-8 space-y-3">
            {copy.trust.map((item) => {
              const Icon = TRUST_ICONS[item.icon as keyof typeof TRUST_ICONS] ?? Leaf;
              return (
                <li key={item.text} className="flex items-center gap-3 text-foreground">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-green">
                    <Icon aria-hidden="true" weight="light" className="h-5 w-5" />
                  </span>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:px-10 lg:py-8">
          {/* Two photos frame the card on desktop. */}
          <div
            aria-hidden="true"
            className="absolute -left-2 top-0 hidden h-[78%] w-[42%] overflow-hidden rounded-stadium lg:block"
          >
            <Img media={media.closing.portrait} sizes="16rem" className="h-full w-full" />
          </div>
          <div
            aria-hidden="true"
            className="absolute -right-2 bottom-0 hidden aspect-square w-[38%] overflow-hidden rounded-full lg:block"
          >
            <Img media={media.closing.circle} sizes="14rem" className="h-full w-full" />
          </div>

          <article
            data-anim="fade"
            className="relative mx-auto max-w-sm rounded-[1.75rem] bg-surface p-3 shadow-[0_20px_60px_-30px_rgba(30,77,58,0.35)]"
          >
            <Link
              to="/products/$handle"
              params={{ handle: product.handle }}
              className="block overflow-hidden rounded-[1.25rem] bg-beige"
            >
              {product.featuredImage && (
                <ProductImage
                  image={product.featuredImage}
                  alt={product.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
            </Link>
            <div className="px-3 pb-3 pt-4">
              {product.rating && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stars value={product.rating.value} size={13} />
                  {product.rating.value.toFixed(1)} ({product.rating.count.toLocaleString("en-IN")}{" "}
                  {copy.reviews})
                </p>
              )}
              <h3 className="mt-2 text-xl text-green">
                <Link to="/products/$handle" params={{ handle: product.handle }}>
                  {product.title}
                </Link>
              </h3>
              {product.subtitle && (
                <p className="text-sm text-muted-foreground">{product.subtitle}</p>
              )}
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm text-muted-foreground">{copy.from}</span>
                <span className="text-2xl text-foreground tabular-nums">{inr(price)}</span>
                {mrp > price && (
                  <span className="text-muted-foreground line-through tabular-nums">
                    {inr(mrp)}
                  </span>
                )}
                {off > 0 && (
                  <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-medium text-green">
                    {copy.save} {off}%
                  </span>
                )}
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {variant && (
                  <button
                    type="button"
                    disabled={!variant.availableForSale}
                    onClick={() => add(product, variant, 1, { openDrawer: true })}
                    aria-label={`${copy.add}: ${product.title}, ${variant.title}`}
                    className="btn btn-primary flex-1"
                  >
                    {copy.add}
                  </button>
                )}
                <Link
                  to="/products/$handle"
                  params={{ handle: product.handle }}
                  className="btn btn-outline flex-1"
                >
                  {copy.details}
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
