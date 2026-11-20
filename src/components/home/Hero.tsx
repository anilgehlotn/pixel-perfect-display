import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { hero, packaging } from "@/data/content";
import type { Product } from "@/lib/shopify/types";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { Stars } from "@/components/site/Stars";
import { Pouch } from "@/components/product/Pouch";

/**
 * 1. HERO: deep wine block, copy on the left and the three pouches standing together on the
 * right, like a product photograph. Phones: pouches first, copy below.
 */
export function Hero({ featured }: { featured: Product }) {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);

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

  const rating = featured.rating;
  const [front, left, right] = ["skin-glow-tea", "calm-night", "gut-balance"].map(
    (h) => packaging[h],
  );
  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-wine text-cream"
    >
      {/* Warm pool of light behind the pouches. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_72%_62%,rgba(244,127,120,0.32),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-[80rem] items-center gap-6 px-6 pb-14 pt-10 lg:min-h-[min(44rem,calc(100dvh-8rem))] lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:py-16">
        <div className="order-2 max-w-xl lg:order-1">
          <p
            data-piece
            className="text-[0.8rem] font-medium uppercase tracking-[0.22em] text-cream/85"
          >
            {hero.kicker}
          </p>
          <h1 id="hero-title" ref={heading} className="display mt-5 text-cream">
            {hero.title}
          </h1>
          <p ref={line} className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-cream/85">
            {hero.line}
          </p>
          <div ref={actions} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={hero.shopCta.href} className="btn btn-primary">
              {hero.shopCta.label}
            </Link>
            <Link to={hero.quizCta.href} className="btn btn-cream">
              {hero.quizCta.label}
            </Link>
          </div>
          {rating && (
            <p data-piece className="mt-8 flex items-center gap-3 text-sm text-cream/85">
              <Stars value={rating.value} size={16} className="text-rose" />
              <span>
                <span className="font-medium text-cream">{rating.value.toFixed(1)}</span> from{" "}
                {rating.count.toLocaleString("en-IN")} {hero.ratingLabel}
              </span>
            </p>
          )}
        </div>
        <div
          data-piece
          className="relative order-1 mx-auto aspect-[1.25/1] w-full max-w-[36rem] lg:order-2"
        >
          {/* Table edge the pouches stand on. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[2%] bottom-[4%] h-[16%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,248,244,0.16),transparent)]"
          />
          {left && (
            <Pouch look={left} className="absolute bottom-[8%] left-[2%] w-[38%] -rotate-6" />
          )}
          {right && (
            <Pouch look={right} className="absolute bottom-[8%] right-[2%] w-[38%] rotate-6" />
          )}
          {front && (
            <Pouch
              look={front}
              title="SkinFusion Skin Glow Tea pouch"
              className="absolute bottom-[3%] left-1/2 w-[48%] -translate-x-1/2"
            />
          )}
        </div>
      </div>
    </section>
  );
}
