import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { hero, ingredients } from "@/data/content";
import { media } from "@/data/media";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img } from "./media";

// The four ingredients floating around the headline (wide screens). Position, size, how far
// each follows the pointer, and when it pops in (ms).
const FLOATERS: { style: CSSProperties; mouse: number; delay: number }[] = [
  { style: { left: "6%", top: "14%", width: "8.5rem" }, mouse: 26, delay: 700 },
  { style: { left: "11%", bottom: "12%", width: "6rem" }, mouse: -18, delay: 850 },
  { style: { right: "7%", top: "11%", width: "6.5rem" }, mouse: -22, delay: 1000 },
  { style: { right: "5%", bottom: "14%", width: "9rem" }, mouse: 30, delay: 1150 },
];

/**
 * 1. HERO: one full-width photo in a rounded frame, a large centred headline, one line and one
 * button. Motion (CSS, plays on every visit, after the intro loader when it shows):
 * - the photo zooms in slowly; on desktop it also drifts with scroll (data-depth);
 * - the headline rises word by word, then the line and the button;
 * - wide screens: the four ingredients pop in, float, and follow the pointer;
 * - desktop: soft specks of light drift up through the photo, and a scroll cue pulses.
 * The pause button stops every endless loop (WCAG 2.2.2); off-screen and hidden tabs pause
 * too. Reduced motion: no motion at all, everything visible.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  usePauseWhenHidden(section);

  // Pointer parallax for [data-mouse] layers, desktop with a mouse only.
  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (!isDesktop || isReduced) return;
        const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-mouse]")).map((el) => ({
          amount: Number(el.dataset["mouse"]) || 0,
          x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3.out" }),
        }));
        const onMove = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.amount);
            l.y(ny * l.amount);
          });
        };
        root.addEventListener("pointermove", onMove);
        return () => root.removeEventListener("pointermove", onMove);
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const words = hero.title.split(" ");
  return (
    <section ref={section} aria-labelledby="hero-title" className="px-4 pt-24 md:px-6 md:pt-28">
      <div
        data-paused={paused || undefined}
        className="relative mx-auto grid min-h-[34rem] max-w-[84rem] place-items-center overflow-hidden rounded-card bg-green text-center text-cream lg:h-[min(80dvh,46rem)]"
      >
        {/* Photo: scroll drift (wrapper, desktop) > slow zoom (image). */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div data-depth="-0.25" className="absolute -inset-y-[8%] inset-x-0">
            <Img
              media={media.hero.image}
              priority
              sizes="(min-width: 1344px) 84rem, 100vw"
              className="animate-kenburns h-full w-full object-[58%_60%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/35 to-ink/55" />
          <Specks />
        </div>

        {FLOATERS.map((f, i) => {
          const ing = ingredients[i];
          if (!ing) return null;
          return (
            <Layer key={ing.name} style={f.style} mouse={f.mouse} delay={f.delay}>
              <div className="animate-float" style={{ animationDelay: `${-i * 2}s` }}>
                <Img
                  media={media.ingredients[ing.image]}
                  sizes="9rem"
                  className="aspect-square w-full rounded-full border-4 border-cream/80"
                />
              </div>
            </Layer>
          );
        })}

        <div className="relative max-w-3xl px-6 py-20">
          <h1 id="hero-title" className="display text-cream lg:text-[5.5rem]">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top">
                <span
                  className="hero-word inline-block"
                  style={{ "--d": `${150 + i * 90}ms` } as CSSProperties}
                >
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>
          <p
            className="hero-rise mx-auto mt-5 max-w-lg text-lg leading-relaxed text-cream/90"
            style={{ "--d": `${250 + words.length * 90}ms` } as CSSProperties}
          >
            {hero.line}
          </p>
          <div
            className="hero-rise mt-8 flex justify-center"
            style={{ "--d": `${400 + words.length * 90}ms` } as CSSProperties}
          >
            <a href={hero.shopCta.href} className="btn btn-primary">
              {hero.shopCta.label}
            </a>
          </div>
        </div>

        {/* Scroll cue (desktop) and pause button for the moving parts. */}
        <a
          href="#how-it-works"
          aria-label="Scroll to how it works"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-cream/80 lg:flex"
        >
          <span aria-hidden="true">Scroll</span>
          <span aria-hidden="true" className="relative block h-10 w-px overflow-hidden bg-cream/25">
            <span className="animate-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-cream" />
          </span>
        </a>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play animation" : "Pause animation"}
          className="absolute bottom-6 right-6 hidden h-11 w-11 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-colors hover:bg-cream/25 lg:grid"
        >
          {paused ? (
            <Play size={16} weight="fill" aria-hidden="true" />
          ) : (
            <Pause size={16} weight="fill" aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
}

/** Entrance (pop in) > pointer parallax (data-mouse) > float > picture. Wide screens only. */
function Layer({
  style,
  mouse,
  delay,
  children,
}: {
  style: CSSProperties;
  mouse: number;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className="hero-pop absolute z-10 hidden xl:block"
      style={{ ...style, "--d": `${delay}ms` } as CSSProperties}
    >
      <div data-mouse={mouse}>{children}</div>
    </div>
  );
}

/** Soft specks of light drifting up through the photo, like steam (desktop only). */
function Specks() {
  const specks = [8, 19, 31, 44, 57, 66, 78, 90];
  return (
    <div className="absolute inset-0 hidden lg:block">
      {specks.map((left, i) => (
        <span
          key={left}
          className="animate-speck absolute bottom-0 block rounded-full bg-cream/50"
          style={{
            left: `${left}%`,
            width: `${4 + (i % 3) * 3}px`,
            height: `${4 + (i % 3) * 3}px`,
            animationDelay: `${-i * 1.6}s`,
            animationDuration: `${11 + (i % 4) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
