import { useRef } from "react";
import { hero } from "@/data/content";
import { media } from "@/data/media";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { Img } from "./media";

/**
 * 1. HERO: one full-width photo in a rounded frame that zooms in slowly once, a large centred
 * headline, one line and one button. The headline, line and button rise in after the intro
 * loader (hero.ts). Reduced motion: no zoom, no entrance.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const delayMs = takeIntroDelay();
      // First page load without the intro: the hero is already on screen, keep it static.
      if (delayMs === null && !isHydrated()) return;
      const parts = {
        section: section.current,
        heading: heading.current,
        line: line.current,
        actions: actions.current,
        pieces: [] as HTMLElement[],
      };
      if (!parts.section || !parts.heading || !parts.line || !parts.actions) return;
      let played = false;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (isReduced || played) return;
        played = true;
        let cleanup = () => {};
        safely("hero", [parts.heading, parts.line, parts.actions], () => {
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
    <section ref={section} aria-labelledby="hero-title" className="px-4 pt-24 md:px-6 md:pt-28">
      <div className="relative mx-auto grid min-h-[34rem] max-w-[84rem] place-items-center overflow-hidden rounded-card bg-green text-center text-cream lg:h-[min(80dvh,46rem)]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <Img
            media={media.hero.image}
            priority
            sizes="(min-width: 1344px) 84rem, 100vw"
            className="animate-kenburns h-full w-full object-[58%_60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/35 to-ink/55" />
        </div>
        <div className="relative max-w-3xl px-6 py-20">
          <h1 id="hero-title" ref={heading} className="display text-cream lg:text-[5.5rem]">
            {hero.title}
          </h1>
          <p ref={line} className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-cream/90">
            {hero.line}
          </p>
          <div ref={actions} className="mt-8 flex justify-center">
            <a href={hero.shopCta.href} className="btn btn-primary">
              {hero.shopCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
