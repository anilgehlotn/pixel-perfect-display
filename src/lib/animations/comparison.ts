import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { afterInitialLoad, alreadySeen } from "./hydration";
import { MOTION_CONDITIONS } from "./media";
import { CLEAR_PROPS, failsafe, safely } from "./safety";

/**
 * "SkinFusion vs. the rest": a calm, staged reveal, played once per part as it scrolls in.
 * - Header (desktop table): the SkinFusion heading rises, its leaf badge pops with a small
 *   spring, the other column headings fade in after it.
 * - Each row (table row on desktop, card on phones): the label slides in, then the coral
 *   tick pops (scale 0.4 to 1, spring), then the competitor's answer settles in.
 * - The "See Skin Glow Tea" button rises last.
 * Markup hooks: data-cmp-head, data-cmp-badge, data-cmp-other, data-cmp-row, data-cmp-label,
 * data-cmp-mark, data-cmp-val, data-cmp-cta. Only the layout that is showing (table from md,
 * cards on phones) is animated. Transform and opacity only; reduced motion and anything
 * already on screen at first load stay as they are; every part has a failsafe.
 */
export function useComparisonReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const shown = (el: Element) => (el as HTMLElement).offsetParent !== null;
      const qa = (el: ParentNode, sel: string) =>
        Array.from(el.querySelectorAll<HTMLElement>(sel)).filter(shown);
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced, isDesktop } = ctx.conditions as Record<string, boolean>;
        if (isReduced) return;
        const stops: (() => void)[] = [];
        const cancel = afterInitialLoad(() => {
          safely("comparison", root, () => {
            const once = (trigger: Element, build: (tl: gsap.core.Timeline) => void) => {
              if (alreadySeen(trigger)) return;
              const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: { trigger, start: "top 86%", once: true },
              });
              build(tl);
              const targets = tl
                .getChildren(true, true, false)
                .flatMap((t) => gsap.utils.toArray<HTMLElement>((t as gsap.core.Tween).targets()));
              gsap.set(targets, { transition: "none" });
              tl.eventCallback("onComplete", () => gsap.set(targets, { clearProps: CLEAR_PROPS }));
              stops.push(failsafe(trigger, tl));
            };
            const d = isDesktop;

            // Header (desktop table).
            const head = qa(root, "[data-cmp-head]");
            if (head.length) {
              once(head[0]!, (tl) => {
                tl.from(head, { y: d ? 36 : 20, opacity: 0, duration: d ? 1 : 0.7 }, 0)
                  .from(
                    qa(root, "[data-cmp-badge]"),
                    { scale: 0.4, opacity: 0, duration: 0.8, ease: "back.out(2.4)" },
                    0.2,
                  )
                  .from(
                    qa(root, "[data-cmp-other]"),
                    { y: 14, opacity: 0, duration: 0.7, stagger: 0.1 },
                    0.35,
                  );
              });
            }

            // Rows / cards.
            for (const row of qa(root, "[data-cmp-row]")) {
              once(row, (tl) => {
                const card = row.matches("li") ? [row] : [];
                if (card.length) tl.from(card, { y: 28, opacity: 0, duration: 0.7 }, 0);
                tl.from(
                  qa(row, "[data-cmp-label]"),
                  { x: d ? -24 : 0, y: d ? 0 : 10, opacity: 0, duration: d ? 0.8 : 0.6 },
                  card.length ? 0.1 : 0,
                )
                  .from(
                    qa(row, "[data-cmp-mark]"),
                    { scale: 0.4, opacity: 0, duration: 0.7, ease: "back.out(2.6)" },
                    card.length ? 0.25 : 0.18,
                  )
                  .from(
                    qa(row, "[data-cmp-val]"),
                    { y: 10, opacity: 0, duration: 0.6, stagger: 0.08 },
                    card.length ? 0.38 : 0.3,
                  );
              });
            }

            // Button.
            for (const cta of qa(root, "[data-cmp-cta]")) {
              once(cta, (tl) => tl.from(cta, { y: 18, opacity: 0, duration: 0.7 }));
            }
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
