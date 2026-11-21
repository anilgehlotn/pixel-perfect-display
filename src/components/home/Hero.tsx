import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowCounterClockwise, HandTap } from "@phosphor-icons/react";
import { hero } from "@/data/content";
import { media, type MediaImage } from "@/data/media";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { Stars } from "@/components/site/Stars";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { attachLens } from "./hero-lens";
import { Img } from "./media";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * 1. HERO: starts in black and white. The serum world fills the screen ("Skin care you
 * apply.", greyed). Colour is the reward:
 *
 * - Desktop with a mouse: a lens of colour follows the cursor; inside it the tea world shows
 *   through, with the letters of "drink.". Clicking spreads the colour out from that point
 *   like a ripple until the whole hero is the tea world.
 * - Touch: tapping spreads the ripple from the tap.
 * - Keyboard and everyone: the "Tap to drink" / "Click to drink" button reveals from the
 *   centre; "Back to serum" returns to black and white.
 * - On reveal the word rises again, the fact chips ease in and steam starts (desktop).
 *
 * The lens is transform-only (see hero-lens.ts). Reduced motion: no lens; the button swaps
 * instantly. No JavaScript: the black and white serum world.
 */
export function Hero({ featured }: { featured: Product }) {
  const frame = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const lens = useRef<ReturnType<typeof attachLens> | null>(null);
  usePauseWhenHidden(frame);

  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    lens.current = attachLens(root, () => {
      setRevealed(true);
      setRound((r) => r + 1);
    });
    return () => lens.current?.destroy();
  }, []);

  const c = hero.compare;
  return (
    <section
      data-hero-lens
      ref={frame}
      aria-labelledby="hero-title"
      data-revealed={revealed || undefined}
      className="group/hero relative h-[100dvh] min-h-[38rem] select-none overflow-hidden bg-ink text-cream"
    >
      {/* 1. Serum world, black and white (base). */}
      <World side="left" media={media.hero.serum} featured={featured} />

      {/* 2. Lens of colour that follows the cursor (transform-only, see hero-lens.ts). */}
      <div
        data-lens
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 z-[1] h-[20rem] w-[20rem] overflow-hidden rounded-full"
      >
        <div data-lens-inner className="absolute left-0 top-0 h-[var(--fh)] w-[var(--fw)]">
          <World side="right" media={media.hero.image} featured={featured} still />
        </div>
      </div>

      {/* 3. The full tea world once revealed (remounts so its entrance plays again). */}
      <div
        data-tea-full
        className={`absolute inset-0 z-[1] transition-opacity duration-700 ${revealed ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!revealed}
      >
        {round > 0 && (
          <div key={round} className="hero-replay absolute inset-0">
            <World side="right" media={media.hero.image} featured={featured} settle={false} />
          </div>
        )}
      </div>

      {/* 4. Shared copy on top. */}
      <Column layer="shared" featured={featured} />

      {/* 5. Hint / reveal button and the way back. */}
      <div className="absolute inset-x-0 bottom-6 z-[3] flex justify-center px-4 sm:bottom-8">
        {revealed ? (
          <button
            type="button"
            onClick={() => {
              setRevealed(false);
              lens.current?.reset();
            }}
            className="hero-ease inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/40 bg-ink/30 px-5 text-sm text-cream backdrop-blur-md hover:bg-ink/50"
            style={d(400)}
          >
            <ArrowCounterClockwise size={16} weight="light" aria-hidden="true" />
            {c.back}
          </button>
        ) : (
          <button
            type="button"
            data-reveal
            onClick={() => lens.current?.reveal()}
            className="hero-hint inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/40 bg-ink/30 px-5 text-sm text-cream backdrop-blur-md hover:bg-ink/50"
            style={d(1400)}
          >
            <HandTap size={18} weight="light" aria-hidden="true" />
            <span className="sm:hidden">{c.tap}</span>
            <span className="hidden sm:inline">{c.hover}</span>
          </button>
        )}
      </div>
    </section>
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
  still = false,
  settle = true,
}: {
  side: "left" | "right";
  media: MediaImage;
  featured: Product;
  /** Inside the lens: no entrance animation and no steam (it follows the cursor). */
  still?: boolean;
  /** Photo rises and settles on first load (off when revealed: the lens already shows it). */
  settle?: boolean;
}) {
  const c = hero.compare[side];
  const left = side === "left";
  return (
    <div className="absolute inset-0">
      <div className={`absolute inset-0 ${still || !settle ? "" : "hero-settle"}`} style={d(0)}>
        <Img
          media={m}
          priority={!left}
          sizes="100vw"
          className={`h-full w-full ${left ? "object-[35%_60%] grayscale brightness-[0.8] contrast-[1.08]" : "object-[60%_60%] saturate-[1.15]"}`}
        />
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
      {!left && !still && <Steam />}
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
