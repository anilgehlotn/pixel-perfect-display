import { useRef } from "react";
import { marquee } from "@/data/content";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animations/gsap";
import { DESKTOP_QUERY } from "@/lib/animations/media";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";

// Two rows of large "SIP · GLOW · REPEAT ·" tilted -4deg, moving in opposite directions.
// The loop is a CSS transform animation over two identical copies (seamless at -50%).
// Desktop: scrolling briefly speeds it up via the animations' playbackRate. Mobile: constant.
// Paused off-screen and in hidden tabs; static with reduced motion. Decorative: aria-hidden.
const REPEATS = 4; // each copy must be wider than the widest screen

function Row({ reverse }: { reverse?: boolean }) {
  const words = Array.from({ length: REPEATS }, () => marquee).flat();
  const copy = (key: number) => (
    <span key={key} className="flex shrink-0">
      {words.map((word, i) => {
        const light = (i % 2 === 1) !== !!reverse;
        return (
          <span key={i} className="flex shrink-0 items-center">
            <span
              // Light rather than outlined: Jost's overlapping glyph contours show through
              // a text stroke.
              className={light ? "text-foreground/20" : "text-foreground"}
            >
              {word}
            </span>
            <span className="px-[0.5em] text-primary">·</span>
          </span>
        );
      })}
    </span>
  );
  return (
    <div
      data-marquee-row
      className={`flex w-max py-2 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
    >
      {[0, 1].map(copy)}
    </div>
  );
}

export function TiltedMarquee() {
  const section = useRef<HTMLElement>(null);
  usePauseWhenHidden(section);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
        const animations = () =>
          Array.from(el.querySelectorAll<HTMLElement>("[data-marquee-row]")).flatMap((row) =>
            row.getAnimations(),
          );
        const state = { rate: 1 };
        const apply = () => animations().forEach((a) => (a.playbackRate = state.rate));
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 800, 2.5);
            gsap
              .timeline({ onUpdate: apply })
              .to(state, { rate: boost, duration: 0.25, overwrite: true })
              .to(state, { rate: 1, duration: 0.9, ease: "power2.out" });
          },
        });
        return () => {
          state.rate = 1;
          apply();
        };
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      aria-hidden="true"
      className="overflow-clip border-t py-16 text-4xl font-light uppercase tracking-[0.12em] md:py-24 md:text-7xl"
    >
      <div className="-mx-[10%] -rotate-4">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
