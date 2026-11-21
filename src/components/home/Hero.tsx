import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { hero, ingredients } from "@/data/content";
import { media } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Stars } from "@/components/site/Stars";
import { Img } from "./media";

// Ingredient circles around the arch (desktop positions in viewport units).
const ORBIT = [
  { pos: "lg:left-[31vw] lg:top-[16%]", size: "lg:w-[7.5vw]", out: [-30, -20] },
  { pos: "lg:left-[63vw] lg:top-[22%]", size: "lg:w-[6vw]", out: [30, -24] },
  { pos: "lg:left-[33vw] lg:top-[66%]", size: "lg:w-[6vw]", out: [-28, 26] },
  { pos: "lg:left-[61.5vw] lg:top-[62%]", size: "lg:w-[8vw]", out: [32, 22] },
];
const MOBILE_ORBIT = [
  "left-[2%] top-[6%] w-[22%]",
  "right-[2%] top-[18%] w-[18%]",
  "left-[0%] bottom-[16%] w-[18%]",
  "right-[0%] bottom-[4%] w-[24%]",
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * 1. HERO: "the cup is the skin care". A large editorial headline split around a tall arch
 * holding the steaming cup, with the four ingredients floating around it.
 *
 * - Entrance (CSS, every visit, after the intro loader): the arch photo rises and settles,
 *   words are revealed from a mask, the ingredients pop in, the copy eases in last.
 * - Desktop with a mouse: steam rises from the cup, ingredients float, and the hero is
 *   pinned while you scroll: the arch grows until the cup fills the screen, the headline
 *   halves slide apart, the ingredients fly outward, and "Cream stays on top. Food goes
 *   deeper." appears over the photo.
 * - Phones: a stacked composition with the same entrance; no pinning or loops.
 * - Reduced motion or no JavaScript: the finished composition, still.
 */
export function Hero({ featured }: { featured: Product }) {
  const section = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  usePauseWhenHidden(section);
  useEffect(
    () => () => {
      delete document.documentElement.dataset["motionPaused"];
    },
    [],
  );

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (!isDesktop || isReduced) return;
        const stage = root.querySelector<HTMLElement>("[data-stage]");
        if (!stage) return;
        // The dive message is decorative (it repeats the next section); reveal its layer now.
        gsap.set(q("[data-dive]"), { opacity: 1 });
        gsap.set(q("[data-dive] .dive-word"), { yPercent: 110 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=140%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(q("[data-arch]"), { scale: 4.8, duration: 0.65, ease: "power2.in" }, 0)
          .to(q("[data-arch-dim]"), { opacity: 0.55, duration: 0.5 }, 0.15)
          .to(q("[data-half='0']"), { xPercent: -60, opacity: 0, duration: 0.4 }, 0)
          .to(q("[data-half='1']"), { xPercent: 60, opacity: 0, duration: 0.4 }, 0)
          .to(q("[data-fadeout]"), { opacity: 0, y: -24, duration: 0.25 }, 0);
        q("[data-orbit]").forEach((el, i) => {
          const [x = 0, y = 0] = ORBIT[i]?.out ?? [];
          tl.to(
            el,
            { xPercent: x * 12, yPercent: y * 12, scale: 1.6, opacity: 0, duration: 0.45 },
            0,
          );
        });
        tl.fromTo(
          q("[data-dive] .dive-word"),
          { yPercent: 110 },
          { yPercent: 0, duration: 0.25, stagger: 0.03, ease: "power3.out" },
          0.55,
        ).to({}, { duration: 0.2 });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const price = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  const diveWords = hero.dive.title.split(" ");

  return (
    <section ref={section} aria-labelledby="hero-title" className="relative">
      <div
        data-stage
        data-paused={paused || undefined}
        className="relative overflow-hidden px-4 pb-14 pt-24 lg:h-[100dvh] lg:min-h-[44rem] lg:p-0"
      >
        {/* Kicker */}
        <p
          data-fadeout
          className="flex flex-col items-center gap-3 text-center lg:absolute lg:left-[4vw] lg:top-[16%] lg:items-start lg:text-left"
        >
          <span className="hero-ease label-caps text-muted-foreground" style={d(250)}>
            {hero.kicker}
          </span>
          <span
            aria-hidden="true"
            className="hero-line block h-px w-14 origin-left bg-green/40"
            style={d(400)}
          />
        </p>

        {/* Headline, split around the arch on desktop. */}
        <h1
          id="hero-title"
          aria-label={hero.title}
          className="mt-5 text-center font-normal leading-[0.95] tracking-[-0.035em] text-green max-lg:text-[clamp(3rem,13vw,4.5rem)] lg:mt-0"
        >
          {hero.titleLines.map((lineText, li) => (
            <span
              key={lineText}
              data-half={li}
              aria-hidden="true"
              className={`relative z-10 block lg:absolute lg:text-[6vw] ${li === 0 ? "lg:right-[66vw] lg:top-[30%] lg:text-right" : "lg:left-[66vw] lg:top-[50%] lg:text-left"}`}
            >
              {lineText.split(" ").map((w, wi) => (
                <span key={wi} className="inline-block overflow-hidden pb-[0.1em] align-top">
                  <span className="hero-word inline-block" style={d(550 + li * 260 + wi * 110)}>
                    {w}
                    {wi < lineText.split(" ").length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* The arch with the cup, and the ingredients around it. */}
        <div className="relative mx-auto mt-8 w-[74%] max-w-[22rem] lg:static lg:mt-0 lg:w-auto lg:max-w-none">
          <div
            data-arch
            className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-[1.75rem] bg-green lg:absolute lg:left-1/2 lg:top-1/2 lg:h-[64%] lg:w-auto lg:-translate-x-1/2 lg:-translate-y-[46%]"
          >
            <div className="hero-settle absolute inset-0" style={d(100)}>
              <Img
                media={media.hero.image}
                priority
                sizes="(min-width: 1024px) 100vw, 74vw"
                className="h-full w-full object-[60%_60%]"
              />
              <Steam />
            </div>
            <div data-arch-dim aria-hidden="true" className="absolute inset-0 bg-ink opacity-0" />
          </div>
          {ingredients.map((ing, i) => (
            <div
              key={ing.name}
              data-orbit
              aria-hidden="true"
              className={`absolute ${MOBILE_ORBIT[i]} ${ORBIT[i]?.pos ?? ""} ${ORBIT[i]?.size ?? ""} lg:bottom-auto lg:right-auto`}
            >
              <div className="hero-pop" style={d(1100 + i * 140)}>
                <div className="animate-float" style={{ animationDelay: `${-i * 2}s` }}>
                  <Img
                    media={media.ingredients[ing.image]}
                    sizes="8rem"
                    className="aspect-square w-full rounded-full border-4 border-background"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Copy and button (bottom left on desktop), proof (bottom right). */}
        <div
          data-fadeout
          className="mx-auto mt-10 max-w-sm text-center lg:absolute lg:bottom-[9%] lg:left-[4vw] lg:mt-0 lg:max-w-[22rem] lg:text-left"
        >
          <p
            className="hero-ease text-[1.0625rem] leading-relaxed text-muted-foreground"
            style={d(1300)}
          >
            {hero.line}
          </p>
          <div className="hero-ease mt-6 flex justify-center lg:justify-start" style={d(1450)}>
            <a href={hero.shopCta.href} className="btn btn-primary">
              {hero.shopCta.label}
            </a>
          </div>
        </div>
        <p
          data-fadeout
          className="hero-ease mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:absolute lg:bottom-[9%] lg:right-[9vw] lg:mt-0 lg:flex-col lg:items-end"
          style={d(1550)}
        >
          {featured.rating && (
            <span className="flex items-center gap-2">
              <Stars value={featured.rating.value} size={14} />
              <span>
                <span className="text-foreground">{featured.rating.value.toFixed(1)}</span> from{" "}
                {featured.rating.count.toLocaleString("en-IN")} {hero.ratingLabel}
              </span>
            </span>
          )}
          <span>
            {hero.from} <span className="text-foreground">{inr(price)}</span>
            {mrp > price && <span className="ml-1.5 line-through">{inr(mrp)}</span>}
          </span>
        </p>

        {/* Desktop scroll moment: appears over the cup once it fills the screen. */}
        {/* Decorative (repeats the next section), invisible until the desktop scroll reveals it. */}
        <div
          data-dive
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 hidden place-items-center px-8 text-center text-cream opacity-0 lg:grid"
        >
          <div>
            <p className="display max-w-4xl text-cream lg:text-[5vw]">
              {diveWords.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top">
                  <span className="dive-word inline-block">
                    {w}
                    {i < diveWords.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setPaused((p) => {
              // Pauses every endless loop on the page (steam, floats, ingredient strip).
              const next = !p;
              if (next) document.documentElement.dataset["motionPaused"] = "";
              else delete document.documentElement.dataset["motionPaused"];
              return next;
            })
          }
          aria-label={paused ? "Play page animation" : "Pause page animation"}
          className="absolute bottom-5 left-1/2 z-30 hidden h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-green/20 text-green/70 transition-colors hover:bg-blush lg:grid"
        >
          {paused ? (
            <Play size={14} weight="fill" aria-hidden="true" />
          ) : (
            <Pause size={14} weight="fill" aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
}

/**
 * Soft steam rising from the cup: three blurred wisps on a slow, staggered loop. Desktop with
 * a mouse only; paused off-screen, in hidden tabs and by the pause button.
 */
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
      className="hero-steam pointer-events-none absolute hidden blur-[6px]"
    >
      <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
        {wisps.map((p, i) => (
          <path key={p} d={p} className="hero-wisp" style={{ animationDelay: `${-i * 2}s` }} />
        ))}
      </g>
    </svg>
  );
}
