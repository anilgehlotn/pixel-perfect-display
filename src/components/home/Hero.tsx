import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react";
import { heroSlider, heroSlides, type HeroSlide } from "@/data/content";
import { media, type Media } from "@/data/media";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { money, type Product } from "@/lib/shopify/types";
import { Stars } from "@/components/site/Stars";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img, LoopVideo } from "./media";

/**
 * 1. HERO: a full-width banner slider. Three slides (heroSlides in content.ts, media in
 * media.hero.slides) crossfade; the active picture zooms in slowly, its text rises in, and a
 * progress bar fills, moving to the next slide when it is full (6.5s). Hover, keyboard focus,
 * the pause button, an off-screen hero or a hidden tab pause it; reduced motion turns autoplay,
 * zoom and text motion off. Arrows, the bars and a swipe on touch screens change slides.
 * A floating card sells the featured product right in the hero (desktop).
 */
export function Hero({ featured }: { featured: Product }) {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [changed, setChanged] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const swipe = useRef<number | null>(null);
  usePauseWhenHidden(section);

  const count = heroSlides.length;
  const go = useCallback(
    (next: number) => {
      setChanged(true);
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  // Keyboard: left and right arrows anywhere inside the slider.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go, index]);

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

  const paused = userPaused || hovered;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      ref={section}
      aria-roledescription="carousel"
      aria-label={heroSlider.label}
      className="px-4 pt-24 md:px-6 md:pt-28"
    >
      <div
        data-paused={paused || undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setHovered(true)}
        onBlurCapture={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative mx-auto h-[min(82dvh,44rem)] min-h-[36rem] max-w-[84rem] touch-pan-y overflow-hidden rounded-card bg-green"
      >
        {heroSlides.map((slide, i) => (
          <Slide
            key={slide.title}
            slide={slide}
            media={media.hero.slides[i]}
            index={i}
            active={i === index}
            animate={changed}
            featured={featured}
            refs={i === 0 ? { heading, line, actions } : undefined}
          />
        ))}

        <ProductCard featured={featured} />

        {/* Controls: progress bars (also buttons), pause, previous, next. */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 px-6 pb-5 sm:px-10 sm:pb-7 lg:px-14">
          <ol className="flex flex-1 gap-2 sm:max-w-xs">
            {heroSlides.map((s, i) => (
              <li key={s.title} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${heroSlider.goTo} ${i + 1}: ${s.kicker}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group flex h-11 w-full items-center"
                >
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-cream/30">
                    <span
                      key={`${i}-${index}`}
                      onAnimationEnd={() => i === index && go(index + 1)}
                      className={`absolute inset-0 origin-left rounded-full bg-cream ${i === index ? "animate-slide-progress" : i < index ? "" : "scale-x-0"} ${i < index ? "scale-x-100" : ""} ${paused ? "[animation-play-state:paused]" : ""}`}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? heroSlider.play : heroSlider.pause}
            className="grid h-11 w-11 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-colors hover:bg-cream/25"
          >
            {userPaused ? (
              <Play size={16} weight="fill" aria-hidden="true" />
            ) : (
              <Pause size={16} weight="fill" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={heroSlider.previous}
            className="hidden h-11 w-11 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-colors hover:bg-cream/25 sm:grid"
          >
            <CaretLeft size={18} weight="light" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={heroSlider.next}
            className="hidden h-11 w-11 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-colors hover:bg-cream/25 sm:grid"
          >
            <CaretRight size={18} weight="light" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Slide({
  slide,
  media: m,
  index,
  active,
  animate,
  featured,
  refs,
}: {
  slide: HeroSlide;
  media: Media | undefined;
  index: number;
  active: boolean;
  animate: boolean;
  featured: Product;
  refs?:
    | {
        heading: React.RefObject<HTMLHeadingElement | null>;
        line: React.RefObject<HTMLParagraphElement | null>;
        actions: React.RefObject<HTMLDivElement | null>;
      }
    | undefined;
}) {
  const { add } = useCart();
  const Heading = index === 0 ? "h1" : "h2";
  const pack = slide.primary.addPack
    ? featured.variants.find((v) => v.title === slide.primary.addPack)
    : undefined;
  const rise = animate && active ? "animate-fade-up" : "";
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${heroSlides.length}: ${slide.kicker}`}
      aria-hidden={!active}
      inert={!active}
      className={`absolute inset-0 transition-opacity duration-1000 ease-out ${active ? "z-10 opacity-100" : "opacity-0"}`}
    >
      {/* Picture with a slow zoom while the slide is showing. */}
      <div
        key={active ? "on" : "off"}
        className={`absolute inset-0 ${active ? "animate-kenburns" : ""}`}
      >
        {m?.kind === "video" ? (
          <LoopVideo
            video={m}
            priority={index === 0}
            controlClassName="right-5 top-5 sm:right-7 sm:top-7"
            className="h-full w-full"
          />
        ) : m ? (
          <Img
            media={m}
            priority={index === 0}
            sizes="(min-width: 1344px) 84rem, 100vw"
            className="h-full w-full"
          />
        ) : null}
      </div>
      {/* Scrims: from the left on desktop, from the bottom on phones. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/5 lg:bg-gradient-to-r lg:from-ink/75 lg:via-ink/35 lg:to-transparent"
      />

      <div className="pointer-events-none relative flex h-full items-end px-6 pb-24 sm:px-10 sm:pb-28 lg:items-center lg:px-14 lg:pb-14">
        <div
          key={animate ? `t-${active}` : "t"}
          className="pointer-events-auto max-w-xl text-cream"
        >
          <p
            className={`inline-flex rounded-full bg-cream/15 px-3.5 py-1.5 text-sm backdrop-blur-sm ${rise}`}
          >
            {slide.kicker}
          </p>
          <Heading
            ref={refs?.heading}
            className={`display mt-5 text-cream ${rise}`}
            style={rise ? { animationDelay: "80ms" } : undefined}
          >
            {slide.title}
          </Heading>
          <p
            ref={refs?.line}
            className={`mt-5 max-w-md text-lg leading-relaxed text-cream/90 ${rise}`}
            style={rise ? { animationDelay: "160ms" } : undefined}
          >
            {slide.line}
          </p>
          <div
            ref={refs?.actions}
            className={`mt-8 flex flex-wrap gap-3 ${rise}`}
            style={rise ? { animationDelay: "240ms" } : undefined}
          >
            {pack ? (
              <button
                type="button"
                onClick={() => add(featured, pack, 1, { openDrawer: true })}
                disabled={!pack.availableForSale}
                className="btn btn-primary"
              >
                {slide.primary.label}
                <span className="opacity-80">{inr(money(pack.price))}</span>
              </button>
            ) : slide.primary.href ? (
              <ActionLink href={slide.primary.href} className="btn btn-primary">
                {slide.primary.label}
              </ActionLink>
            ) : null}
            {slide.secondary && (
              <ActionLink href={slide.secondary.href} className="btn btn-cream">
                {slide.secondary.label}
              </ActionLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** "/#section" anchors stay plain links; page routes use the router. */
function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/#"))
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

/** Floating card: the featured product, its rating and price, and "Add to cart" (desktop). */
function ProductCard({ featured }: { featured: Product }) {
  const { add } = useCart();
  const variant = featured.variants[0];
  const price = money(featured.priceRange.minVariantPrice);
  const mrp = featured.compareAtPriceRange
    ? money(featured.compareAtPriceRange.minVariantPrice)
    : 0;
  return (
    <div
      data-piece
      className="absolute right-10 top-1/2 z-20 hidden w-72 -translate-y-1/2 xl:block"
    >
      <div className="rounded-[1.5rem] bg-background/95 p-4 text-foreground backdrop-blur-md">
        <Link
          to="/products/$handle"
          params={{ handle: featured.handle }}
          className="block overflow-hidden rounded-xl"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Img media={media.hero.product} sizes="16rem" className="aspect-[4/3] w-full" />
        </Link>
        <p className="mt-3 text-sm leading-snug">
          <Link
            to="/products/$handle"
            params={{ handle: featured.handle }}
            className="underline-offset-4 hover:underline"
          >
            {featured.title}
          </Link>
        </p>
        {featured.rating && (
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Stars value={featured.rating.value} size={12} />
            {featured.rating.value.toFixed(1)} ({featured.rating.count.toLocaleString("en-IN")}{" "}
            {heroSlider.card.reviews})
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <p>
            {inr(price)}
            {mrp > price && (
              <span className="ml-1.5 text-sm text-muted-foreground line-through">{inr(mrp)}</span>
            )}
          </p>
          <button
            type="button"
            disabled={!variant?.availableForSale}
            onClick={() => variant && add(featured, variant)}
            className="btn btn-primary min-h-10 px-4 py-2 text-sm"
          >
            {heroSlider.card.add}
          </button>
        </div>
      </div>
    </div>
  );
}
