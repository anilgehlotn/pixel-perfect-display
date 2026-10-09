import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { MOTION_CONDITIONS, type MotionMode } from "./media";
import { countUp, presets, type Cleanup, type PresetName } from "./presets";
import { safely } from "./safety";

/**
 * Wires up every scroll animation inside `scope`, driven by data attributes in the markup:
 *   data-anim="heading" | "fade" | "cards" | "tilt" | "draw" | "pop"   (see presets.ts)
 *   data-count                                                       (number counts up)
 * Runs only in the browser (useGSAP is a layout effect), reverts everything on unmount
 * (route change) and re-runs when `dependencies` change. Reduced motion: does nothing.
 */
export function useScrollAnimations(
  scope: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (isReduced) return;
        const mode: MotionMode = isDesktop ? "desktop" : "mobile";
        const cleanups: Cleanup[] = [];
        root.querySelectorAll<HTMLElement>("[data-anim]").forEach((el) => {
          const name = el.dataset["anim"] as PresetName;
          const preset = presets[name];
          if (preset) safely(name, el, () => cleanups.push(preset(el, mode)));
        });
        root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          safely("count", null, () => cleanups.push(countUp(el, mode)));
        });
        return () => cleanups.forEach((fn) => fn());
      });
      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
