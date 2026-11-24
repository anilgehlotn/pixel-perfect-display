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
 * 1. HERO: black and white to colour, like tea filling a cup, driven by the scroll.
 *
 * The serum world fills the screen in greyscale ("Skin care you apply.", "apply." as an
 * outline). The tea world sits on top inside a "fill" that rises from the bottom: its wrapper
 * moves up while its content moves down by the same amount, so the colour climbs the screen.
 *
 * Scroll story (scrubbed, reversible, transform and opacity only):
 * - The black and white photo pushes in and dims; its caption lifts away.
 * - A liquid surface (a glowing, gently moving wave line with a warm bloom under it) rises.
 * - "apply." lifts away letter by letter just before the surface reaches it; "drink." rises
 *   in letter by letter behind it while the colour photo settles from 1.14.
 * - The tea caption and its chips arrive one by one.
 * - Desktop with a mouse: both photos follow the pointer slightly (depth).
 * The hero sticks (CSS `position: sticky` in a 220svh track; `svh` so the phone address bar
 * never resizes it mid-scroll). Phones: a short scroll commits, the story then finishes on
 * its own (snap), so it never rests half-way. Reduced motion: no track,
 * colour at once. No JavaScript: black and white.
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
      const q = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel);
      const qa = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
      const outer = q("[data-fill-outer]");
      const inner = q("[data-fill-inner]");
      const edge = q("[data-fill-edge]");
      const hint = q("[data-fill-hint]");
      const bar = q("[data-fill-bar]");
      const fromLabel = q("[data-fill-from]");
      const toLabel = q("[data-fill-to]");
      if (!outer || !inner) return;
      const zoomOut = q('[data-world-zoom="left"]');
      const zoomIn = q('[data-world-zoom="right"]');
      const dim = q("[data-world-dim]");
      const applyChars = qa('[data-word="left"] [data-char]');
      const drinkChars = qa('[data-word="right"] [data-char]');
      const capOut = qa('[data-caption="left"]');
      const capIn = qa('[data-caption="right"] [data-cap-part]');
      const parallax = qa("[data-world-parallax]");

      const fill = { p: 0 };
      const paint = () => {
        const off = (1 - fill.p) * 100;
        outer.style.transform = `translate3d(0, ${off}%, 0)`;
        inner.style.transform = `translate3d(0, ${-off}%, 0)`;
        if (edge) {
          edge.style.transform = `translate3d(0, ${off}%, 0)`;
          // The surface fades as it reaches the top of the screen.
          edge.style.opacity = String(Math.min(1, fill.p * 12, (1 - fill.p) * 6));
        }
        if (bar) bar.style.transform = `scaleX(${fill.p})`;
        if (fromLabel) fromLabel.style.opacity = String(1 - fill.p * 0.55);
        if (toLabel) toLabel.style.opacity = String(0.45 + fill.p * 0.55);
        // The control fades out as the colour completes.
        if (hint) hint.style.opacity = String(Math.min(1, (1 - fill.p) * 5));
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced, isDesktop } = ctx.conditions as Record<string, boolean>;
        if (isReduced) {
          fill.p = 1;
          paint();
          return;
        }
        fill.p = 0;
        paint();
        const moving = [zoomOut, zoomIn, ...applyChars, ...drinkChars, ...capOut, ...capIn].filter(
          Boolean,
        ) as HTMLElement[];
        gsap.set(moving, { transition: "none" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: trackEl,
            start: "top top",
            end: "bottom bottom",
            scrub: isDesktop ? 1.1 : 0.6,
            // Phones: never rest half-way. A short scroll commits and the story finishes.
            ...(isDesktop
              ? {}
              : {
                  snap: {
                    snapTo: (v: number, self?: ScrollTrigger) => {
                      if (v <= 0.001 || v >= 0.999) return v;
                      const down = (self?.direction ?? 1) > 0;
                      return down ? (v > 0.1 ? 1 : 0) : v < 0.9 ? 0 : 1;
                    },
                    duration: { min: 0.5, max: 1.1 },
                    delay: 0.12,
                    ease: "power2.inOut",
                  },
                }),
            onToggle: (self) =>
              gsap.set(moving, { willChange: self.isActive ? "transform, opacity" : "" }),
          },
        });
        // Timeline runs 0 to 1: a short hold, the fill from 0.06 to 0.86, a short hold.
        tl.to({}, { duration: 1 }, 0)
          .to(fill, { p: 1, duration: 0.8, ease: "power1.inOut", onUpdate: paint }, 0.06)
          .fromTo(zoomOut, { scale: 1 }, { scale: 1.12, duration: 0.8 }, 0.06)
          .fromTo(dim, { opacity: 0 }, { opacity: 0.55, duration: 0.6 }, 0.06)
          .to(capOut, { y: -40, opacity: 0, duration: 0.22, ease: "power2.in" }, 0.08)
          .to(
            applyChars,
            {
              yPercent: -45,
              opacity: 0,
              duration: 0.16,
              ease: "power2.in",
              stagger: { each: 0.025, from: "start" },
            },
            0.2,
          )
          .fromTo(zoomIn, { scale: 1.14 }, { scale: 1, duration: 0.8, ease: "power2.out" }, 0.06)
          .fromTo(
            drinkChars,
            { yPercent: 70, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.22,
              ease: "power3.out",
              stagger: { each: 0.035, from: "start" },
            },
            0.32,
          )
          .fromTo(
            capIn,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.16, ease: "power2.out", stagger: 0.04 },
            0.5,
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
    <div ref={track} data-hero-track className="relative motion-safe:h-[220svh]">
      <section
        data-hero-fill
        ref={section}
        aria-labelledby="hero-title"
        className="sticky top-0 h-[100svh] min-h-[36rem] overflow-hidden bg-ink text-cream"
      >
        {/* Serum world: black and white, underneath. */}
        <World side="left" media={media.hero.serum} featured={featured} />

        {/* Tea world: rises from the bottom. Wrapper moves up, content moves down. */}
        <div
          data-fill-outer
          className="absolute inset-0 z-[1] overflow-hidden"
          style={{ transform: "translateY(100%)" }}
        >
          <div
            data-fill-inner
            className="absolute inset-0"
            style={{ transform: "translateY(-100%)" }}
          >
            <World side="right" media={media.hero.image} featured={featured} />
          </div>
        </div>

        {/* The liquid surface: moves with the fill, not clipped by it. */}
        <div
          data-fill-edge
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ transform: "translateY(100%)", opacity: 0 }}
        >
          <Meniscus />
        </div>

        {/* Shared copy on top. */}
        <Column layer="shared" featured={featured} />

        {/* Progress control: "Apply" -> "Drink" with a line that fills with the scroll. */}
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
 * The surface of the tea: a soft amber bloom under a thin glowing wave line that drifts
 * sideways (CSS loop, paused off-screen). Sits exactly on the top edge of the colour.
 */
function Meniscus() {
  const wave = "M0 10 C 100 2, 200 18, 300 10 S 500 2, 600 10 S 800 18, 900 10 S 1100 2, 1200 10";
  return (
    <div className="absolute inset-x-0 top-0">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/30 via-primary/[0.08] to-transparent" />
      <div className="absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-cream/15 to-transparent" />
      <div className="absolute -top-[10px] left-0 h-5 w-full overflow-hidden">
        <svg
          viewBox="0 0 1200 20"
          preserveAspectRatio="none"
          className="hero-meniscus absolute left-0 top-0 h-full w-[200%] text-cream"
        >
          <path
            d={wave}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="6"
            className="blur-[3px]"
          />
          <path d={wave} fill="none" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1.2" />
        </svg>
      </div>
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
        <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
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
