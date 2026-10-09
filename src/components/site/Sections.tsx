import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Star,
  Check,
  X,
  ArrowRight,
  HandHeart,
  Plant,
  HouseLine,
  Leaf,
  Drop,
  Sun,
} from "@phosphor-icons/react";
import {
  images,
  hero,
  inside,
  comparison,
  standards,
  mission,
  reviews,
  journal,
} from "@/data/content";
import { cornerLabel, hasTag, money, type Product } from "@/lib/shopify/types";
import { useCart } from "@/lib/cart/context";
import { rs } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span role="img" className="inline-flex text-primary" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} weight={s <= Math.round(value) ? "fill" : "light"} />
      ))}
    </span>
  );
}

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={`grid place-items-center bg-beige ${className}`}>
      <span className="label-caps px-4 text-center text-[0.65rem] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Heading({
  kicker,
  title,
  center = true,
}: {
  kicker?: string;
  title: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      {kicker && (
        <p data-anim="fade" className="label-caps text-muted-foreground">
          {kicker}
        </p>
      )}
      <h2 data-anim="heading" className="mt-3 text-xl md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

/* 2. HERO */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const kicker = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const delayMs = takeIntroDelay();
      // First page load without the intro: the hero is already on screen, keep it static.
      if (delayMs === null && !isHydrated()) return;
      const parts = {
        section: section.current,
        image: image.current,
        kicker: kicker.current,
        heading: heading.current,
        actions: actions.current,
      };
      if (Object.values(parts).some((el) => !el)) return;
      let played = false;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        // Play once; crossing a breakpoint later must not replay it.
        if (isReduced || played) return;
        played = true;
        let cleanup = () => {};
        safely("hero", Object.values(parts), () => {
          cleanup = heroEntrance(parts as HeroParts, isDesktop ? "desktop" : "mobile", {
            delayMs: delayMs ?? 0,
            withChrome: delayMs !== null,
          });
        });
        return cleanup;
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative min-h-[100dvh] overflow-hidden bg-beige">
      <img
        ref={image}
        src={images.hero}
        alt="Glass cups of golden tea with jujubes, snow fungus, goji berries and pink blossoms on a peach surface"
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-hero-scrim" />
      <div className="absolute bottom-[18%] left-[6%] right-[6%] max-w-xl text-on-image md:bottom-[22%]">
        <p ref={kicker} className="label-caps text-[0.7rem]">
          {hero.kicker}
        </p>
        <h1 ref={heading} className="mt-4 text-[28px] md:text-[40px]">
          {hero.title}
        </h1>
        <div ref={actions} className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
          <a href="#featured" className="btn btn-primary">
            {hero.cta}
          </a>
          <Link
            to="/quiz"
            className="btn border border-on-image text-on-image hover:bg-on-image hover:text-ink"
          >
            {hero.quizCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* 3. POPULAR TEAS */
function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const variant = p.variants[0];
  const hoverImage = p.images[1];
  const badge = hasTag(p, "best-seller") ? "Best Seller" : null;
  const label = cornerLabel(p);
  const compareAt = p.compareAtPriceRange?.minVariantPrice;
  return (
    <article className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[calc(25%-18px)]">
      <div className="group relative aspect-[4/5] overflow-hidden bg-beige">
        {p.featuredImage ? (
          <ProductImage
            image={p.featuredImage}
            alt={`${p.title} pouch`}
            className="absolute inset-0 h-full w-full transition-[transform,opacity] duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <Placeholder
            label={`${p.title} image coming soon`}
            className="absolute inset-0 h-full w-full"
          />
        )}
        {hoverImage && (
          <ProductImage
            image={hoverImage}
            alt=""
            className="absolute inset-0 h-full w-full opacity-0 transition-[transform,opacity] duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}
        {badge && (
          <span className="label-caps absolute left-3 top-3 grid h-16 w-16 place-items-center rounded-full bg-primary text-center text-[0.55rem] leading-tight text-primary-foreground">
            {badge}
          </span>
        )}
        {label && (
          <span className="label-caps absolute right-3 top-3 bg-primary px-2.5 py-1 text-[0.6rem] text-primary-foreground">
            {label}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-center text-sm">{p.title}</h3>
      {p.rating && (
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Stars value={p.rating.value} /> (<span data-count>{p.rating.count}</span>)
        </div>
      )}
      <p className="mt-2 text-center">
        <span>{rs(money(p.priceRange.minVariantPrice))}</span>{" "}
        {compareAt && (
          <span className="ml-2 text-muted-foreground line-through">{rs(money(compareAt))}</span>
        )}
      </p>
      <button
        onClick={() => variant && add(p, variant)}
        disabled={!variant?.availableForSale}
        className="btn btn-primary mt-4 w-full"
      >
        {variant?.availableForSale ? "Add to cart" : "Sold out"}
      </button>
    </article>
  );
}

export function PopularTeas({ products }: { products: Product[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = () => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <section id="shop" className="section-y scroll-mt-32">
      <div className="container-x">
        <Heading kicker="Skin rituals from nature" title="Popular teas" />
        <div className="relative mt-12">
          <div
            ref={track}
            data-anim="cards"
            className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 lg:mx-0 lg:px-0"
          >
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          <button
            onClick={scroll}
            aria-label="Next products"
            className="absolute -right-2 top-[38%] hidden h-12 w-12 place-items-center rounded-full border bg-background md:grid lg:-right-6"
          >
            <ArrowRight size={20} weight="light" />
          </button>
        </div>
        <div className="mt-12 text-center">
          <a href="#featured" className="btn btn-primary">
            Shop all
          </a>
        </div>
      </div>
    </section>
  );
}

/* 4. FEATURED */
export function FeaturedProduct({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const { add } = useCart();
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const first = product.variants[0];
  return (
    <section id="featured" className="section-y scroll-mt-32 border-t">
      <div className="container-x">
        <Heading kicker="Meet your new daily ritual" title={product.title} />
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div data-anim="fade" className="bg-beige">
            {product.featuredImage && (
              <ProductImage
                image={product.featuredImage}
                loading="eager"
                className="aspect-[4/5] w-full"
              />
            )}
          </div>
          <div data-anim="fade" className="self-center">
            <h3 className="text-lg md:text-xl">{product.title}</h3>
            {product.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{product.subtitle}</p>
            )}
            {product.rating && (
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Stars value={product.rating.value} />{" "}
                <span data-count>{product.rating.value}</span> ·{" "}
                <span data-count>{product.rating.count}</span> reviews
              </div>
            )}
            {first && (
              <p className="mt-5 text-xl">
                {rs(money(first.price))}{" "}
                {first.compareAtPrice && (
                  <span className="ml-2 text-base text-muted-foreground line-through">
                    {rs(money(first.compareAtPrice))}
                  </span>
                )}
              </p>
            )}
            <p className="mt-5 max-w-[65ch] text-muted-foreground">{product.description}</p>
            <div className="mt-8 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Pack size">
              {product.variants.map((x) => (
                <button
                  key={x.id}
                  role="radio"
                  aria-checked={variant?.id === x.id}
                  onClick={() => setVariantId(x.id)}
                  className={`min-h-20 border px-2 py-3 text-center transition-colors ${variant?.id === x.id ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-foreground"}`}
                >
                  <span className="label-caps block text-[0.65rem]">{x.title}</span>
                  {x.note && (
                    <span className="mt-1 block text-[0.7rem] leading-tight">{x.note}</span>
                  )}
                </button>
              ))}
            </div>
            {variant && (
              <button
                onClick={() => add(product, variant, 1, { openDrawer: true })}
                disabled={!variant.availableForSale}
                className="btn btn-primary mt-6 w-full"
              >
                {variant.availableForSale
                  ? `Add to cart · ${rs(money(variant.price))}`
                  : "Sold out"}
              </button>
            )}
            <a href="#inside" className="label-caps mt-5 inline-block underline underline-offset-4">
              View product details
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 5. WHAT'S INSIDE */
export function WhatsInside() {
  return (
    <section id="inside" className="grid scroll-mt-32 lg:grid-cols-2">
      <div className="flex items-center bg-background px-6 py-16 lg:px-16 lg:py-32 xl:px-24">
        <div className="max-w-xl">
          <p data-anim="fade" className="label-caps text-muted-foreground">
            {inside.kicker}
          </p>
          <h2 data-anim="heading" className="mt-3 text-xl md:text-3xl">
            {inside.title}
          </h2>
          <ul data-anim="cards" className="mt-8 space-y-4">
            {inside.items.map((i) => (
              <li key={i.name} className="max-w-[65ch] text-muted-foreground">
                <span className="label-caps mr-2 text-foreground">{i.name}.</span>
                {i.line}
              </li>
            ))}
          </ul>
          <a
            href="#featured"
            data-anim="fade"
            className="label-caps mt-8 inline-block underline underline-offset-4"
          >
            Try the Skin Glow Tea
          </a>
        </div>
      </div>
      <img
        src={images.inside}
        alt="Hands pouring golden tea from a glass teapot at a sunlit table"
        loading="lazy"
        className="aspect-[4/5] h-full w-full object-cover lg:aspect-auto"
      />
    </section>
  );
}

/* 6. US VS THEM */
export function UsVsThem() {
  return (
    <section className="section-y">
      <div className="container-x max-w-4xl">
        <Heading title={comparison.title} />
        <div data-anim="fade" className="mt-12">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b pb-4">
            <span />
            {comparison.columns.map((c, k) => (
              <span
                key={c}
                className={`label-caps text-center text-[0.65rem] ${k ? "text-muted-foreground" : ""}`}
              >
                {c}
              </span>
            ))}
          </div>
          {comparison.rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-b py-5"
            >
              <span>{r.label}</span>
              {r.values.map((v, k) => (
                <span key={k} className="flex justify-center">
                  {v ? (
                    <Check size={22} weight="light" className="text-primary" aria-label="Yes" />
                  ) : (
                    <X size={20} weight="light" className="text-muted-foreground" aria-label="No" />
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 7. OUR STANDARDS */
const stdIcons = {
  hand: HandHeart,
  plant: Plant,
  house: HouseLine,
  leaf: Leaf,
  drop: Drop,
  sun: Sun,
};
const stdTones = {
  peach: "bg-pastel-peach",
  pink: "bg-pastel-pink",
  blue: "bg-pastel-blue",
  green: "bg-pastel-green",
  orange: "bg-pastel-orange",
  yellow: "bg-pastel-yellow",
};
export function OurStandards() {
  return (
    <section className="section-y border-t">
      <div className="container-x">
        <Heading title="Our standards" />
        <div
          data-anim="cards"
          className="mt-14 grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-6"
        >
          {standards.map((s) => {
            const I = stdIcons[s.icon];
            return (
              <div key={s.label} className="flex flex-col items-center text-center">
                <span
                  className={`grid h-24 w-24 place-items-center rounded-full ${stdTones[s.tone]}`}
                >
                  <I size={34} weight="light" />
                </span>
                <span className="label-caps mt-5 max-w-[12ch] text-[0.68rem]">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* 8. MISSION */
export function OurMission() {
  return (
    <section id="mission" className="section-y scroll-mt-32 bg-blush">
      <div className="container-x max-w-3xl text-center">
        <h2 data-anim="heading" className="text-xl md:text-3xl">
          Our mission
        </h2>
        <p data-anim="fade" className="mx-auto mt-8 text-lg leading-relaxed md:text-xl">
          {mission}
        </p>
        <a
          href="#journal"
          data-anim="fade"
          className="label-caps mt-8 inline-block underline underline-offset-4"
        >
          Learn more
        </a>
      </div>
    </section>
  );
}

/* 9. REVIEWS */
export function Reviews() {
  return (
    <section className="section-y">
      <div className="container-x">
        <Heading title="What our customers say" />
        <div
          data-anim="fade"
          className="mx-auto mt-12 grid max-w-3xl items-center gap-10 md:grid-cols-2"
        >
          <div className="text-center">
            <p data-count className="text-6xl font-light">
              {reviews.average}
            </p>
            <div className="mt-3">
              <Stars value={reviews.average} size={20} />
            </div>
            <p data-count className="mt-2 text-sm text-muted-foreground">
              {reviews.totalLabel}
            </p>
            <p data-count className="label-caps mt-4 text-[0.68rem]">
              {reviews.recommend}
            </p>
          </div>
          <div className="space-y-2">
            {reviews.bars.map((b) => (
              <div
                key={b.stars}
                className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 text-sm"
              >
                <span>{b.stars} star</span>
                <div className="h-1.5 overflow-hidden bg-beige">
                  <div
                    className="h-full origin-left bg-primary"
                    style={{ transform: `scaleX(${b.pct / 100})` }}
                  />
                </div>
                <span className="text-right text-muted-foreground">
                  <span data-count>{b.pct}</span>%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div data-anim="cards" className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.items.map((r) => (
            <article key={r.name} className="border bg-background p-7">
              <Stars value={r.rating} />
              <h3 className="mt-4 text-sm">{r.title}</h3>
              <p className="mt-3 text-muted-foreground">{r.text}</p>
              <p className="label-caps mt-6 text-[0.65rem]">
                {r.name} · {r.city}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 10. JOURNAL */
export function Journal() {
  return (
    <section id="journal" className="section-y scroll-mt-32 border-t">
      <div className="container-x">
        <Heading kicker={journal.kicker} title={journal.title} />
        <div data-anim="tilt" className="mt-12 grid gap-10 md:grid-cols-3">
          {journal.items.map((j) => (
            <article key={j.title} className="group">
              <div className="overflow-hidden bg-beige">
                <img
                  src={j.image}
                  alt={j.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <p className="label-caps mt-5 text-[0.65rem] text-muted-foreground">{j.tag}</p>
              <h3 className="mt-2 text-sm leading-relaxed">{j.title}</h3>
              <p className="mt-2 line-clamp-2 text-muted-foreground">{j.excerpt}</p>
              <a
                href="#journal"
                className="label-caps mt-4 inline-block text-[0.68rem] underline underline-offset-4"
              >
                Read more
              </a>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a href="#journal" className="btn btn-primary">
            View all articles
          </a>
        </div>
      </div>
    </section>
  );
}
