import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { hero } from "@/data/content";
import { media } from "@/data/media";
import type { Product } from "@/lib/shopify/types";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { Stars } from "@/components/site/Stars";
import { Img } from "./media";

/**
 * 1. HERO: full-bleed photograph. Desktop: copy over the calm left side with a cream wash.
 * Phones: photo on top, copy below on cream.
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
  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="relative bg-sand lg:flex lg:min-h-[min(46rem,calc(100dvh-8rem))] lg:items-center"
    >
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
        <Img
          media={media.hero}
          priority
          sizes="100vw"
          className="h-full w-full object-[72%_50%] lg:object-[62%_50%]"
        />
        {/* Soft cream wash on the left keeps the headline readable over the photo. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-sand via-sand/75 to-transparent lg:block"
        />
      </div>
      <div className="relative mx-auto w-full max-w-[80rem] px-6 pb-14 pt-10 lg:py-24">
        <div className="max-w-xl">
          <p data-piece className="text-sm font-medium tracking-[0.08em] text-gold-deep">
            {hero.kicker}
          </p>
          <h1 id="hero-title" ref={heading} className="display mt-4 text-green">
            {hero.title}
          </h1>
          <p ref={line} className="mt-6 max-w-md text-[1.1rem] leading-relaxed text-ink/80">
            {hero.line}
          </p>
          <div ref={actions} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={hero.shopCta.href} className="btn btn-primary">
              {hero.shopCta.label}
            </Link>
            <Link to={hero.quizCta.href} className="btn btn-outline">
              {hero.quizCta.label}
            </Link>
          </div>
          {rating && (
            <p data-piece className="mt-8 flex items-center gap-3 text-sm text-ink/80">
              <Stars value={rating.value} size={16} />
              <span>
                <span className="font-medium text-ink">{rating.value.toFixed(1)}</span> from{" "}
                {rating.count.toLocaleString("en-IN")} {hero.ratingLabel}
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
