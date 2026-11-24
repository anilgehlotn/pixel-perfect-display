import type { RefObject } from "react";
import { gsap, SplitText, useGSAP } from "./gsap";
import { afterInitialLoad, alreadySeen } from "./hydration";
import { MOTION_CONDITIONS } from "./media";
import { CLEAR_PROPS, failsafe, safely } from "./safety";

/**
 * "SkinFusion vs. the rest" ("head to head"). Each part plays once as it scrolls in:
 * - intro: the title's words rise out of a mask (SplitText); eyebrow and line rise;
 * - desktop (`data-a-layout="wide"`): the SkinFusion card slides in from the left and "The
 *   rest" from the right, the photo settles from 1.2 to 1, the "vs" pops, the coral ticks pop
 *   one by one and the competitor answers settle row by row;
 * - phones (`data-a-layout="stack"`): the SkinFusion card rises (photo settles, ticks pop);
 *   then, when it is reached, "The rest" rises with the "vs" popping on the seam and its
 *   answers settling;
 * - the score line rises last.
 * Hooks: data-cmp-intro, -title, -tick; data-a-layout, -side ("us" / "them"), -photo, -vs,
 * -row, -score. Transform and opacity only. Reduced motion: nothing moves. Anything already
 * on screen at first load is left alone; every part has a failsafe.
 */
export function useComparisonReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const found = scope.current;
      if (!found) return;
      const root: HTMLElement = found;
      const qa = (el: ParentNode, sel: string) =>
        Array.from(el.querySelectorAll<HTMLElement>(sel)).filter((e) => e.offsetParent !== null);
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced, isDesktop } = ctx.conditions as Record<string, boolean>;
        if (isReduced) return;
        const d = isDesktop;
        const stops: (() => void)[] = [];

        /** A play-once timeline on `trigger`; its targets are cleaned when it ends. */
        const once = (
          trigger: Element | undefined,
          targets: Element[],
          build: (tl: gsap.core.Timeline) => void,
          start = "top 82%",
        ) => {
          if (!trigger || alreadySeen(trigger)) return;
          gsap.set(targets, { transition: "none" });
          const tl = gsap.timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger, start, once: true },
            onComplete: () => gsap.set(targets, { clearProps: CLEAR_PROPS }),
          });
          build(tl);
          stops.push(failsafe(trigger, tl));
        };

        const cancel = afterInitialLoad(() => {
          safely("comparison", root, () => {
            // Intro.
            const intro = qa(root, "[data-cmp-intro]");
            const title = qa(root, "[data-cmp-title]")[0];
            if (title && !alreadySeen(title)) {
              const split = SplitText.create(title, { type: "words", mask: "words", aria: "auto" });
              const tl = gsap.timeline({
                defaults: { ease: "power4.out" },
                scrollTrigger: { trigger: title, start: "top 88%", once: true },
                onComplete: () => {
                  split.revert();
                  gsap.set(intro, { clearProps: CLEAR_PROPS });
                },
              });
              tl.from(
                split.words,
                { yPercent: 110, duration: d ? 1.1 : 0.9, stagger: 0.07 },
                0,
              ).from(
                intro,
                { y: d ? 30 : 18, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
                0.1,
              );
              stops.push(failsafe(title, tl), () => split.revert());
            }

            const layout = qa(root, "[data-a-layout]")[0];
            const score = qa(root, "[data-a-score]");
            if (layout) {
              const us = qa(layout, '[data-a-side="us"]');
              const them = qa(layout, '[data-a-side="them"]');
              const photo = qa(layout, "[data-a-photo]");
              const vs = qa(layout, "[data-a-vs]");
              const ticks = qa(layout, "[data-cmp-tick]");
              const rows = qa(layout, "[data-a-row]");

              if (layout.dataset["aLayout"] === "wide") {
                once(layout, [...us, ...them, ...photo, ...vs, ...ticks, ...rows], (tl) =>
                  tl
                    .from(us, { x: -90, opacity: 0, duration: 1.2 }, 0)
                    .from(them, { x: 90, opacity: 0, duration: 1.2 }, 0)
                    .fromTo(photo, { scale: 1.2 }, { scale: 1, duration: 1.8 }, 0)
                    .from(vs, { scale: 0.4, opacity: 0, duration: 0.8, ease: "back.out(2.2)" }, 0.5)
                    .from(
                      ticks,
                      { scale: 0.2, opacity: 0, duration: 0.6, ease: "back.out(3)", stagger: 0.09 },
                      0.6,
                    )
                    .from(
                      rows,
                      { y: 12, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 },
                      0.7,
                    ),
                );
              } else {
                const usCard = us[0];
                const themCard = them[0];
                once(usCard, [...us, ...photo, ...ticks], (tl) =>
                  tl
                    .from(us, { y: 40, opacity: 0, duration: 1 }, 0)
                    .fromTo(photo, { scale: 1.2 }, { scale: 1, duration: 1.6 }, 0)
                    .from(
                      ticks,
                      { scale: 0.2, opacity: 0, duration: 0.6, ease: "back.out(3)", stagger: 0.09 },
                      0.35,
                    ),
                );
                once(
                  themCard,
                  [...them, ...vs, ...rows],
                  (tl) =>
                    tl
                      .from(vs, { scale: 0.4, opacity: 0, duration: 0.8, ease: "back.out(2.2)" }, 0)
                      .from(them, { y: 40, opacity: 0, duration: 1 }, 0.1)
                      .from(
                        rows,
                        { y: 12, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 },
                        0.35,
                      ),
                  "top 88%",
                );
              }
            }
            once(
              score[0],
              score,
              (tl) => tl.from(score, { y: 12, opacity: 0, duration: 0.7, ease: "power3.out" }),
              "top 92%",
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
