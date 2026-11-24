import { useRef, type CSSProperties } from "react";
import { hero } from "@/data/content";
import { media, type MediaImage } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/catalog/types";
import { gsap, useGSAP, type ScrollTrigger } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img } from "./media";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Scroll positions (0 to 1 of the track) of the three chapters; phones snap between them. */
const CHAPTERS = [0, 0.34, 1] as const;

/**
 * 1. HERO: a short film in three chapters, played by the scroll (scrubbed, reversible).
 *
 * At rest: the black and white serum world fills the screen. "Skin care you apply.", one
 * button and the price. Nothing else.
 * Chapter 1 (to 0.34): the photo pulls back into a rounded frame on a black stage and dims;
 *   the headline drifts away; a statement lights up word by word ("Serums stay on the
 *   surface. Skin care should go deeper.").
 * Chapter 2 (to 1): the statement leaves, a drop of tea falls onto the frame, ripples spread,
 *   and colour blooms out from the point of impact while the frame opens back to full bleed.
 *   "drink." rises letter by letter, the headline and button return, and a spec line
 *   (4 whole foods | 0 sugar | 0 caffeine) sits under it.
 *
 * Transform and opacity only. The frame is a full-screen card with rounded corners at
 * scale 1.06 (corners off-screen) that scales to 0.86. The bloom is a circle that scales up
 * while its content scales down by the same factor, so only the round window grows.
 * The hero sticks (CSS `position: sticky` in a 320svh track; `svh` so the phone address bar
 * never resizes it). Phones: each swipe moves one chapter forward or back (snap), so it
 * never rests between chapters. Desktop: a slower scrub and slight pointer depth.
 * Reduced motion: no track, colour at once. No JavaScript: the black and white world.
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
      const bloom = q("[data-bloom]");
      const bloomInner = q("[data-bloom-inner]");
      const rim = q("[data-bloom-rim]");
      const anchor = q("[data-word-anchor]");
      if (!card || !bloom || !bloomInner || !anchor) return;
      const drop = q("[data-drop]");
      const ripples = qa("[data-ripple]");
      const cue = q("[data-cue]");
      const shared = q("[data-shared]");
      const statement = q("[data-statement]");
      const words = qa("[data-statement] [data-sword]");
      const zoomOut = q('[data-world-zoom="left"]');
      const zoomIn = q('[data-world-zoom="right"]');
      const dim = q("[data-world-dim]");
      const applyChars = qa('[data-word="left"] [data-char]');
      const drinkChars = qa('[data-word="right"] [data-char]');
      const parallax = qa("[data-world-parallax]");

      // Geometry from layout offsets (not affected by the card's scale): the impact point is
      // the centre of the headline word; the bloom circle just covers the card from there.
      const geo = { cx: 0, cy: 0, r: 1 };
      const measure = () => {
        let x = 0;
        let y = 0;
        let n: HTMLElement | null = anchor;
        while (n && n !== card) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        const w = card.offsetWidth;
        const h = card.offsetHeight;
        geo.cx = x + anchor.offsetWidth / 2;
        geo.cy = y + anchor.offsetHeight / 2;
        geo.r =
          Math.ceil(Math.hypot(Math.max(geo.cx, w - geo.cx), Math.max(geo.cy, h - geo.cy))) + 2;
        for (const el of [bloom, rim]) {
          if (!el) continue;
          el.style.left = `${geo.cx - geo.r}px`;
          el.style.top = `${geo.cy - geo.r}px`;
          el.style.width = `${geo.r * 2}px`;
          el.style.height = `${geo.r * 2}px`;
        }
        bloomInner.style.left = `${geo.r - geo.cx}px`;
        bloomInner.style.top = `${geo.r - geo.cy}px`;
        bloomInner.style.width = `${w}px`;
        bloomInner.style.height = `${h}px`;
        bloomInner.style.transformOrigin = `${geo.cx}px ${geo.cy}px`;
        for (const el of [drop, ...ripples]) {
          if (!el) continue;
          el.style.left = `${geo.cx}px`;
          el.style.top = `${geo.cy}px`;
        }
      };

      // The circle starts as a small splash (2% of full size), never smaller: below that the
      // counter-scale would ask the browser to draw the photo at a huge zoom. Until then it is
      // hidden (not painted at all).
      const MIN = 0.02;
      const state = { s: 0 };
      const paint = () => {
        const on = state.s > MIN;
        const s = Math.max(state.s, MIN);
        bloom.style.visibility = on ? "visible" : "hidden";
        bloom.style.transform = `scale(${s})`;
        bloomInner.style.transform = `scale(${1 / s})`;
        if (rim) {
          rim.style.visibility = on ? "visible" : "hidden";
          rim.style.transform = `scale(${s})`;
          rim.style.opacity = String(Math.min(1, (1 - state.s) * 4));
        }
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced, isDesktop } = ctx.conditions as Record<string, boolean>;
        measure();
        if (isReduced) {
          state.s = 1;
          paint();
          return;
        }
        state.s = 0;
        paint();
        const moving = [
          card,
          zoomOut,
          zoomIn,
          drop,
          shared,
          statement,
          cue,
          ...words,
          ...ripples,
          ...applyChars,
          ...drinkChars,
        ].filter(Boolean) as HTMLElement[];
        gsap.set(moving, { transition: "none" });
        if (drop) gsap.set(drop, { xPercent: -50, yPercent: -100, opacity: 0 });
        if (ripples.length)
          gsap.set(ripples, { xPercent: -50, yPercent: -50, scale: 0.2, opacity: 0 });
        if (statement) gsap.set(statement, { autoAlpha: 0 });
        if (words.length) gsap.set(words, { opacity: 0.14 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: trackEl,
            start: "top top",
            end: "bottom bottom",
            scrub: isDesktop ? 1.2 : 0.5,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onRefresh: paint,
            onToggle: (self) =>
              gsap.set(moving, { willChange: self.isActive ? "transform, opacity" : "" }),
            ...(isDesktop
              ? {}
              : {
                  // Phones: each swipe moves one chapter forward or back.
                  snap: {
                    snapTo: (v: number, self?: ScrollTrigger) => {
                      if (CHAPTERS.some((c) => Math.abs(c - v) < 0.004)) return v;
                      const down = (self?.direction ?? 1) > 0;
                      if (down) return CHAPTERS.find((c) => c > v) ?? 1;
                      return [...CHAPTERS].reverse().find((c) => c < v) ?? 0;
                    },
                    duration: { min: 0.8, max: 1.6 },
                    delay: 0.08,
                    ease: "power3.inOut",
                  },
                }),
          },
        });

        const IMPACT = 0.5;
        tl.to({}, { duration: 1 }, 0);
        // Chapter 1: pull back into a frame, headline leaves, statement lights up.
        tl.fromTo(
          card,
          { scale: 1.06 },
          { scale: 0.86, duration: 0.26, ease: "power2.inOut" },
          0.03,
        )
          .fromTo(zoomOut, { scale: 1 }, { scale: 1.08, duration: 0.45 }, 0.03)
          .fromTo(dim, { opacity: 0 }, { opacity: 0.55, duration: 0.2 }, 0.05)
          .to(cue, { autoAlpha: 0, duration: 0.04 }, 0.01)
          .to(shared, { autoAlpha: 0, y: -24, duration: 0.1, ease: "power2.in" }, 0.03)
          .to(
            applyChars,
            {
              yPercent: -30,
              opacity: 0,
              duration: 0.1,
              ease: "power2.in",
              stagger: { each: 0.012, from: "center" },
            },
            0.04,
          )
          .to(statement, { autoAlpha: 1, duration: 0.04 }, 0.12)
          .to(words, { opacity: 1, duration: 0.05, stagger: 0.016 }, 0.14)
          // Chapter 2: statement leaves, the drop falls, colour blooms, frame opens.
          .to(statement, { autoAlpha: 0, y: -28, duration: 0.07, ease: "power2.in" }, 0.37);
        if (drop) {
          tl.to(drop, { opacity: 1, duration: 0.03 }, 0.38)
            .fromTo(
              drop,
              { y: () => -geo.cy - 40 },
              { y: 0, duration: IMPACT - 0.38, ease: "power2.in" },
              0.38,
            )
            .fromTo(
              drop,
              { scaleX: 1, scaleY: 1 },
              { scaleX: 0.85, scaleY: 1.25, duration: IMPACT - 0.4, ease: "power1.in" },
              0.4,
            )
            .to(drop, { scale: 0.2, opacity: 0, duration: 0.02 }, IMPACT);
        }
        ripples.forEach((el, i) => {
          tl.fromTo(
            el,
            { scale: 0.2, opacity: 0.9 },
            {
              scale: 2.6 + i * 1.2,
              opacity: 0,
              duration: 0.22,
              ease: "power2.out",
              immediateRender: false,
            },
            IMPACT + i * 0.04,
          );
        });
        tl.fromTo(
          state,
          { s: 0 },
          { s: 1, duration: 0.34, ease: "power2.inOut", onUpdate: paint },
          IMPACT,
        )
          .to(card, { scale: 1.06, duration: 0.34, ease: "power2.inOut" }, IMPACT + 0.04)
          .fromTo(zoomIn, { scale: 1.16 }, { scale: 1, duration: 0.4, ease: "power2.out" }, IMPACT)
          .fromTo(
            drinkChars,
            { yPercent: 70, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.12,
              ease: "power3.out",
              stagger: { each: 0.018, from: "center" },
            },
            IMPACT + 0.06,
          )
          .fromTo(
            shared,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out", immediateRender: false },
            IMPACT + 0.2,
          );

        // Desktop with a mouse: the photos follow the pointer a little (depth).
        let onMove: ((e: PointerEvent) => void) | null = null;
        if (isDesktop && parallax.length) {
          const movers = parallax.map((el) => ({
            x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3.out" }),
            depth: Number(el.dataset["worldParallax"]) || 1,
          }));
          onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            for (const m of movers) {
              m.x(-nx * 16 * m.depth);
              m.y(-ny * 10 * m.depth);
            }
          };
          root.addEventListener("pointermove", onMove);
        }

        return () => {
          if (onMove) root.removeEventListener("pointermove", onMove);
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set([...moving, ...parallax, dim].filter(Boolean), {
            clearProps: "transform,opacity,visibility,willChange,transition",
          });
        };
      });
      return () => mm.revert();
    },
    { scope: track },
  );

  const c = hero.compare;
  return (
    <div ref={track} data-hero-track className="relative bg-ink motion-safe:h-[320svh]">
      <section
        data-hero-fill
        ref={section}
        aria-labelledby="hero-title"
        className="sticky top-0 h-[100svh] min-h-[36rem] overflow-hidden bg-ink text-cream"
      >
        {/* The frame: full screen at rest (corners off-screen at 1.06), pulls back mid-story. */}
        <div
          data-card
          className="absolute inset-0 overflow-hidden rounded-[1.75rem] lg:rounded-[2.25rem]"
          style={{ transform: "scale(1.06)" }}
        >
          {/* Serum world: black and white, underneath. */}
          <World side="left" media={media.hero.serum} featured={featured} />

          {/* Ripples where the drop lands. */}
          {[0, 1].map((i) => (
            <span
              key={i}
              data-ripple
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-[1] block h-40 w-40 rounded-full border border-cream/70 opacity-0"
            />
          ))}

          {/* Tea world: a circle that grows from the point of impact (content counter-scaled). */}
          <div
            data-bloom
            className="absolute left-1/2 top-1/2 z-[1] h-0 w-0 overflow-hidden rounded-full"
            style={{ visibility: "hidden" }}
          >
            <div data-bloom-inner className="absolute">
              <World side="right" media={media.hero.image} featured={featured} />
            </div>
          </div>
          <div
            data-bloom-rim
            aria-hidden="true"
            className="hero-rim pointer-events-none absolute left-1/2 top-1/2 z-[1] h-0 w-0 rounded-full"
            style={{ visibility: "hidden" }}
          />

          {/* The drop of tea. */}
          <span
            data-drop
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[2] block w-6 opacity-0"
          >
            <svg
              viewBox="0 0 20 28"
              className="block w-full drop-shadow-[0_0_10px_var(--color-primary)]"
            >
              <path
                d="M10 0 C 10 0, 20 13, 20 18 A 10 10 0 0 1 0 18 C 0 13, 10 0, 10 0 Z"
                className="fill-primary"
              />
              <ellipse cx="6.5" cy="17" rx="2" ry="3.2" className="fill-cream/70" />
            </svg>
          </span>

          {/* Shared copy on top: the real headline, button and price. */}
          <Column layer="shared" featured={featured} />
        </div>

        {/* The statement: lights up word by word in chapter 1 (decorative; the same words are
            in the headline's description for screen readers). */}
        <div
          data-statement
          aria-hidden="true"
          className="pointer-events-none invisible absolute inset-0 z-[4] flex items-center justify-center px-6"
        >
          <p className="max-w-[12ch] text-balance text-center text-[clamp(2.1rem,1.1rem+4.2vw,5rem)] font-medium leading-[1.04] tracking-[-0.035em] text-cream sm:max-w-none">
            {c.statement.map((line, li) => (
              <span
                key={line}
                className={`block text-balance sm:whitespace-nowrap ${li === 1 ? "mt-[0.35em]" : ""}`}
              >
                {line.split(" ").map((w, wi) => (
                  <span key={`${w}-${wi}`} data-sword className="inline-block">
                    {w}
                    {" "}
                  </span>
                ))}
              </span>
            ))}
          </p>
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
 * The centred column: kicker, "Skin care you", the big word, button, price and (in the colour
 * world) the spec line. Rendered three times with the same layout so the word lines up
 * exactly: once on top with the real copy and an invisible word (keeps the space), and once
 * inside each world with only its own pieces visible.
 */
function Column({
  layer,
  side,
  featured,
}: {
  layer: "shared" | "world";
  side?: "left" | "right";
  featured: Product;
}) {
  const c = hero.compare;
  const shared = layer === "shared";
  const ghost = shared ? "" : "invisible";
  const price = money(featured.priceRange.minVariantPrice);
  const word = side ? c[side].word : c.right.word;
  const Title = shared ? "h1" : "div";
  return (
    <div
      aria-hidden={shared ? undefined : true}
      {...(shared ? { "data-shared": "" } : {})}
      className={`pointer-events-none absolute inset-0 flex flex-col items-center px-6 pb-[6.5rem] pt-28 text-center sm:pb-[9%] lg:pt-32 ${shared ? "z-[2]" : ""}`}
    >
      <p className={`hero-ease label-caps text-cream/75 ${ghost}`} style={d(200)}>
        {hero.kicker}
      </p>
      <Title
        {...(shared
          ? { id: "hero-title", "aria-label": hero.title, "aria-describedby": "hero-statement" }
          : {})}
        className="mt-auto flex flex-col items-center"
      >
        <span
          aria-hidden="true"
          className={`hero-ease block text-[clamp(1.5rem,1rem+2.2vw,2.75rem)] font-normal tracking-[-0.02em] text-cream ${ghost}`}
          style={d(400)}
        >
          {c.prefix}
        </span>
        <span
          aria-hidden="true"
          {...(shared ? { "data-word-anchor": "" } : {})}
          className="block overflow-hidden pb-[0.06em]"
        >
          <span
            className={`hero-word block text-[clamp(5rem,2.5rem+15vw,15rem)] leading-[0.95] tracking-[-0.05em] ${shared ? "invisible font-normal" : side === "left" ? "hero-outline font-light" : "font-normal text-cream"}`}
            style={d(550)}
          >
            {shared ? (
              word
            ) : (
              <span data-word={side} className="inline-block">
                {Array.from(word).map((ch, i) => (
                  <span key={i} data-char className="inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            )}
          </span>
        </span>
      </Title>
      {shared && (
        <span id="hero-statement" className="sr-only">
          {c.statement.join(" ")}
        </span>
      )}
      <div
        className={`hero-ease mt-6 flex flex-col items-center gap-2.5 ${shared ? "pointer-events-auto" : "invisible"}`}
        style={d(900)}
      >
        <a href={hero.shopCta.href} className="btn btn-primary" tabIndex={shared ? undefined : -1}>
          {hero.shopCta.label}
        </a>
        <span className="text-sm text-cream/70">
          {hero.from} {inr(price)}
        </span>
      </div>
      {/* Spec line: only visible in the colour world (revealed by the bloom). */}
      <ul
        className={`mt-5 flex items-center gap-4 text-[0.8rem] tracking-[0.02em] text-cream/85 sm:text-sm ${side === "right" ? "" : "invisible"}`}
      >
        {c.right.facts.map((f, i) => (
          <li key={f} className="flex items-center gap-4">
            {i > 0 && <span aria-hidden="true" className="h-3 w-px bg-cream/35" />}
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One world: graded photo, the giant word (in the same place in both worlds). The serum world
 * is cool and grey and can be dimmed; the tea world is warm, with steam on desktop.
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
  const left = side === "left";
  return (
    <div className="absolute inset-0">
      <div className="hero-settle absolute inset-0" style={d(0)}>
        <div data-world-zoom={side} className="absolute inset-0">
          <div data-world-parallax={left ? "0.6" : "1"} className="absolute -inset-6">
            <Img
              media={m}
              priority
              sizes="100vw"
              className={`h-full w-full ${left ? "object-[35%_60%] grayscale brightness-[0.8] contrast-[1.08]" : "object-[60%_60%] saturate-[1.15]"}`}
            />
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${left ? "bg-gradient-to-b from-ink/60 via-ink/35 to-ink/70" : "bg-gradient-to-b from-ink/40 via-ink/10 to-ink/70"}`}
      />
      {left && (
        <div data-world-dim aria-hidden="true" className="absolute inset-0 bg-ink opacity-0" />
      )}
      <div aria-hidden="true" className="hero-grain absolute inset-0" />
      <Column layer="world" side={side} featured={featured} />
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
