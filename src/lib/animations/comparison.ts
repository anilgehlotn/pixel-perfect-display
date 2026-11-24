import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { afterInitialLoad, alreadySeen } from "./hydration";
import { MOTION_CONDITIONS } from "./media";
import { CLEAR_PROPS, failsafe, safely } from "./safety";

/**
 * "SkinFusion vs. the rest".
 *
 * Phones: a stacking deck. Each card is CSS `position: sticky` a little lower than the one
 * before (set in the markup), so as you scroll the next card slides up over it. While it
 * does, the card underneath shrinks slightly and dims (scrubbed, transform and opacity only).
 * When a card arrives, its coral tick pops with a spring, a soft sheen sweeps across the green
 * SkinFusion tile, and the competitor's answer settles in (once).
 *
 * Desktop and tablet: a scroll-driven reveal that follows the scroll and reverses going up.
 * The green SkinFusion heading rises and its badge pops, then the rows light up one after
 * another: the label brightens and slides in, the tick pops, the competitor answers come up
 * from faint. The button rises last.
 *
 * Markup hooks: data-cmp-head, -badge, -other, -row, -label, -mark, -val, -cta, -dim, -shine.
 * Only the layout that is showing is animated. Reduced motion: no movement, no sticking.
 * Content already on screen at first load is left alone; play-once parts have a failsafe.
 */
export function useComparisonReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const found = scope.current;
      if (!found) return;
      const root: HTMLElement = found;
      const shown = (el: Element) => (el as HTMLElement).offsetParent !== null;
      const qa = (el: ParentNode, sel: string) =>
        Array.from(el.querySelectorAll<HTMLElement>(sel)).filter(shown);
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced } = ctx.conditions as Record<string, boolean>;
        if (isReduced) return;
        const stops: (() => void)[] = [];
        const cancel = afterInitialLoad(() => {
          safely("comparison", root, () => {
            const cards = qa(root, "li[data-cmp-row]");
            if (cards.length) phones(cards);
            else table();
          });
        });

        /** Phones: stacking deck + per-card arrival. */
        function phones(cards: HTMLElement[]) {
          cards.forEach((card, i) => {
            const next = cards[i + 1];
            // The card underneath recedes while the next one slides over it.
            if (next) {
              const dim = card.querySelector<HTMLElement>("[data-cmp-dim]");
              const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: next,
                  start: "top bottom",
                  end: () => `top ${parseFloat(getComputedStyle(next).top) || 88}px`,
                  scrub: 0.4,
                  invalidateOnRefresh: true,
                },
              });
              tl.fromTo(card, { scale: 1 }, { scale: 0.93, transformOrigin: "50% 0%" }, 0);
              if (dim) tl.fromTo(dim, { opacity: 0 }, { opacity: 0.12 }, 0);
            }
            // Arrival, once: card rises, tick pops, sheen sweeps, answer settles.
            if (alreadySeen(card)) return;
            const mark = card.querySelectorAll("[data-cmp-mark]");
            const shine = card.querySelectorAll("[data-cmp-shine]");
            const label = card.querySelectorAll("[data-cmp-label]");
            const val = card.querySelectorAll("[data-cmp-val]");
            const parts = [mark, label, val];
            const arrive = gsap.timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: card, start: "top 92%", once: true },
              onComplete: () => gsap.set(parts, { clearProps: CLEAR_PROPS }),
            });
            arrive
              .from(label, { y: 12, opacity: 0, duration: 0.6 }, 0.05)
              .from(mark, { scale: 0.3, opacity: 0, duration: 0.75, ease: "back.out(2.8)" }, 0.2)
              .fromTo(
                shine,
                { xPercent: 0, opacity: 0 },
                { xPercent: 420, opacity: 1, duration: 1.1, ease: "power2.inOut" },
                0.3,
              )
              .to(shine, { opacity: 0, duration: 0.2 }, 1.2)
              .from(val, { y: 10, opacity: 0, duration: 0.6 }, 0.4);
            stops.push(failsafe(card, arrive));
          });
          for (const cta of qa(root, "[data-cmp-cta]")) {
            if (alreadySeen(cta)) continue;
            const t = gsap.from(cta, {
              y: 18,
              opacity: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: cta, start: "top 94%", once: true },
              onComplete: () => gsap.set(cta, { clearProps: CLEAR_PROPS }),
            });
            stops.push(failsafe(cta, t));
          }
        }

        /** Tablet and desktop: scroll-driven, reversible reveal of the table. */
        function table() {
          const head = qa(root, "[data-cmp-head]");
          const rows = qa(root, "tr[data-cmp-row]");
          const tableEl = root.querySelector("table");
          if (!tableEl || !rows.length) return;
          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: tableEl,
              start: "top 85%",
              end: "bottom 70%",
              scrub: 0.8,
            },
          });
          tl.from(head, { y: 70, opacity: 0, duration: 1 }, 0)
            .from(
              qa(root, "[data-cmp-badge]"),
              { scale: 0.3, rotate: -25, opacity: 0, duration: 0.8, ease: "back.out(2.4)" },
              0.35,
            )
            .from(
              qa(root, "[data-cmp-other]"),
              { y: 24, opacity: 0, duration: 0.8, stagger: 0.15 },
              0.5,
            );
          rows.forEach((row, i) => {
            const at = 1 + i * 0.7;
            tl.from(qa(row, "[data-cmp-label]"), { x: -40, opacity: 0.12, duration: 0.8 }, at)
              .from(
                qa(row, "[data-cmp-mark]"),
                { scale: 0.2, opacity: 0, duration: 0.7, ease: "back.out(3)" },
                at + 0.15,
              )
              .from(
                qa(row, "[data-cmp-val]"),
                { y: 14, opacity: 0.1, duration: 0.7, stagger: 0.12 },
                at + 0.25,
              );
          });
          tl.from(
            qa(root, "[data-cmp-cta]"),
            { y: 24, opacity: 0, duration: 0.8 },
            1 + rows.length * 0.7,
          );
        }

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
