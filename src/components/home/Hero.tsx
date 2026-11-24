import { useRef, type CSSProperties } from "react";
import { hero } from "@/data/content";
import { media, type MediaImage } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/catalog/types";
import { Stars } from "@/components/site/Stars";
import { gsap, useGSAP, type ScrollTrigger } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img } from "./media";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * 1. HERO: "the drop". Black and white until a drop of tea turns it into colour, on scroll.
 *
 * At rest the serum world fills the screen in greyscale ("Skin care you apply.", "apply." as
 * an outline). Scrolling plays a story (scrubbed, so it follows the finger and reverses):
 * 1. The black and white photo pushes in and dims; its caption lifts away.
 * 2. A drop of tea falls from the top and lands on the headline; "apply." lifts away letter
 *    by letter as it lands, and ripples spread from the point of impact.
 * 3. Colour blooms out from that point in a growing circle (with a soft bright rim) until the
 *    tea world fills the screen; "drink." rises letter by letter out of the bloom, the colour
 *    photo settles from 1.14 and the tea caption parts arrive one by one.
 * A small "Apply / Drink" pill at the bottom fills with the scroll.
 *
 * Transform and opacity only. The bloom is a circle that scales up while its content scales
 * down by the same factor (so the photo stays put and only the circular window grows).
 * The hero sticks (CSS `position: sticky` in a 240svh track; `svh` so the phone address bar
 * never resizes it). Phones: a short scroll commits and the story finishes by itself (snap),
 * a short scroll back returns to black and white. Desktop: smoother scrub, photos follow the
 * pointer slightly. Reduced motion: no track, colour at once. No JavaScript: black and white.
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
      const bloom = q("[data-bloom]");
      const bloomInner = q("[data-bloom-inner]");
      const rim = q("[data-bloom-rim]");
      const anchor = q("[data-word-anchor]");
      const drop = q("[data-drop]");
      const ripples = qa("[data-ripple]");
      const hint = q("[data-fill-hint]");
      const bar = q("[data-fill-bar]");
      const fromLabel = q("[data-fill-from]");
      const toLabel = q("[data-fill-to]");
      if (!bloom || !bloomInner || !anchor) return;
      const zoomOut = q('[data-world-zoom="left"]');
      const zoomIn = q('[data-world-zoom="right"]');
      const dim = q("[data-world-dim]");
      const applyChars = qa('[data-word="left"] [data-char]');
      const drinkChars = qa('[data-word="right"] [data-char]');
      const capOut = qa('[data-caption="left"]');
      const capIn = qa('[data-caption="right"] [data-cap-part]');
      const parallax = qa("[data-world-parallax]");

      // Geometry: the impact point is the centre of the headline word; the bloom circle is
      // just big enough to cover the screen from there. Measured, never animated.
      const geo = { cx: 0, cy: 0, r: 1 };
      const measure = () => {
        const box = root.getBoundingClientRect();
        const a = anchor.getBoundingClientRect();
        const w = box.width;
        const h = box.height;
        geo.cx = a.left - box.left + a.width / 2;
        geo.cy = a.top - box.top + a.height / 2;
        geo.r =
          Math.ceil(Math.hypot(Math.max(geo.cx, w - geo.cx), Math.max(geo.cy, h - geo.cy))) + 2;
        const size = `${geo.r * 2}px`;
        for (const el of [bloom, rim]) {
          if (!el) continue;
          el.style.left = `${geo.cx - geo.r}px`;
          el.style.top = `${geo.cy - geo.r}px`;
          el.style.width = size;
          el.style.height = size;
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

      const state = { s: 0, p: 0 };
      // The circle starts as a small splash (2% of full size), never smaller: below that the
      // counter-scale would ask the browser to draw the photo at a huge zoom. Until then it
      // is hidden (not painted at all).
      const MIN = 0.02;
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
        if (bar) bar.style.transform = `scaleX(${state.p})`;
        if (fromLabel) fromLabel.style.opacity = String(1 - state.p * 0.55);
        if (toLabel) toLabel.style.opacity = String(0.45 + state.p * 0.55);
        if (hint) hint.style.opacity = String(Math.min(1, (1 - state.p) * 5));
      };
      const showColour = () => {
        state.s = 1;
        state.p = 1;
        paint();
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced, isDesktop } = ctx.conditions as Record<string, boolean>;
        measure();
        if (isReduced) {
          showColour();
          return;
        }
        state.s = 0;
        state.p = 0;
        paint();
        const moving = [
          zoomOut,
          zoomIn,
          drop,
          ...ripples,
          ...applyChars,
          ...drinkChars,
          ...capOut,
          ...capIn,
        ].filter(Boolean) as HTMLElement[];
        gsap.set(moving, { transition: "none" });
        if (drop) gsap.set(drop, { xPercent: -50, yPercent: -100, opacity: 0 });
        if (ripples.length)
          gsap.set(ripples, { xPercent: -50, yPercent: -50, scale: 0.2, opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: trackEl,
            start: "top top",
            end: "bottom bottom",
            scrub: isDesktop ? 1.2 : 0.6,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onRefresh: paint,
            onToggle: (self) =>
              gsap.set(moving, { willChange: self.isActive ? "transform, opacity" : "" }),
            ...(isDesktop
              ? {}
              : {
                  snap: {
                    snapTo: (v: number, self?: ScrollTrigger) => {
                      if (v <= 0.001 || v >= 0.999) return v;
                      const down = (self?.direction ?? 1) > 0;
                      return down ? (v > 0.08 ? 1 : 0) : v < 0.92 ? 0 : 1;
                    },
                    duration: { min: 0.7, max: 1.4 },
                    delay: 0.1,
                    ease: "power2.inOut",
                  },
                }),
          },
        });

        // 0 to 1: hold, fall (0.05 to 0.27), impact at 0.27, bloom (0.27 to 0.85), hold.
        const IMPACT = 0.27;
        tl.to({}, { duration: 1 }, 0)
          .to(state, { p: 1, duration: 0.85, onUpdate: paint }, 0.05)
          .fromTo(zoomOut, { scale: 1 }, { scale: 1.1, duration: 0.8 }, 0.05)
          .fromTo(dim, { opacity: 0 }, { opacity: 0.5, duration: 0.25 }, 0.05)
          .to(capOut, { y: -36, opacity: 0, duration: 0.16, ease: "power2.in" }, 0.06);
        if (drop) {
          tl.to(drop, { opacity: 1, duration: 0.04 }, 0.05)
            .fromTo(
              drop,
              { y: () => -geo.cy - 40 },
              { y: 0, duration: IMPACT - 0.05, ease: "power2.in" },
              0.05,
            )
            .fromTo(
              drop,
              { scaleY: 1, scaleX: 1 },
              { scaleY: 1.25, scaleX: 0.85, duration: IMPACT - 0.09, ease: "power1.in" },
              0.07,
            )
            .to(drop, { scale: 0.2, opacity: 0, duration: 0.03, ease: "power1.out" }, IMPACT);
        }
        tl.to(
          applyChars,
          {
            yPercent: -40,
            opacity: 0,
            duration: 0.12,
            ease: "power2.in",
            stagger: { each: 0.018, from: "center" },
          },
          IMPACT - 0.05,
        );
        ripples.forEach((el, i) => {
          tl.fromTo(
            el,
            { scale: 0.2, opacity: 0.9 },
            { scale: 2.6 + i * 1.2, opacity: 0, duration: 0.3, ease: "power2.out" },
            IMPACT + i * 0.05,
          );
        });
        tl.fromTo(
          state,
          { s: 0 },
          { s: 1, duration: 0.58, ease: "power2.inOut", onUpdate: paint },
          IMPACT,
        )
          .fromTo(zoomIn, { scale: 1.14 }, { scale: 1, duration: 0.6, ease: "power2.out" }, IMPACT)
          .fromTo(
            drinkChars,
            { yPercent: 70, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.18,
              ease: "power3.out",
              stagger: { each: 0.025, from: "center" },
            },
            IMPACT + 0.04,
          )
          .fromTo(
            capIn,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.14, ease: "power2.out", stagger: 0.035 },
            0.6,
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
              m.x(-nx * 18 * m.depth);
              m.y(-ny * 12 * m.depth);
            }
          };
          root.addEventListener("pointermove", onMove);
        }

        return () => {
          if (onMove) root.removeEventListener("pointermove", onMove);
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set([...moving, ...parallax, dim].filter(Boolean), {
            clearProps: "transform,opacity,willChange,transition",
          });
        };
      });
      return () => mm.revert();
    },
    { scope: track },
  );

  return (
    <div ref={track} data-hero-track className="relative motion-safe:h-[240svh]">
      <section
        data-hero-fill
        ref={section}
        aria-labelledby="hero-title"
        className="sticky top-0 h-[100svh] min-h-[36rem] overflow-hidden bg-ink text-cream"
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
        {/* A soft bright rim on the edge of the bloom. */}
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

        {/* Shared copy on top. */}
        <Column layer="shared" featured={featured} />

        {/* Progress pill: "Apply" -> "Drink" with a line that fills with the scroll. */}
        <div
          data-fill-hint
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] z-[3] flex justify-center motion-reduce:hidden"
        >
          <p
            className="hero-ease flex h-9 items-center gap-3 rounded-full border border-cream/20 bg-ink/40 px-4 text-[0.7rem] uppercase tracking-[0.2em] text-cream"
            style={d(1400)}
          >
            <span data-fill-from>{hero.compare.progress.from}</span>
            <span className="relative block h-px w-12 overflow-hidden bg-cream/25">
              <span
                data-fill-bar
                className="absolute inset-0 origin-left bg-cream"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span data-fill-to className="opacity-[0.45]">
              {hero.compare.progress.to}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * The centred column: kicker, "Skin care you", the big word, button and proof. Rendered three
 * times with the same layout so the word lines up exactly: once on top with the real copy and
 * an invisible word (keeps the space), and once inside each world with only the word visible.
 */
function Column({
  layer,
  word,
  outline = false,
  featured,
}: {
  layer: "shared" | "world";
  word?: string;
  outline?: boolean;
  featured: Product;
}) {
  const c = hero.compare;
  const shared = layer === "shared";
  const ghost = shared ? "" : "invisible";
  const price = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  const Title = shared ? "h1" : "div";
  return (
    <div
      aria-hidden={shared ? undefined : true}
      className={`pointer-events-none absolute inset-0 flex flex-col items-center px-6 pb-[7.5rem] pt-28 text-center sm:pb-[12%] lg:pt-32 ${shared ? "z-[2]" : ""}`}
    >
      <p className={`hero-ease label-caps text-cream/80 ${ghost}`} style={d(200)}>
        {hero.kicker}
      </p>
      <Title
        {...(shared ? { id: "hero-title", "aria-label": hero.title } : {})}
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
            className={`hero-word block text-[clamp(5rem,2.5rem+15vw,15rem)] leading-[0.95] tracking-[-0.05em] ${shared ? "invisible font-normal" : outline ? "hero-outline font-light" : "font-normal text-cream"}`}
            style={d(550)}
          >
            {shared || !word ? (
              (word ?? c.right.word)
            ) : (
              <span data-word={outline ? "left" : "right"} className="inline-block">
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
      <div
        className={`hero-ease mt-6 flex flex-col items-center gap-3 ${shared ? "pointer-events-auto" : "invisible"}`}
        style={d(900)}
      >
        <a href={hero.shopCta.href} className="btn btn-primary" tabIndex={shared ? undefined : -1}>
          {hero.shopCta.label}
        </a>
        {featured.rating && (
          <span className="hidden items-center gap-2 text-sm text-cream/80 sm:flex">
            <Stars value={featured.rating.value} size={13} />
            {featured.rating.value.toFixed(1)} from {featured.rating.count.toLocaleString("en-IN")}{" "}
            {hero.ratingLabel}, {hero.from.toLowerCase()} {inr(price)}
            {mrp > price && <span className="line-through">{inr(mrp)}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * One world: graded photo, the giant word (in the same place in both worlds), and a caption
 * in its own corner. The serum world is cool and grey; the tea world is warm.
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
  const c = hero.compare[side];
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
        className={`absolute inset-0 ${left ? "bg-gradient-to-b from-ink/60 via-ink/35 to-ink/70" : "bg-gradient-to-b from-ink/45 via-ink/15 to-ink/65"}`}
      />
      {left && (
        <div data-world-dim aria-hidden="true" className="absolute inset-0 bg-ink opacity-0" />
      )}
      {/* Phones: a deeper shade behind the caption so it reads over bright photos. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-ink/55 via-ink/25 to-transparent sm:hidden"
      />
      <div aria-hidden="true" className="hero-grain absolute inset-0" />
      <Column layer="world" word={c.word} outline={left} featured={featured} />
      {/* Captions sit in a wrapper so the scroll story can move them (the inner <p> keeps
          its CSS entrance). Desktop: in a corner. Phones: centred above the headline. */}
      <div data-caption={side} aria-hidden="true" className="pointer-events-none absolute inset-0">
        <p
          className={`hero-ease absolute top-[30%] hidden max-w-[15rem] sm:block ${left ? "left-8 text-left lg:left-12" : "right-8 text-right lg:right-12"}`}
          style={d(1200)}
        >
          <CaptionParts side={side} />
        </p>
        <p className="hero-ease absolute inset-x-6 top-[30%] text-center sm:hidden" style={d(1000)}>
          <CaptionParts side={side} compact />
        </p>
      </div>
      {!left && <Steam />}
    </div>
  );
}

/** Tag, line and fact chips; each piece is a separate step in the scroll story. */
function CaptionParts({ side, compact = false }: { side: "left" | "right"; compact?: boolean }) {
  const c = hero.compare[side];
  const left = side === "left";
  return (
    <>
      <span data-cap-part className="label-caps block text-cream/75">
        {c.tag}
      </span>
      <span
        data-cap-part
        className={`mt-2 block text-[1.05rem] leading-snug text-cream/95 ${compact ? "mx-auto max-w-[17rem]" : ""}`}
      >
        {c.text}
      </span>
      <span
        className={`flex flex-wrap gap-2 ${compact ? "mt-3 justify-center" : `mt-4 ${left ? "" : "justify-end"}`}`}
      >
        {c.facts.map((f) => (
          <span
            key={f}
            data-cap-part
            className={`inline-block rounded-full px-3 py-1 text-xs ${left ? "border border-cream/40 text-cream/80" : "bg-cream text-green"}`}
          >
            {f}
          </span>
        ))}
      </span>
    </>
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
