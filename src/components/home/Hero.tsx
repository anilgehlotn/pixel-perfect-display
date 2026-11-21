import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { hero } from "@/data/content";
import { media } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { Stars } from "@/components/site/Stars";
import { Img } from "./media";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * 1. HERO: SkinFusion's idea as something you can touch. The frame is split between a photo
 * of serum bottles (left, "On your face") and the cup of tea (right, "In your cup"); a
 * handle in the middle drags the split (pointer, touch, or arrow keys through a real range
 * input). On load the split sweeps from the serum side to the tea side once, so visitors see
 * it move. The headline "Don't apply your skin care. Drink it." sits over the middle.
 *
 * Motion is transform-only: the serum layer is a wrapper shifted left and its photo shifted
 * back by the same amount. Reduced motion: no sweep (the handle still works). Without
 * JavaScript: a still 50/50 split.
 */
export function Hero({ featured }: { featured: Product }) {
  const [split, setSplit] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // One sweep on load: 82% serum to 38% serum, after the intro loader when it shows.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intro = document.documentElement.dataset["intro"];
    const wait = intro === "desktop" ? 1500 : intro === "mobile" ? 950 : 350;
    let raf = 0;
    let stopped = false;
    const from = 82;
    const to = 38;
    const ms = 2200;
    const timer = window.setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        if (stopped || dragging.current) return;
        const t = Math.min(1, (now - start) / ms);
        const eased = 1 - Math.pow(1 - t, 4);
        setSplit(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      setSplit(from);
      raf = requestAnimationFrame(step);
    }, wait);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const moveTo = (clientX: number) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    setSplit(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  };

  const price = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  const c = hero.compare;

  return (
    <section aria-labelledby="hero-title" className="px-4 pt-24 md:px-6 md:pt-28">
      <div
        ref={frame}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("a,button,input")) return;
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        className="relative mx-auto h-[min(calc(100dvh-7rem),46rem)] min-h-[34rem] max-w-[84rem] touch-pan-y select-none overflow-hidden rounded-card bg-ink text-cream"
      >
        {/* Tea (full frame, underneath). */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="hero-settle h-full w-full" style={d(0)}>
            <Img
              media={media.hero.image}
              priority
              sizes="(min-width: 1344px) 84rem, 100vw"
              className="h-full w-full object-[60%_60%]"
            />
          </div>
        </div>

        {/* Serums (on top, cut at the split). Wrapper moves left, photo moves back. */}
        <div
          className="absolute inset-0 overflow-hidden"
          aria-hidden="true"
          style={{ transform: `translateX(${split - 100}%)` }}
        >
          <div className="h-full w-full" style={{ transform: `translateX(${100 - split}%)` }}>
            <Img
              media={media.hero.serum}
              sizes="(min-width: 1344px) 84rem, 100vw"
              className="h-full w-full object-[35%_60%] grayscale-[35%]"
            />
          </div>
        </div>

        {/* Shade for the copy. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink/60"
        />

        {/* Side labels. */}
        <p
          className="hero-ease pointer-events-none absolute bottom-8 left-8 hidden max-w-[15rem] text-left sm:block"
          style={d(1500)}
        >
          <span className="label-caps block text-cream/80">{c.left.tag}</span>
          <span className="mt-1 block text-sm leading-snug sm:text-base">{c.left.text}</span>
        </p>
        <p
          className="hero-ease pointer-events-none absolute bottom-8 right-8 hidden max-w-[15rem] text-right sm:block lg:right-32"
          style={d(1650)}
        >
          <span className="label-caps block text-cream/80">{c.right.tag}</span>
          <span className="mt-1 block text-sm leading-snug sm:text-base">{c.right.text}</span>
        </p>

        {/* The handle: a line and a round grip, driven by a real range input. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ transform: `translateX(${split}%)` }}
        >
          <span className="absolute inset-y-0 left-0 w-px bg-cream/80" />
          <span className="absolute left-0 top-[93%] grid h-12 w-12 sm:top-[80%] sm:h-14 sm:w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream text-green shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
            <span className="flex">
              <CaretLeft size={16} weight="bold" />
              <CaretRight size={16} weight="bold" />
            </span>
          </span>
        </div>
        <label className="sr-only" htmlFor="hero-compare">
          {c.label}
        </label>
        <input
          id="hero-compare"
          type="range"
          min={4}
          max={96}
          step={1}
          value={Math.round(split)}
          onChange={(e) => setSplit(Number(e.target.value))}
          className="peer absolute inset-x-0 top-[93%] z-20 h-14 -translate-y-1/2 cursor-ew-resize opacity-0 sm:top-[80%]"
        />

        {/* Headline and button, centred over the split. */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center px-6 pt-12 text-center sm:pt-16 lg:pt-20">
          <p className="hero-ease label-caps text-cream/85" style={d(250)}>
            {hero.kicker}
          </p>
          <h1
            id="hero-title"
            aria-label={hero.title}
            className="display mt-5 text-cream max-sm:text-[2.6rem] lg:text-[4.75rem]"
          >
            {hero.titleLines.map((lineText, li) => (
              <span key={lineText} aria-hidden="true" className="block">
                {lineText.split(" ").map((w, wi, arr) => (
                  <span key={wi} className="inline-block overflow-hidden pb-[0.1em] align-top">
                    <span className="hero-word inline-block" style={d(450 + li * 420 + wi * 90)}>
                      {w}
                      {wi < arr.length - 1 ? " " : ""}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p
            className="hero-ease mt-4 max-w-md leading-relaxed text-cream/90 sm:text-lg"
            style={d(1100)}
          >
            {hero.line}
          </p>
          <div
            className="hero-ease pointer-events-auto mt-7 flex flex-col items-center gap-3"
            style={d(1250)}
          >
            <a href={hero.shopCta.href} className="btn btn-primary">
              {hero.shopCta.label}
            </a>
            {featured.rating && (
              <span className="hidden items-center gap-2 text-sm text-cream/85 sm:flex">
                <Stars value={featured.rating.value} size={13} />
                {featured.rating.value.toFixed(1)} from{" "}
                {featured.rating.count.toLocaleString("en-IN")} {hero.ratingLabel},{" "}
                {hero.from.toLowerCase()} {inr(price)}
                {mrp > price && <span className="line-through">{inr(mrp)}</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
