import { useRef, type CSSProperties } from "react";
import { hero } from "@/data/content";
import { media, type MediaImage } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/catalog/types";
import { Stars } from "@/components/site/Stars";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img } from "./media";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * 1. HERO: black and white to colour, like tea filling a cup, driven by the scroll.
 *
 * The serum world fills the screen in greyscale ("Skin care you apply.", "apply." as an
 * outline). The tea world sits on top inside a "fill" that rises from the bottom: its wrapper
 * moves up while its content moves down by the same amount, so the colour climbs the screen
 * with a soft glowing edge, and "apply." turns into "drink." as the edge passes the word.
 *
 * - The hero sticks to the screen (CSS `position: sticky` inside a taller track) and the fill
 *   follows the scroll position, smoothed (scrub), on every device. Scrolling back up brings
 *   the black and white photo back. About one screen of scroll, then the page carries on.
 * - Reduced motion: no track, shown straight away in colour. No JavaScript: black and white.
 * Transform-only.
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
      const outer = root.querySelector<HTMLElement>("[data-fill-outer]");
      const inner = root.querySelector<HTMLElement>("[data-fill-inner]");
      const hint = root.querySelector<HTMLElement>("[data-fill-hint]");
      const zoomOut = root.querySelector<HTMLElement>('[data-world-zoom="left"]');
      const zoomIn = root.querySelector<HTMLElement>('[data-world-zoom="right"]');
      if (!outer || !inner) return;
      const fill = { p: 0 };
      const paint = () => {
        const off = (1 - fill.p) * 100;
        outer.style.transform = `translate3d(0, ${off}%, 0)`;
        inner.style.transform = `translate3d(0, ${-off}%, 0)`;
        if (hint) hint.style.opacity = String(Math.max(0, 1 - fill.p * 4));
      };
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced } = ctx.conditions as Record<string, boolean>;
        if (isReduced) {
          fill.p = 1;
          paint();
          return;
        }
        fill.p = 0;
        paint();
        const zooms = [zoomOut, zoomIn].filter(Boolean) as HTMLElement[];
        // Scroll-linked and reversible: a short hold, the fill (with a slow push-in on the
        // black and white photo and the colour photo settling from 1.12), then a short hold.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: trackEl,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9,
            onToggle: (self) => gsap.set(zooms, { willChange: self.isActive ? "transform" : "" }),
          },
        });
        tl.to({}, { duration: 0.08 })
          .to(fill, { p: 1, duration: 0.8, ease: "power1.inOut", onUpdate: paint }, 0.08)
          .fromTo(zoomOut, { scale: 1 }, { scale: 1.08, duration: 0.8 }, 0.08)
          .fromTo(zoomIn, { scale: 1.12 }, { scale: 1, duration: 0.8, ease: "power1.out" }, 0.08)
          .to({}, { duration: 0.12 });
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(zooms, { clearProps: "transform,willChange" });
        };
      });
      return () => mm.revert();
    },
    { scope: track },
  );

  return (
    <div ref={track} data-hero-track className="relative motion-safe:h-[200dvh]">
      <section
        data-hero-fill
        ref={section}
        aria-labelledby="hero-title"
        className="sticky top-0 h-[100dvh] min-h-[36rem] overflow-hidden bg-ink text-cream"
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
          {/* The rising edge: a thin bright line with a soft glow below it. */}
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-cream/80" />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream/30 to-transparent"
          />
        </div>

        {/* Shared copy on top. */}
        <Column layer="shared" featured={featured} />

        {/* Scroll cue, fades as the colour rises. */}
        <div
          data-fill-hint
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-5 z-[3] motion-reduce:hidden"
        >
          <p
            className="hero-ease flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-cream/80"
            style={d(1400)}
          >
            {hero.compare.hint}
            <span className="relative block h-8 w-px overflow-hidden bg-cream/25">
              <span className="hero-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-cream" />
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
      className={`pointer-events-none absolute inset-0 flex flex-col items-center px-6 pb-[18%] pt-28 text-center sm:pb-[12%] lg:pt-32 ${shared ? "z-[2]" : ""}`}
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
            {word ?? c.right.word}
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
          <Img
            media={m}
            priority
            sizes="100vw"
            className={`h-full w-full ${left ? "object-[35%_60%] grayscale brightness-[0.8] contrast-[1.08]" : "object-[60%_60%] saturate-[1.15]"}`}
          />
        </div>
      </div>
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${left ? "bg-gradient-to-b from-ink/60 via-ink/35 to-ink/70" : "bg-gradient-to-b from-ink/45 via-ink/15 to-ink/65"}`}
      />
      <div aria-hidden="true" className="hero-grain absolute inset-0" />
      <Column layer="world" word={c.word} outline={left} featured={featured} />
      <p
        aria-hidden="true"
        className={`hero-ease absolute top-[30%] hidden max-w-[15rem] sm:block ${left ? "left-8 text-left lg:left-12" : "right-8 text-right lg:right-12"}`}
        style={d(1200)}
      >
        <span className="label-caps block text-cream/75">{c.tag}</span>
        <span className="mt-2 block text-[1.05rem] leading-snug text-cream/95">{c.text}</span>
        <span className={`mt-4 flex flex-wrap gap-2 ${left ? "" : "justify-end"}`}>
          {c.facts.map((f) => (
            <span
              key={f}
              className={`rounded-full px-3 py-1 text-xs ${left ? "border border-cream/40 text-cream/80" : "bg-cream text-green"}`}
            >
              {f}
            </span>
          ))}
        </span>
      </p>
      {/* Phones: a short caption between the label and the headline. */}
      <p
        aria-hidden="true"
        className="hero-ease absolute inset-x-6 top-[30%] text-center sm:hidden"
        style={d(1000)}
      >
        <span className="label-caps block text-cream/75">{c.tag}</span>
        <span className="mx-auto mt-2 block max-w-[17rem] text-[1.05rem] leading-snug text-cream/95">
          {c.text}
        </span>
        <span className="mt-3 flex flex-wrap justify-center gap-2">
          {c.facts.map((f) => (
            <span
              key={f}
              className={`rounded-full px-3 py-1 text-xs ${left ? "border border-cream/40 text-cream/80" : "bg-cream text-green"}`}
            >
              {f}
            </span>
          ))}
        </span>
      </p>
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
