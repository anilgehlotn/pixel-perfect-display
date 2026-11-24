import type { RefObject } from "react";
import { gsap, SplitText, useGSAP } from "./gsap";
import { afterInitialLoad, alreadySeen } from "./hydration";
import { MOTION_CONDITIONS } from "./media";
import { countUp } from "./presets";
import { CLEAR_PROPS, failsafe, safely } from "./safety";

/**
 * "SkinFusion vs. the rest" scroll animation. Each part plays once as it scrolls in:
 * - intro: the title's words rise out of a mask one by one, eyebrow and line rise;
 * - the arch collage: the arch rises while the cup photo settles from 1.18 to 1, the red-dates
 *   circle and the circular text badge pop in, then the caption pill (desktop with a mouse:
 *   the photo drifts inside the arch and the red-dates circle at another speed, for depth);
 * - a soft coral glow travels down behind the board with the scroll (scrubbed); every row
 *   stays fully readable;
 * - the board: rises; the green SkinFusion column grows down from the top (scaleY, from md);
 *   the three column heads come in; then the rows one by one: the row rises (phones), the
 *   label comes in, then its tiles cascade left to right: the SkinFusion tile settles with
 *   its coral tick popping, the two competitor answers slide in after it; a thin coral line
 *   draws down the side; the button rises;
 * - "Ticks out of five": the three bars fill from zero (scaleX) while the numbers count up.
 * Hooks: data-cmp-intro, -arch, -depth, -chip, -board, -col, -line, -head, -row, -label,
 * -tile, -mark, -cta, -score, -bar, -count. Transform and opacity only. Reduced motion:
 * nothing moves. Anything already on screen at first load is left alone; failsafes.
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
            // Intro: the title's words rise out of a mask; eyebrow and line rise.
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

            // The arch.
            const arch = qa(root, "[data-cmp-arch]")[0];
            const depth = qa(root, "[data-cmp-depth]");
            const chip = qa(root, "[data-cmp-chip]");
            const inset = qa(root, "[data-cmp-inset]");
            const ringBadge = qa(root, "[data-cmp-ring-badge]");
            if (arch) {
              once(
                arch,
                [arch, ...chip, ...inset, ...ringBadge],
                (tl) =>
                  tl
                    .from(arch, { y: d ? 80 : 40, opacity: 0, duration: 1.2, ease: "expo.out" }, 0)
                    .fromTo(
                      depth,
                      { scale: 1.18 },
                      { scale: 1, duration: 1.8, ease: "expo.out", clearProps: "scale" },
                      0,
                    )
                    .from(
                      inset,
                      { scale: 0.4, opacity: 0, duration: 0.9, ease: "back.out(1.8)" },
                      0.45,
                    )
                    .from(
                      ringBadge,
                      { scale: 0.5, opacity: 0, duration: 0.9, ease: "back.out(2)" },
                      0.55,
                    )
                    .from(
                      chip,
                      { y: 16, scale: 0.85, opacity: 0, duration: 0.7, ease: "back.out(2)" },
                      0.7,
                    ),
                "top 88%",
              );
              if (d) {
                gsap.fromTo(
                  inset.map((el) => el.parentElement as HTMLElement),
                  { y: 40 },
                  {
                    y: -40,
                    ease: "none",
                    scrollTrigger: {
                      trigger: arch,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
                gsap.fromTo(
                  depth,
                  { yPercent: -5 },
                  {
                    yPercent: 5,
                    ease: "none",
                    scrollTrigger: {
                      trigger: arch,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              }
            }

            // The board.
            const board = qa(root, "[data-cmp-board]")[0];
            if (board) {
              const col = qa(board, "[data-cmp-col]");
              const line = qa(board, "[data-cmp-line]");
              const heads = qa(board, "[data-cmp-head]");
              const rows = qa(board, "[data-cmp-row]");
              const cta = qa(board, "[data-cmp-cta]");
              const parts = rows.flatMap((r) => [
                ...qa(r, "[data-cmp-label]"),
                ...qa(r, "[data-cmp-tile]"),
                ...qa(r, "[data-cmp-mark]"),
              ]);
              once(
                board,
                [board, ...col, ...line, ...heads, ...parts, ...cta],
                (tl) => {
                  tl.from(board, { y: d ? 60 : 30, opacity: 0, duration: 1, ease: "expo.out" }, 0)
                    .from(col, { scaleY: 0, duration: 1.2, ease: "expo.inOut" }, 0.15)
                    .from(heads, { y: 14, opacity: 0, duration: 0.6, stagger: 0.1 }, 0.5)
                    .from(
                      line,
                      { scaleY: 0, duration: 0.4 + rows.length * 0.18, ease: "power1.inOut" },
                      0.55,
                    );
                  rows.forEach((r, i) => {
                    const at = 0.6 + i * 0.18;
                    tl.from(qa(r, "[data-cmp-label]"), { y: 14, opacity: 0, duration: 0.6 }, at)
                      .from(
                        qa(r, '[data-cmp-tile="ours"]'),
                        { scale: 0.9, opacity: 0, duration: 0.6, ease: "expo.out" },
                        at + 0.08,
                      )
                      .from(
                        qa(r, "[data-cmp-mark]"),
                        { scale: 0.2, opacity: 0, duration: 0.6, ease: "back.out(3)" },
                        at + 0.16,
                      )
                      .from(
                        qa(r, '[data-cmp-tile="other"]'),
                        { x: 18, opacity: 0, duration: 0.6, stagger: 0.08 },
                        at + 0.22,
                      );
                  });
                  tl.from(cta, { y: 18, opacity: 0, duration: 0.7 }, 0.7 + rows.length * 0.18);
                },
                "top 82%",
              );
            }

            // The coral glow travels down the board with the scroll.
            const glow = qa(root, "[data-cmp-glow]")[0];
            const glowBox = glow?.parentElement;
            if (glow && glowBox) {
              gsap.fromTo(
                glow,
                { y: 0 },
                {
                  y: () => Math.max(0, glowBox.offsetHeight - glow.offsetHeight),
                  ease: "none",
                  scrollTrigger: {
                    trigger: glowBox,
                    start: "top 60%",
                    end: "bottom 40%",
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                  },
                },
              );
            }

            // Ticks out of five: bars fill while the numbers count.
            const scoreEl = qa(root, "[data-cmp-score]")[0];
            const bars = qa(root, "[data-cmp-bar]");
            once(
              scoreEl,
              bars,
              (tl) =>
                tl.from(bars, {
                  scaleX: 0,
                  duration: 1.4,
                  ease: "expo.out",
                  stagger: 0.15,
                }),
              "top 88%",
            );
            for (const el of qa(root, "[data-cmp-count]"))
              stops.push(countUp(el, d ? "desktop" : "mobile"));
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
