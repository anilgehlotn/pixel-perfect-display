import { useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { hero } from "@/data/content";
import { media } from "@/data/media";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img } from "./media";

/**
 * 1. HERO: one full-width photo in a rounded frame, a small label with a hairline, a large
 * centred headline, one line and one button.
 *
 * Motion is slow and plays once (CSS, every visit, after the intro loader when it shows):
 * the photo comes up from dark and settles from 1.12 to 1, then keeps a very slow zoom; the
 * hairline draws in; the headline is revealed from a mask word by word; the line and button
 * ease in last. Desktop: on scroll the copy fades and lifts away while the photo drifts
 * slower than the page, and soft steam keeps rising from the cup (pause button). Reduced
 * motion: no motion, everything visible.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  usePauseWhenHidden(section);

  // Desktop only: the copy fades and lifts as the hero scrolls out of view.
  useGSAP(
    () => {
      const root = section.current;
      const el = copy.current;
      if (!root || !el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (!isDesktop || isReduced) return;
        const tween = gsap.to(el, {
          yPercent: -18,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom 20%", scrub: true },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(el, { clearProps: "transform,opacity" });
        };
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const words = hero.title.split(" ");
  const step = 120;
  const after = 900 + words.length * step;
  return (
    <section ref={section} aria-labelledby="hero-title" className="px-4 pt-24 md:px-6 md:pt-28">
      <div
        data-paused={paused || undefined}
        className="relative mx-auto grid min-h-[34rem] max-w-[84rem] place-items-center overflow-hidden rounded-card bg-ink text-center text-cream lg:h-[min(80dvh,46rem)]"
      >
        {/* Photo layers: scroll drift (desktop) > settle-in > very slow zoom. */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div data-depth="-0.2" className="absolute -inset-y-[8%] inset-x-0">
            <div className="hero-settle h-full w-full">
              <Img
                media={media.hero.image}
                priority
                sizes="(min-width: 1344px) 84rem, 100vw"
                className="hero-breathe h-full w-full object-[58%_60%]"
              />
              <Steam />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/40 to-ink/60" />
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play steam animation" : "Pause steam animation"}
          className="absolute bottom-5 right-5 z-10 hidden h-10 w-10 place-items-center rounded-full bg-cream/10 text-cream/80 backdrop-blur-sm transition-colors hover:bg-cream/20 lg:grid"
        >
          {paused ? (
            <Play size={14} weight="fill" aria-hidden="true" />
          ) : (
            <Pause size={14} weight="fill" aria-hidden="true" />
          )}
        </button>

        <div ref={copy} className="relative max-w-3xl px-6 py-20">
          <p className="flex flex-col items-center gap-3">
            <span
              className="hero-ease label-caps text-cream/85"
              style={{ "--d": "300ms" } as CSSProperties}
            >
              {hero.kicker}
            </span>
            <span
              aria-hidden="true"
              className="hero-line block h-px w-14 origin-center bg-cream/60"
              style={{ "--d": "450ms" } as CSSProperties}
            />
          </p>
          <h1 id="hero-title" className="display mt-6 text-cream lg:text-[5.5rem]">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
                <span
                  className="hero-word inline-block"
                  style={{ "--d": `${650 + i * step}ms` } as CSSProperties}
                >
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>
          <p
            className="hero-ease mx-auto mt-5 max-w-lg text-lg leading-relaxed text-cream/90"
            style={{ "--d": `${after}ms` } as CSSProperties}
          >
            {hero.line}
          </p>
          <div
            className="hero-ease mt-9 flex justify-center"
            style={{ "--d": `${after + 150}ms` } as CSSProperties}
          >
            <a href={hero.shopCta.href} className="btn btn-primary">
              {hero.shopCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Soft steam rising from the cup: three blurred wisps on a slow, staggered loop. Desktop with
 * a mouse only (it sits above the cup in the wide crop); paused off-screen, in hidden tabs and
 * by the pause button. Reduced motion: hidden.
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
        {wisps.map((d, i) => (
          <path key={d} d={d} className="hero-wisp" style={{ animationDelay: `${-i * 2}s` }} />
        ))}
      </g>
    </svg>
  );
}
