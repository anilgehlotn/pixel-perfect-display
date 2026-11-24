import { useRef, type CSSProperties } from "react";
import { hero } from "@/data/content";
import { media } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/catalog/types";
import { gsap, useGSAP, type ScrollTrigger } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { createHeroRenderer, type HeroRenderer } from "@/lib/animations/hero-shader";
import { Img } from "./media";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Extra room around the photos (px), used by the pointer depth on desktop. */
const PAD = 24;
/** Where the photos are anchored (CSS object-position, 0-1). */
const FOCUS = { a: [0.35, 0.6], b: [0.6, 0.6] } as const;

/**
 * 1. HERO: "steeping". One continuous shot played by the scroll (scrubbed, reversible).
 *
 * At rest: the black and white serum world. "Skin care you apply.", one button and the price.
 * As you scroll:
 * - the photo pulls back into a rounded frame on a black stage and dims;
 * - a small amber bead of tea falls onto the headline; "apply." lifts away letter by letter;
 * - two fine ripples gently bend the photo where it lands, and the colour spreads out from
 *   there in one clean, round wave with a soft feathered edge (no glow or distortion);
 * - the frame opens back to full bleed, "drink." rises letter by letter and the spec line
 *   (4 whole foods | 0 sugar | 0 caffeine) arrives.
 *
 * The photos are drawn by a small WebGL shader (`lib/animations/hero-shader.ts`) that only
 * renders when something changes. The server HTML and the fallback (no WebGL, context lost,
 * not loaded yet) are plain <img> layers with the same grading, crossfaded by the same scroll.
 * The frame is a full-screen card with rounded corners at scale 1.06 (corners off-screen)
 * that scales to 0.86. The hero sticks (CSS `position: sticky` in a 260svh track; `svh` so
 * the phone address bar never resizes it). Phones: one short swipe plays the whole shot, a
 * short swipe back returns to black and white (snap). Desktop: a slower scrub and the scene
 * tilts slightly with the pointer. Reduced motion: no track, no shader, colour at once.
 * No JavaScript: the black and white world.
 */
export function Hero({ featured }: { featured: Product }) {
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  usePauseWhenHidden(section);

  useGSAP(
    () => {
      const root = section.current;
      const trackEl = track.current;
      if (!root || !trackEl) return;
      const q = (sel: string) => root.querySelector<HTMLElement>(sel);
      const qa = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
      const card = q("[data-card]");
      const anchor = q("[data-word-anchor]");
      const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
      if (!card || !anchor || !canvas) return;
      const photoB = q('[data-photo="b"]');
      const dimEl = q("[data-dim]");
      const drop = q("[data-drop]");
      const cue = q("[data-cue]");
      const steam = q("[data-steam]");
      const spec = q("[data-spec]");
      const applyChars = qa('[data-word="left"] [data-char]');
      const drinkChars = qa('[data-word="right"] [data-char]');
      const imgA = root.querySelector<HTMLImageElement>('[data-photo="a"] img');
      const imgB = root.querySelector<HTMLImageElement>('[data-photo="b"] img');

      // Everything the scroll drives. The shader reads it; the DOM fallback mirrors it.
      const u = { bloom: 0, ripple: 0, dim: 0, zoomA: 1, zoomB: 1.15 };
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
      const geo = { cx: 0, cy: 0, w: 1, h: 1 };
      let renderer: HeroRenderer | null = null;
      let raf = 0;
      let visible = true;
      let disposed = false;

      // Layout offsets (not affected by the card's scale).
      const measure = () => {
        let x = 0;
        let y = 0;
        let n: HTMLElement | null = anchor;
        while (n && n !== card) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        geo.w = card.offsetWidth;
        geo.h = card.offsetHeight;
        geo.cx = x + anchor.offsetWidth / 2;
        geo.cy = y + anchor.offsetHeight / 2;
        if (drop) {
          drop.style.left = `${geo.cx}px`;
          drop.style.top = `${geo.cy}px`;
        }
        renderer?.resize();
      };

      const frame = (t: number) => {
        raf = 0;
        if (!renderer || !visible || disposed) return;
        tilt.x += (tilt.tx - tilt.x) * 0.06;
        tilt.y += (tilt.ty - tilt.y) * 0.06;
        renderer.set({
          ...u,
          impactX: geo.cx / geo.w,
          impactY: geo.cy / geo.h,
          tiltX: tilt.x,
          tiltY: tilt.y,
        });
        renderer.draw(t / 1000);
        const living = u.ripple > 0 && u.ripple < 1;
        const tilting = Math.abs(tilt.tx - tilt.x) + Math.abs(tilt.ty - tilt.y) > 0.001;
        if (living || tilting) schedule();
      };
      const schedule = () => {
        if (!raf && renderer && visible) raf = requestAnimationFrame(frame);
      };
      // The DOM fallback follows the same values (cheap; hidden under the canvas when it runs).
      const update = () => {
        if (photoB) photoB.style.opacity = String(u.bloom);
        if (dimEl) dimEl.style.opacity = String(u.dim);
        schedule();
      };

      const io = new IntersectionObserver(([e]) => {
        visible = !!e?.isIntersecting;
        schedule();
      });
      io.observe(root);
      const ro = new ResizeObserver(() => {
        measure();
        schedule();
      });
      ro.observe(card);

      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced, isDesktop } = ctx.conditions as Record<string, boolean>;
        measure();
        if (isReduced) {
          u.bloom = 1;
          u.dim = 0;
          update();
          gsap.set(applyChars, { opacity: 0 });
          gsap.set(drinkChars, { opacity: 1 });
          return;
        }

        // Start the shader once both photos are decoded; show it after the hero entrance.
        const mounted = performance.now();
        const start = async () => {
          if (!imgA || !imgB) return;
          try {
            await Promise.all([imgA.decode(), imgB.decode()]);
          } catch {
            return;
          }
          if (disposed || renderer) return;
          renderer = createHeroRenderer(
            canvas,
            {
              a: { img: imgA, focusX: FOCUS.a[0], focusY: FOCUS.a[1] },
              b: { img: imgB, focusX: FOCUS.b[0], focusY: FOCUS.b[1] },
            },
            {
              maxDpr: isDesktop ? 2 : 1.5,
              pad: PAD,
              onLost: () => {
                renderer = null;
                gsap.set(canvas, { opacity: 0 });
              },
            },
          );
          if (!renderer) return;
          measure();
          frame(performance.now());
          const wait = u.bloom > 0 ? 0 : Math.max(0, 2700 - (performance.now() - mounted));
          gsap.to(canvas, { opacity: 1, duration: 0.6, delay: wait / 1000, ease: "power1.out" });
        };
        void start();

        const moving = [card, drop, cue, spec, steam, ...applyChars, ...drinkChars].filter(
          Boolean,
        ) as HTMLElement[];
        gsap.set(moving, { transition: "none" });
        if (drop) gsap.set(drop, { xPercent: -50, yPercent: -100, opacity: 0 });
        // Start states, set every time this runs (a re-run after cleanup must not show them).
        gsap.set(drinkChars, { y: 0, yPercent: 70, opacity: 0 });
        gsap.set(applyChars, { y: 0, yPercent: 0, opacity: 1 });
        if (spec) gsap.set(spec, { opacity: 0, y: 14 });
        if (steam) gsap.set(steam, { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: trackEl,
            start: "top top",
            end: "bottom bottom",
            scrub: isDesktop ? 1.2 : 0.5,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onToggle: (self) =>
              gsap.set(moving, { willChange: self.isActive ? "transform, opacity" : "" }),
            ...(isDesktop
              ? {}
              : {
                  // Phones: a short swipe plays the whole shot, a short swipe back reverses it.
                  snap: {
                    snapTo: (v: number, self?: ScrollTrigger) => {
                      if (v <= 0.002 || v >= 0.998) return v;
                      const down = (self?.direction ?? 1) > 0;
                      return down ? (v > 0.04 ? 1 : 0) : v < 0.96 ? 0 : 1;
                    },
                    duration: { min: 1.4, max: 2.2 },
                    delay: 0.08,
                    ease: "power2.inOut",
                  },
                }),
          },
        });

        const IMPACT = 0.42;
        tl.to({}, { duration: 1 }, 0)
          // Pull back into a frame on a black stage; the black and white photo dims.
          .fromTo(card, { scale: 1.06 }, { scale: 0.86, duration: 0.3, ease: "power2.inOut" }, 0.02)
          .to(u, { dim: 0.4, zoomA: 1.08, duration: 0.4, onUpdate: update }, 0.02)
          .to(cue, { autoAlpha: 0, duration: 0.04 }, 0.01)
          // "apply." lifts away as the drop lands.
          .to(
            applyChars,
            {
              yPercent: -35,
              opacity: 0,
              duration: 0.08,
              ease: "power2.in",
              stagger: { each: 0.01, from: "center" },
            },
            IMPACT - 0.05,
          );
        if (drop) {
          tl.to(drop, { opacity: 1, duration: 0.03 }, 0.2)
            .fromTo(
              drop,
              { y: () => -geo.cy - 40 },
              { y: 0, duration: IMPACT - 0.2, ease: "power2.in" },
              0.2,
            )
            .fromTo(
              drop,
              { scaleX: 1, scaleY: 1 },
              { scaleX: 0.85, scaleY: 1.25, duration: IMPACT - 0.24, ease: "power1.in" },
              0.24,
            )
            .to(drop, { scale: 0.2, opacity: 0, duration: 0.02 }, IMPACT);
        }
        // Impact: the surface ripples, the colour steeps out, the frame opens again.
        tl.fromTo(
          u,
          { ripple: 0 },
          { ripple: 1, duration: 0.34, ease: "power1.out", onUpdate: update },
          IMPACT,
        )
          .fromTo(
            u,
            { bloom: 0 },
            { bloom: 1, duration: 0.5, ease: "sine.inOut", onUpdate: update },
            IMPACT + 0.01,
          )
          .fromTo(
            u,
            { zoomB: 1.15 },
            { zoomB: 1, duration: 0.5, ease: "power2.out", onUpdate: update },
            IMPACT,
          )
          .to(card, { scale: 1.06, duration: 0.42, ease: "power2.inOut" }, IMPACT + 0.06)
          .fromTo(
            drinkChars,
            { y: 0, yPercent: 70, opacity: 0 },
            {
              y: 0,
              yPercent: 0,
              opacity: 1,
              duration: 0.12,
              ease: "power3.out",
              stagger: { each: 0.018, from: "center" },
            },
            IMPACT + 0.1,
          );
        if (steam) tl.to(steam, { opacity: 1, duration: 0.2 }, IMPACT + 0.25);
        if (spec)
          tl.to(spec, { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, IMPACT + 0.32);

        // Desktop with a mouse: the scene tilts slightly with the pointer.
        let onMove: ((e: PointerEvent) => void) | null = null;
        if (isDesktop) {
          onMove = (e: PointerEvent) => {
            tilt.tx = (e.clientX / window.innerWidth - 0.5) * -2;
            tilt.ty = (e.clientY / window.innerHeight - 0.5) * -2;
            schedule();
          };
          root.addEventListener("pointermove", onMove);
        }

        return () => {
          if (onMove) root.removeEventListener("pointermove", onMove);
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(moving, { clearProps: "transform,opacity,visibility,willChange,transition" });
        };
      });

      return () => {
        disposed = true;
        if (raf) cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        mm.revert();
        renderer?.destroy();
        renderer = null;
      };
    },
    { scope: track },
  );

  const c = hero.compare;
  const price = money(featured.priceRange.minVariantPrice);
  return (
    <div ref={track} data-hero-track className="relative bg-ink motion-safe:h-[260svh]">
      <section
        data-hero-fill
        ref={section}
        aria-labelledby="hero-title"
        className="sticky top-0 h-[100svh] min-h-[36rem] overflow-hidden bg-ink text-cream"
      >
        {/* The frame: full screen at rest (corners off-screen at 1.06), pulls back mid-shot. */}
        <div
          data-card
          className="absolute inset-0 overflow-hidden rounded-[1.75rem] lg:rounded-[2.25rem]"
          style={{ transform: "scale(1.06)" }}
        >
          {/* Server HTML and fallback: the black and white photo... */}
          <div data-photo="a" aria-hidden="true" className="absolute inset-0">
            <div className="hero-settle absolute inset-0" style={d(0)}>
              <div className="absolute -inset-6">
                <Img
                  media={media.hero.serum}
                  priority
                  sizes="100vw"
                  className="h-full w-full object-[35%_60%] grayscale brightness-[0.8] contrast-[1.08]"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/35 to-ink/70" />
            <div data-dim className="absolute inset-0 bg-ink opacity-0" />
            <div className="hero-grain absolute inset-0" />
          </div>
          {/* ...and the colour photo, faded in by the scroll when the shader is not running. */}
          <div data-photo="b" aria-hidden="true" className="absolute inset-0 opacity-0">
            <div className="absolute -inset-6">
              <Img
                media={media.hero.image}
                priority
                sizes="100vw"
                className="h-full w-full object-[60%_60%] saturate-[1.15]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 to-ink/70" />
          </div>

          {/* The shader draws both photos here once it is ready. */}
          <canvas
            data-hero-canvas
            aria-hidden="true"
            className="absolute inset-0 block h-full w-full opacity-0"
          />

          {/* Steam over the cup (desktop), arrives with the colour. */}
          <div data-steam aria-hidden="true" className="absolute inset-0">
            <Steam />
          </div>

          {/* The drop of tea: a small amber glass bead with a faint motion trail. */}
          <span
            data-drop
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[2] block h-[11px] w-[11px] opacity-0"
          >
            <span className="hero-drop-trail" />
            <span className="hero-drop-bead" />
          </span>

          {/* Copy. */}
          <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col items-center px-6 pb-[6.5rem] pt-28 text-center sm:pb-[9%] lg:pt-32">
            <p className="hero-ease label-caps text-cream/75" style={d(200)}>
              {hero.kicker}
            </p>
            <h1
              id="hero-title"
              aria-label={hero.title}
              className="mt-auto flex flex-col items-center"
            >
              <span
                aria-hidden="true"
                className="hero-ease block text-[clamp(1.5rem,1rem+2.2vw,2.75rem)] font-normal tracking-[-0.02em] text-cream"
                style={d(400)}
              >
                {c.prefix}
              </span>
              <span
                aria-hidden="true"
                data-word-anchor
                className="block overflow-hidden pb-[0.06em]"
              >
                <span
                  className="hero-word grid text-[clamp(5rem,2.5rem+15vw,15rem)] leading-[0.95] tracking-[-0.05em]"
                  style={d(550)}
                >
                  <Word side="left" text={c.left.word} />
                  <Word side="right" text={c.right.word} />
                </span>
              </span>
            </h1>
            <div
              className="hero-ease pointer-events-auto mt-6 flex flex-col items-center gap-2.5"
              style={d(900)}
            >
              <a href={hero.shopCta.href} className="btn btn-primary">
                {hero.shopCta.label}
              </a>
              <span className="text-sm text-cream/70">
                {hero.from} {inr(price)}
              </span>
            </div>
            <ul
              data-spec
              className="mt-5 flex items-center gap-4 text-[0.8rem] tracking-[0.02em] text-cream/85 sm:text-sm"
            >
              {c.right.facts.map((f, i) => (
                <li key={f} className="flex items-center gap-4">
                  {i > 0 && <span aria-hidden="true" className="h-3 w-px bg-cream/35" />}
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scroll cue at rest: a short line travelling down. */}
        <div
          data-cue
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] z-[3] flex justify-center motion-reduce:hidden"
        >
          <p
            className="hero-ease flex flex-col items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-cream/70"
            style={d(1400)}
          >
            {c.scrollCue}
            <span className="relative block h-8 w-px overflow-hidden bg-cream/20">
              <span className="hero-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-cream" />
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * The big word, split into letters. Both words share one grid cell so they sit in exactly the
 * same place: "apply." (thin outline) shows at rest, "drink." rises in during the shot.
 */
function Word({ side, text }: { side: "left" | "right"; text: string }) {
  const left = side === "left";
  return (
    <span
      data-word={side}
      className={`col-start-1 row-start-1 inline-block justify-self-center ${left ? "hero-outline font-light" : "font-normal text-cream"}`}
    >
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          data-char
          className="inline-block"
          // "drink." waits for the colour (decorative: the h1 label carries the words).
          style={left ? undefined : { opacity: 0 }}
        >
          {ch}
        </span>
      ))}
    </span>
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
