import { useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { hero } from "@/data/content";
import { media } from "@/data/media";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { heroEntrance, type HeroParts } from "@/lib/animations/hero";
import { isHydrated } from "@/lib/animations/hydration";
import { takeIntroDelay } from "@/lib/animations/intro";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Img, LoopVideo } from "./media";

/* 1. HERO: headline, one line, two pills, and the floating product composition. */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  usePauseWhenHidden(section);

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
        // Play once; crossing a breakpoint later must not replay it.
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

  return (
    <section
      ref={section}
      className="container-x grid items-center gap-12 pb-16 pt-28 md:pt-36 lg:min-h-[100dvh] lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:pb-16 lg:pt-28"
    >
      <div className="max-w-xl">
        <h1 ref={heading} className="display">
          {hero.title}
        </h1>
        <p ref={line} className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          {hero.line}
        </p>
        <div ref={actions} className="mt-9 flex flex-wrap gap-3">
          <Link to={hero.quizCta.href} className="btn btn-primary">
            {hero.quizCta.label}
          </Link>
          <a href={hero.shopCta.href} className="btn btn-outline">
            {hero.shopCta.label}
          </a>
        </div>
      </div>
      <Composition />
    </section>
  );
}

/**
 * Each piece: entrance wrapper (data-piece) > scroll parallax (data-depth, desktop) > CSS
 * float (desktop) > media. Three layers so the three transforms never fight.
 */
function Piece({
  className,
  depth,
  delay,
  children,
}: {
  className: string;
  depth: number;
  delay: string;
  children: ReactNode;
}) {
  return (
    <div data-piece className={`absolute ${className}`}>
      <div data-depth={depth} className="h-full w-full">
        <div className="animate-float h-full w-full" style={{ animationDelay: delay }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const CIRCLE = "aspect-square overflow-hidden rounded-full border-4 border-background";

function Composition() {
  const [jujube, goji, snowFungus, ginger] = media.hero.orbit;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[38rem] lg:aspect-[1/1.02]">
      <Piece className="right-0 top-[6%] w-[44%]" depth={-0.35} delay="-2s">
        <LoopVideo video={media.hero.video} className="aspect-[4/5] w-full rounded-card bg-beige" />
      </Piece>
      <Piece className="left-[17%] top-[3%] z-10 w-[50%]" depth={0.15} delay="0s">
        <div className="aspect-[3/4.4] w-full overflow-hidden rounded-stadium bg-beige">
          <Img
            media={media.hero.centerpiece}
            priority
            sizes="(min-width: 1024px) 19rem, 50vw"
            className="h-full w-full"
          />
        </div>
      </Piece>
      {jujube && (
        <Piece className="left-0 top-[44%] z-20 w-[23%]" depth={0.5} delay="-4s">
          <Img media={jujube} sizes="9rem" className={`w-full ${CIRCLE}`} />
        </Piece>
      )}
      {goji && (
        <Piece className="left-[8%] top-0 z-20 w-[15%]" depth={0.7} delay="-1s">
          <Img media={goji} sizes="6rem" className={`w-full ${CIRCLE}`} />
        </Piece>
      )}
      {snowFungus && (
        <Piece className="bottom-[3%] right-[18%] z-20 w-[26%]" depth={0.4} delay="-3s">
          <Img media={snowFungus} sizes="10rem" className={`w-full ${CIRCLE}`} />
        </Piece>
      )}
      {ginger && (
        <Piece className="bottom-[22%] right-0 z-20 w-[16%]" depth={0.8} delay="-5s">
          <Img media={ginger} sizes="6rem" className={`w-full ${CIRCLE}`} />
        </Piece>
      )}
    </div>
  );
}
