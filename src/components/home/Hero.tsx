import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { hero, ingredients } from "@/data/content";
import { media } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { Stars } from "@/components/site/Stars";
import { Img } from "./media";

/**
 * 1. HERO: names the product and shows the real thing. Desktop: copy, price, rating and the
 * four ingredients on the left; a herbal-tea photograph on the right with an arch-framed
 * porcelain pour overlapping it (xl only). Phones: photo first, copy below.
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
  const from = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-sand"
    >
      <div className="grid lg:min-h-[min(44rem,calc(100dvh-8.5rem))] lg:grid-cols-[1fr_1.05fr]">
        {/* Photo: first on phones, right-hand column on desktop. */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:order-2 lg:aspect-auto">
          <Img
            media={media.hero.main}
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="absolute inset-0 h-full w-full object-[50%_30%]"
          />
          <div
            data-piece
            className="absolute bottom-[12%] -left-20 hidden w-[28%] max-w-[15rem] xl:block"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-t-full border-[6px] border-sand">
              <Img media={media.hero.inset} sizes="15rem" className="h-full w-full" />
            </div>
          </div>
        </div>

        <div className="flex items-center px-6 pb-14 pt-10 lg:order-1 lg:py-16 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-16 xl:pr-28">
          <div className="max-w-xl">
            <p data-piece className="text-sm font-medium tracking-[0.08em] text-gold-deep">
              {hero.kicker}
            </p>
            <h1 id="hero-title" ref={heading} className="display mt-4 text-green">
              {hero.title}
            </h1>
            <p ref={line} className="mt-5 max-w-md text-[1.075rem] leading-relaxed text-ink/80">
              {hero.line}
            </p>

            <p data-piece className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span>
                <span className="text-muted-foreground">From </span>
                <span className="text-lg text-ink">{inr(from)}</span>
                {mrp > from && (
                  <span className="ml-2 text-muted-foreground line-through">{inr(mrp)}</span>
                )}
              </span>
              {rating && (
                <span className="flex items-center gap-2 text-ink/80">
                  <Stars value={rating.value} size={15} />
                  <span>
                    <span className="font-medium text-ink">{rating.value.toFixed(1)}</span> (
                    {rating.count.toLocaleString("en-IN")} {hero.ratingLabel})
                  </span>
                </span>
              )}
            </p>

            <div ref={actions} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={hero.shopCta.href} className="btn btn-primary">
                {hero.shopCta.label}
              </Link>
              <Link to={hero.quizCta.href} className="btn btn-outline">
                {hero.quizCta.label}
              </Link>
            </div>

            <div data-piece className="mt-10 border-t border-ink/10 pt-6">
              <p className="text-xs font-medium tracking-[0.08em] text-gold-deep">{hero.inside}</p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                {ingredients.map((ing) => (
                  <li key={ing.name} className="flex items-center gap-2.5">
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface">
                      <Img
                        media={media.ingredients[ing.image]}
                        sizes="2.5rem"
                        className="h-full w-full"
                      />
                    </span>
                    <span className="text-sm text-ink">{ing.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
