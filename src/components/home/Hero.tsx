import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { hero } from "@/data/content";
import { media, type MediaImage } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { Stars } from "@/components/site/Stars";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img } from "./media";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const clamp = (v: number) => Math.min(97, Math.max(3, v));

/**
 * 1. HERO: two worlds, one word. Full screen, split between the serum world (left: cool,
 * grey) and the tea world (right: warm). Each world carries its own copy of the giant word in
 * the same place, "apply." and "drink.", so where the divider cuts through, one word turns
 * into the other.
 *
 * - On load (after the intro loader): the divider sweeps from the serum side into the tea
 *   side once, so "apply." becomes "drink." in front of the visitor.
 * - Desktop with a mouse: the divider then follows the pointer, eased.
 * - Touch: drag anywhere on the hero. Keyboard: a real range input (arrow keys).
 * - Transform-only: the serum layer's wrapper and content shift by opposite amounts.
 * - Reduced motion: no sweep or follow; drag and keys still work. No JavaScript: the full
 *   tea world ("drink."), never a word cut in half.
 */
export function Hero({ featured }: { featured: Product }) {
  // Starts fully in the tea world, so the still page shows the whole word "drink.".
  const [split, setSplit] = useState(3);
  const frame = useRef<HTMLElement>(null);
  const target = useRef(3);
  const current = useRef(3);
  const mode = useRef<"intro" | "follow" | "drag" | "still">("intro");
  const raf = useRef(0);
  usePauseWhenHidden(frame);

  // Eased follow loop: moves `current` toward `target` and renders.
  const run = () => {
    cancelAnimationFrame(raf.current);
    const tick = () => {
      const diff = target.current - current.current;
      if (Math.abs(diff) < 0.05) {
        current.current = target.current;
        setSplit(current.current);
        return;
      }
      current.current += diff * 0.12;
      setSplit(current.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      mode.current = "still";
      return;
    }
    const intro = document.documentElement.dataset["intro"];
    const wait = intro === "desktop" ? 1300 : intro === "mobile" ? 800 : 250;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      // Show the serum world, then sweep into the tea world.
      const start = performance.now();
      const a = current.current;
      const step = (now: number) => {
        if (cancelled || mode.current !== "intro") return;
        const t = Math.min(1, (now - start) / 2800);
        // 0 to 0.3: slide to the serum side; 0.3 to 1: long sweep to the tea side.
        const v =
          t < 0.3
            ? a + (96 - a) * (1 - Math.pow(1 - t / 0.3, 3))
            : 96 + (22 - 96) * (1 - Math.pow(1 - (t - 0.3) / 0.7, 4));
        current.current = v;
        target.current = v;
        setSplit(v);
        if (t < 1) raf.current = requestAnimationFrame(step);
        else mode.current = "follow";
      };
      raf.current = requestAnimationFrame(step);
    }, wait);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Desktop: scrolling down slides the divider into the tea world, ending on "drink.".
  const section = frame;
  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (!isDesktop || isReduced) return;
        let from = 0;
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom 40%",
          onEnter: () => (from = target.current),
          onUpdate: (self) => {
            if (mode.current === "intro" || mode.current === "drag") return;
            if (self.progress < 0.02) return;
            target.current = from + (3 - from) * self.progress;
            run();
          },
          onLeaveBack: () => (from = target.current),
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const xToSplit = (clientX: number) => {
    const r = frame.current?.getBoundingClientRect();
    return r ? clamp(((clientX - r.left) / r.width) * 100) : 50;
  };
  const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const price = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  const c = hero.compare;

  return (
    <section
      data-hero-compare
      ref={frame}
      aria-labelledby="hero-title"
      onPointerMove={(e) => {
        if (mode.current === "drag" || (mode.current === "follow" && e.pointerType === "mouse")) {
          target.current = xToSplit(e.clientX);
          if (mode.current === "drag") {
            current.current = target.current;
            setSplit(target.current);
          } else run();
        }
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a,button,input")) return;
        if (e.pointerType === "mouse" && finePointer()) return;
        cancelAnimationFrame(raf.current);
        mode.current = "drag";
        current.current = target.current = xToSplit(e.clientX);
        setSplit(current.current);
      }}
      onPointerUp={() => mode.current === "drag" && (mode.current = "follow")}
      onPointerCancel={() => mode.current === "drag" && (mode.current = "follow")}
      className="relative h-[100dvh] min-h-[38rem] touch-pan-y select-none overflow-hidden bg-ink text-cream"
    >
      {/* Tea world (full frame, underneath). */}
      <World side="right" media={media.hero.image} featured={featured} />

      {/* Serum world (on top, cut at the divider): wrapper shifts left, content shifts back. */}
      <div
        className="absolute inset-0 z-[1] overflow-hidden"
        data-serum-outer
        style={{ transform: `translateX(${split - 100}%)` }}
      >
        <div
          data-serum-inner
          className="absolute inset-0"
          style={{ transform: `translateX(${100 - split}%)` }}
        >
          <World side="left" media={media.hero.serum} featured={featured} />
        </div>
      </div>

      {/* Divider and grip. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        data-divider
        style={{ transform: `translateX(${split}%)` }}
      >
        <span className="absolute inset-y-0 left-0 w-px bg-cream/70 shadow-[0_0_24px_rgba(255,255,255,0.6)]" />
        <span className="absolute bottom-[calc(9%+4.25rem)] left-0 hidden -translate-x-full pr-3 text-xs uppercase tracking-[0.2em] text-cream/70 sm:block">
          {c.left.name}
        </span>
        <span className="absolute bottom-[calc(9%+4.25rem)] left-0 hidden pl-3 text-xs uppercase tracking-[0.2em] text-cream sm:block">
          {c.right.name}
        </span>
        <span className="absolute left-0 top-[38%] grid h-14 w-14 -translate-x-1/2 place-items-center sm:bottom-[9%] sm:top-auto rounded-full border border-cream/60 bg-cream/15 text-cream backdrop-blur-md">
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
        min={3}
        max={97}
        step={1}
        value={Math.round(split)}
        onChange={(e) => {
          cancelAnimationFrame(raf.current);
          mode.current = "follow";
          current.current = target.current = Number(e.target.value);
          setSplit(current.current);
        }}
        className="absolute inset-x-0 top-[38%] z-[3] h-14 cursor-ew-resize opacity-0 sm:bottom-[9%] sm:top-auto"
      />

      {/* Shared copy over both worlds (the big word itself lives in each world). */}
      <Column layer="shared" featured={featured} />
    </section>
  );
}

/**
 * The centred column: kicker, "Skin care you", the big word, button and proof. Rendered three
 * times with the same layout so the word lines up exactly: once on top with the real copy and
 * an invisible word (keeps the space), and once inside each world with only the word visible.
 */
function Column({
  layer,
  word,
  outline = false,
  featured,
}: {
  layer: "shared" | "world";
  word?: string;
  outline?: boolean;
  featured: Product;
}) {
  const c = hero.compare;
  const shared = layer === "shared";
  const ghost = shared ? "" : "invisible";
  const price = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  const Title = shared ? "h1" : "div";
  return (
    <div
      aria-hidden={shared ? undefined : true}
      className={`pointer-events-none absolute inset-0 flex flex-col items-center px-6 pb-[18%] pt-28 text-center sm:pb-[12%] lg:pt-32 ${shared ? "z-[2]" : ""}`}
    >
      <p className={`hero-ease label-caps text-cream/80 ${ghost}`} style={d(200)}>
        {hero.kicker}
      </p>
      <Title
        {...(shared ? { id: "hero-title", "aria-label": hero.title } : {})}
        className="mt-auto flex flex-col items-center"
      >
        <span
          aria-hidden="true"
          className={`hero-ease block text-[clamp(1.5rem,1rem+2.2vw,2.75rem)] font-normal tracking-[-0.02em] text-cream ${ghost}`}
          style={d(400)}
        >
          {c.prefix}
        </span>
        <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
          <span
            className={`hero-word block text-[clamp(5rem,2.5rem+15vw,15rem)] leading-[0.95] tracking-[-0.05em] ${shared ? "invisible font-normal" : outline ? "hero-outline font-light" : "font-normal text-cream"}`}
            style={d(550)}
          >
            {word ?? c.right.word}
          </span>
        </span>
      </Title>
      <div
        className={`hero-ease mt-6 flex flex-col items-center gap-3 ${shared ? "pointer-events-auto" : "invisible"}`}
        style={d(900)}
      >
        <a href={hero.shopCta.href} className="btn btn-primary" tabIndex={shared ? undefined : -1}>
          {hero.shopCta.label}
        </a>
        {featured.rating && (
          <span className="hidden items-center gap-2 text-sm text-cream/80 sm:flex">
            <Stars value={featured.rating.value} size={13} />
            {featured.rating.value.toFixed(1)} from {featured.rating.count.toLocaleString("en-IN")}{" "}
            {hero.ratingLabel}, {hero.from.toLowerCase()} {inr(price)}
            {mrp > price && <span className="line-through">{inr(mrp)}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * One world: graded photo, the giant word (in the same place in both worlds), and a caption
 * in its own corner. The serum world is cool and grey; the tea world is warm.
 */
function World({
  side,
  media: m,
  featured,
}: {
  side: "left" | "right";
  media: MediaImage;
  featured: Product;
}) {
  const c = hero.compare[side];
  const left = side === "left";
  return (
    <div className="absolute inset-0">
      <div className="hero-settle absolute inset-0" style={d(0)}>
        <Img
          media={m}
          priority={!left}
          sizes="100vw"
          className={`h-full w-full ${left ? "object-[35%_60%] grayscale-[85%] brightness-[0.8] contrast-[1.05]" : "object-[60%_60%] saturate-[1.15]"}`}
        />
      </div>
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${left ? "bg-gradient-to-b from-ink/60 via-ink/35 to-ink/70" : "bg-gradient-to-b from-ink/45 via-ink/15 to-ink/65"}`}
      />
      <div aria-hidden="true" className="hero-grain absolute inset-0" />
      <Column layer="world" word={c.word} outline={left} featured={featured} />
      <p
        aria-hidden="true"
        className={`hero-ease absolute top-[30%] hidden max-w-[15rem] sm:block ${left ? "left-8 text-left lg:left-12" : "right-8 text-right lg:right-12"}`}
        style={d(1200)}
      >
        <span className="label-caps block text-cream/75">{c.tag}</span>
        <span className="mt-2 block text-[1.05rem] leading-snug text-cream/95">{c.text}</span>
        <span className={`mt-4 flex flex-wrap gap-2 ${left ? "" : "justify-end"}`}>
          {c.facts.map((f) => (
            <span
              key={f}
              className={`rounded-full px-3 py-1 text-xs ${left ? "border border-cream/40 text-cream/80" : "bg-cream text-green"}`}
            >
              {f}
            </span>
          ))}
        </span>
      </p>
      {!left && <Steam />}
    </div>
  );
}

/** Soft steam rising from the cup in the tea world (desktop with a mouse; paused off-screen). */
function Steam() {
  const wisps = [
    "M35 158 C20 128 50 110 35 80 C22 56 45 38 35 8",
    "M60 158 C46 126 76 106 60 76 C48 52 70 34 60 4",
    "M85 158 C70 128 100 110 85 80 C72 56 95 38 85 8",
  ];
  return (
    <svg
      viewBox="0 0 120 160"
      aria-hidden="true"
      className="hero-steam pointer-events-none absolute hidden blur-[7px]"
    >
      <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
        {wisps.map((w, i) => (
          <path key={w} d={w} className="hero-wisp" style={{ animationDelay: `${-i * 2}s` }} />
        ))}
      </g>
    </svg>
  );
}
