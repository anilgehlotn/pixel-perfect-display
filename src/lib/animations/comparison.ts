import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { afterInitialLoad, alreadySeen } from "./hydration";
import { MOTION_CONDITIONS } from "./media";
import { countUp } from "./presets";
import { CLEAR_PROPS, failsafe, safely } from "./safety";

/**
 * "SkinFusion vs. the rest" (dark spec-sheet panel). Each part plays once as it scrolls in:
 * - intro: eyebrow, headline and line rise one after another;
 * - the orbit: the three rings draw themselves, the cup scales up into its circle, and the
 *   three fact chips pop out around it with a spring (they then float, CSS, paused
 *   off-screen);
 * - the four big numbers count up from 0;
 * - the cards: the SkinFusion card rises, its five ticks pop one by one, then the two
 *   competitor cards glide in from the side.
 * Desktop with a mouse also gets two scroll-linked touches: the cup drifts inside its circle
 * and the rings turn slowly.
 * Hooks: data-cmp-intro, -orbit, -ring, -photo, -depth, -chip, -count, -ours, -tick, -other.
 * Transform and opacity only (plus SVG stroke-dashoffset for the rings, play once).
 * Reduced motion: nothing moves. Anything already on screen at first load is left alone.
 */
export function useComparisonReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const found = scope.current;
      if (!found) return;
      const root: HTMLElement = found;
      const qa = (sel: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(sel)).filter((e) => e.offsetParent !== null);
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced, isDesktop } = ctx.conditions as Record<string, boolean>;
        if (isReduced) return;
        const stops: (() => void)[] = [];
        const d = isDesktop;

        /** Builds a play-once timeline on `trigger` and cleans its targets when done. */
        const once = (
          trigger: Element | undefined,
          targets: Element[],
          build: (tl: gsap.core.Timeline) => void,
          start = "top 85%",
        ) => {
          if (!trigger || alreadySeen(trigger)) return;
          gsap.set(targets, { transition: "none" });
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger, start, once: true },
            onComplete: () => gsap.set(targets, { clearProps: CLEAR_PROPS }),
          });
          build(tl);
          stops.push(failsafe(trigger, tl));
        };

        const cancel = afterInitialLoad(() => {
          safely("comparison", root, () => {
            // Intro.
            const intro = qa("[data-cmp-intro]").filter((e) => e.tagName !== "H3");
            once(intro[0], intro, (tl) =>
              tl.from(intro, { y: d ? 40 : 24, opacity: 0, duration: d ? 1 : 0.7, stagger: 0.12 }),
            );

            // The orbit.
            const orbit = root.querySelector<HTMLElement>("[data-cmp-orbit]");
            const rings = Array.from(root.querySelectorAll<SVGCircleElement>("[data-cmp-ring]"));
            const photo = qa("[data-cmp-photo]");
            const chips = qa("[data-cmp-chip]");
            if (orbit) {
              once(
                orbit,
                [...photo, ...chips],
                (tl) => {
                  rings.forEach((r, i) => {
                    const len = 2 * Math.PI * Number(r.getAttribute("r"));
                    const dash = r.getAttribute("stroke-dasharray");
                    tl.fromTo(
                      r,
                      { strokeDasharray: `${len} ${len}`, strokeDashoffset: len },
                      {
                        strokeDashoffset: 0,
                        duration: 1.6,
                        ease: "power2.inOut",
                        onComplete: () => {
                          if (dash) r.style.strokeDasharray = dash;
                          else r.style.removeProperty("stroke-dasharray");
                          r.style.removeProperty("stroke-dashoffset");
                        },
                      },
                      i * 0.15,
                    );
                  });
                  tl.from(
                    photo,
                    { scale: 0.6, opacity: 0, duration: 1.2, ease: "expo.out" },
                    0.25,
                  ).from(
                    chips,
                    {
                      scale: 0.4,
                      opacity: 0,
                      y: 20,
                      duration: 0.8,
                      ease: "back.out(2.2)",
                      stagger: 0.14,
                    },
                    0.7,
                  );
                },
                "top 80%",
              );
              // Desktop: the cup drifts in its circle and the rings turn with the scroll.
              if (d) {
                const depth = qa("[data-cmp-depth]");
                gsap.fromTo(
                  depth,
                  { yPercent: -6 },
                  {
                    yPercent: 6,
                    ease: "none",
                    scrollTrigger: {
                      trigger: orbit,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
                gsap.fromTo(
                  orbit,
                  { rotate: -12 },
                  {
                    rotate: 12,
                    ease: "none",
                    scrollTrigger: {
                      trigger: orbit,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              }
            }

            // Big numbers.
            for (const el of qa("[data-cmp-count]"))
              stops.push(countUp(el, d ? "desktop" : "mobile"));
            const stats = qa("[data-cmp-stat]");
            once(stats[0], stats, (tl) =>
              tl.from(stats, { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }),
            );

            // The cards.
            const ours = qa("[data-cmp-ours]");
            const ticks = qa("[data-cmp-tick]");
            const others = qa("[data-cmp-other]");
            const title = qa("h3[data-cmp-intro]");
            once(ours[0], [...title, ...ours, ...ticks, ...others], (tl) =>
              tl
                .from(title, { y: 20, opacity: 0, duration: 0.7 }, 0)
                .from(ours, { y: d ? 70 : 40, opacity: 0, duration: 1, ease: "expo.out" }, 0.1)
                .from(
                  ticks,
                  { scale: 0.2, opacity: 0, duration: 0.6, ease: "back.out(3)", stagger: 0.09 },
                  0.45,
                )
                .from(
                  others,
                  { x: d ? 80 : 60, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.15 },
                  0.6,
                ),
            );
          });
        });
        return () => {
          cancel();
          stops.forEach((s) => s());
        };
      });
      return () => mm.revert();
    },
    { scope },
  );
}
