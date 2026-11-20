import { useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { hero, ingredients } from "@/data/content";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { Stars } from "@/components/site/Stars";
import { media } from "@/data/media";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img, LoopVideo } from "./media";

/* 1. HERO: headline, one line, two pills, and the floating product composition. */
export function Hero({ featured }: { featured: Product }) {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  usePauseWhenHidden(section);

  useGSAP(
    () => {
      const delayMs = takeIntroDelay();
      // First page load without the intro: the hero is already on screen, keep it static.
      if (delayMs === null && !isHydrated()) return;
      const root = section.current;
      const parts = {
        section: root,
        heading: heading.current,
        line: line.current,
        actions: actions.current,
        pieces: root ? Array.from(root.querySelectorAll<HTMLElement>("[data-piece]")) : [],
      };
      if (!parts.section || !parts.heading || !parts.line || !parts.actions) return;
      let played = false;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        // Play once; crossing a breakpoint later must not replay it.
        if (isReduced || played) return;
        played = true;
        let cleanup = () => {};
        safely("hero", [parts.heading, parts.line, parts.actions, ...parts.pieces], () => {
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

  // Pointer parallax: each [data-mouse] layer drifts by its own amount (desktop only).
  useGSAP(
    () => {
      const root = section.current;
      const pointer = gsap.matchMedia();
      pointer.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (!isDesktop || isReduced || !root) return;
        const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-mouse]")).map((el) => ({
          amount: Number(el.dataset["mouse"]) || 0,
          x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
        }));
        const onMove = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.amount * 2);
            l.y(ny * l.amount * 2);
          });
        };
        root.addEventListener("pointermove", onMove);
        return () => root.removeEventListener("pointermove", onMove);
      });
      return () => pointer.revert();
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      className="container-x grid items-center gap-12 pb-16 pt-28 md:pt-36 lg:min-h-[100dvh] lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:pb-16 lg:pt-28"
    >
      <div className="max-w-xl">
        <h1 ref={heading} className="display">
          {hero.title}
        </h1>
        <p ref={line} className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          {hero.line}
        </p>
        <div ref={actions} className="mt-9 flex flex-wrap gap-3">
          <Link to={hero.shopCta.href} className="btn btn-primary">
            {hero.shopCta.label}
          </Link>
          <Link to={hero.quizCta.href} className="btn btn-outline">
            {hero.quizCta.label}
          </Link>
        </div>
        <HeroProof featured={featured} />
      </div>
      <Composition />
    </section>
  );
}

/** Price and rating under the buttons: what it costs and what customers think, at a glance. */
function HeroProof({ featured }: { featured: Product }) {
  const from = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  return (
    <p data-piece className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      {featured.rating && (
        <span className="flex items-center gap-3 text-muted-foreground">
          <span aria-hidden="true" className="flex -space-x-2.5">
            {media.reviews.map((m) => (
              <Img
                key={m.src}
                media={m}
                sizes="2rem"
                className="h-8 w-8 rounded-full border-2 border-background"
              />
            ))}
          </span>
          <Stars value={featured.rating.value} size={16} />
          <span>
            <span className="font-medium text-foreground">{featured.rating.value.toFixed(1)}</span>{" "}
            from {featured.rating.count.toLocaleString("en-IN")} {hero.ratingLabel}
          </span>
        </span>
      )}
      <span className="text-muted-foreground">
        {hero.from} <span className="text-foreground">{inr(from)}</span>
        {mrp > from && <span className="ml-1.5 line-through">{inr(mrp)}</span>}
      </span>
    </p>
  );
}

const RING_TEXT =
  "SKIN GLOW TEA  •  红枣 JUJUBE  •  银耳 SNOW FUNGUS  •  枸杞 GOJI  •  生姜 GINGER  •  ";

/**
 * Layering, outermost first: entrance (data-piece) > pointer parallax (data-mouse, desktop)
 * > endless CSS motion (orbit, ring, steam; desktop only) > media. One transform per layer.
 */
function Layer({
  className,
  mouse,
  children,
}: {
  className: string;
  mouse: number;
  children: ReactNode;
}) {
  return (
    <div data-piece className={`absolute ${className}`}>
      <div data-mouse={mouse} className="h-full w-full">
        {children}
      </div>
    </div>
  );
}

/**
 * The steeping ritual: the cup in the centre, a seal-like ring of names turning slowly around
 * it, and the four ingredients orbiting (each stays upright). Hovering an ingredient shows its
 * name. The video's pause button stops all of it (data-paused, see styles.css).
 */
function Composition() {
  const [paused, setPaused] = useState(false);
  return (
    <div
      data-paused={paused || undefined}
      className="relative mx-auto aspect-square w-full max-w-[40rem]"
    >
      <Layer className="inset-[7%]" mouse={6}>
        <div className="h-full w-full rounded-full bg-blush" />
      </Layer>

      <Layer className="inset-[2%]" mouse={-8}>
        <svg viewBox="0 0 100 100" aria-hidden="true" className="animate-ring h-full w-full">
          <defs>
            <path id="hero-ring" d="M50 50 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
          </defs>
          <text
            fill="currentColor"
            className="text-green/70"
            fontSize="3.1"
            letterSpacing="0.9"
            fontWeight="500"
          >
            <textPath href="#hero-ring">{RING_TEXT}</textPath>
          </text>
        </svg>
      </Layer>

      <Layer className="inset-[23%] z-10" mouse={14}>
        <div className="relative h-full w-full">
          <div className="h-full w-full overflow-hidden rounded-full border-[6px] border-background">
            <Img
              media={media.hero.centerpiece}
              priority
              sizes="(min-width: 1024px) 22rem, 54vw"
              className="h-full w-full"
            />
          </div>
          <Steam />
        </div>
      </Layer>

      <Layer className="inset-0 z-20" mouse={-18}>
        <div className="animate-orbit relative h-full w-full">
          {ingredients.map((ing, i) => {
            const angle = (i * 90 + 35) * (Math.PI / 180);
            const size = i % 2 ? 17 : 21;
            return (
              <div
                key={ing.name}
                className="absolute"
                style={{
                  width: `${size}%`,
                  left: `${50 + 41 * Math.cos(angle) - size / 2}%`,
                  top: `${50 + 41 * Math.sin(angle) - size / 2}%`,
                }}
              >
                <div className="animate-orbit-counter group relative">
                  <Img
                    media={media.ingredients[ing.image]}
                    sizes="9rem"
                    className="aspect-square w-full rounded-full border-4 border-background"
                  />
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background px-3 py-1 text-xs text-green opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100">
                    <span lang="zh-Hans">{ing.hanzi}</span> {ing.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Layer>

      <Layer className="bottom-[2%] right-[-2%] z-30 w-[30%] lg:right-[-6%]" mouse={22}>
        <LoopVideo
          video={media.hero.video}
          onPausedChange={setPaused}
          className="aspect-[4/5] w-full rounded-card border-4 border-background bg-beige"
        />
      </Layer>
    </div>
  );
}

/** Three soft wisps of steam above the cup (desktop: rising loop; elsewhere: still). */
function Steam() {
  return (
    <svg
      viewBox="0 0 60 80"
      aria-hidden="true"
      className="absolute bottom-[78%] left-1/2 w-[30%] -translate-x-1/2 text-background"
    >
      {[
        "M18 78 C8 62 28 52 18 36 C10 24 22 14 18 2",
        "M30 78 C22 60 40 50 30 34 C22 22 36 12 30 0",
        "M42 78 C34 62 52 52 42 36 C34 24 46 14 42 2",
      ].map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-steam opacity-60"
          style={{ animationDelay: `${i * -1.3}s` }}
        />
      ))}
    </svg>
  );
}
