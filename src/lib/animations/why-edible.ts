import { useCallback, useRef, type RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { MOTION_CONDITIONS } from "./media";
import { failsafe, safely } from "./safety";

/**
 * "Why we make skin care you eat": the skin-layers drawing plays a short story once (about
 * 2s) when it comes into view, on every device:
 *   1. a cream drop lands and stays on the outer layer, which lights up;
 *   2. the blood vessel appears and food rises from the cup into the deeper layers;
 *   3. the cup comes forward.
 * A camera inside the drawing zooms on the cream, pans down with the food and pulls back.
 * No pinning or scroll-jacking: this is a shop, people must reach the products quickly.
 * `onStep(i)` reports the step being shown (0-2) so the matching step button can light up, and
 * the returned `goTo(i)` replays just that step (the step buttons call it).
 * Reduced motion and no JavaScript: the finished picture. Transform and opacity only.
 */
export function useWhyEdibleStory(
  scope: RefObject<HTMLElement | null>,
  onStep?: (step: number) => void,
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const replay = useRef<gsap.core.Tween | null>(null);
  const stepRef = useRef(onStep);
  stepRef.current = onStep;

  const goTo = useCallback((step: number) => {
    const tl = tlRef.current;
    if (!tl) return;
    replay.current?.kill();
    tl.pause();
    replay.current = tl.tweenFromTo(step, Math.min(step + 1, tl.duration()));
  }, []);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = (s: string) => Array.from(root.querySelectorAll<SVGElement | HTMLElement>(s));
      const sl = (name: string) => q(`[data-sl="${name}"]`);
      const card = root.querySelector<HTMLElement>("[data-why-card]");
      const art = root.querySelector<HTMLElement>("[data-why-art]");
      if (!card || !art) return;
      const dots = sl("dot");
      const all = [card, ...q("[data-sl]")];

      // The drawing, as a timeline of 3 steps (1 unit each).
      const drawing = (tl: gsap.core.Timeline) => {
        // Start state.
        tl.set(sl("drop"), { y: -46, opacity: 0 }, 0)
          .set(sl("spread"), { scaleX: 0, opacity: 0, transformOrigin: "50% 50%" }, 0)
          .set([...sl("cream-label"), ...sl("food-label"), ...sl("cup-label")], { opacity: 0 }, 0)
          .set(sl("vessel"), { opacity: 0 }, 0)
          .set(dots, { y: 0, opacity: 0 }, 0)
          .set(sl("cup"), { scale: 0.7, opacity: 0.35, transformOrigin: "50% 100%" }, 0)
          .set(sl("camera"), { x: 0, y: 0, scale: 1, svgOrigin: "0 0" }, 0);
        // Camera: zoom on the cream (step 1), pan down with the food (step 2), pull back (3).
        // Focus point (fx, fy) at scale s lands in the middle of the 320x300 drawing.
        const focus = (fx: number, fy: number, s: number, at: number) =>
          tl.to(
            sl("camera"),
            { x: 160 - s * fx, y: 150 - s * fy, scale: s, duration: 0.6, ease: "power2.inOut" },
            at,
          );
        focus(150, 85, 1.3, 0);
        focus(200, 190, 1.25, 0.95);
        focus(160, 150, 1, 1.95);

        // Step 1: cream lands on the outer layer and stays there.
        tl.to(sl("drop"), { y: 0, opacity: 1, duration: 0.45, ease: "power2.in" }, 0.05)
          .to(sl("spread"), { scaleX: 1, opacity: 1, duration: 0.35, ease: "power3.out" }, 0.45)
          .to(sl("edge-outer"), { opacity: 1, duration: 0.3 }, 0.45)
          .to(sl("cream-label"), { opacity: 1, duration: 0.3 }, 0.55);

        // Step 2: food rises from the cup through the blood into the deeper layers.
        tl.to(sl("edge-outer"), { opacity: 0, duration: 0.3 }, 1)
          .to(sl("vessel"), { opacity: 1, duration: 0.3 }, 1)
          .to(sl("cup"), { opacity: 1, duration: 0.3 }, 1)
          .to(sl("edge-deep"), { opacity: 1, duration: 0.3 }, 1.25)
          .to(sl("food-label"), { opacity: 1, duration: 0.3 }, 1.45);
        dots.forEach((dot, i) => {
          tl.to(dot, { opacity: 1, duration: 0.1 }, 1.1 + i * 0.1).to(
            dot,
            { y: -i * 28, duration: 0.55, ease: "power1.out" },
            1.1 + i * 0.1,
          );
        });

        // Step 3: one cup a day.
        tl.to(sl("edge-deep"), { opacity: 0, duration: 0.3 }, 2)
          .to(sl("cup"), { scale: 1, duration: 0.5, ease: "back.out(2)" }, 2)
          .to(sl("cup-label"), { opacity: 1, duration: 0.3 }, 2.15)
          .to({}, { duration: 0.35 }, 2.65);
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isReduced } = ctx.conditions as Record<string, boolean>;
        if (isReduced) return;
        let cleanup: (() => void) | undefined;
        safely("why-edible", all, () => {
          // Every device: the drawing plays its short story once when it comes into view.
          // The text is never hidden or held back: shoppers can read on and scroll past.
          const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
          drawing(tl);
          tl.timeScale(1.4);
          let shown = -1;
          tl.eventCallback("onUpdate", () => {
            const s = Math.min(2, Math.floor(tl.time() + 0.001));
            if (s !== shown) {
              shown = s;
              stepRef.current?.(s);
            }
          });
          // Show the start state now (the drawing is usually still below the screen).
          tl.progress(1).progress(0);
          tlRef.current = tl;
          const io = new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return;
              tl.play();
              io.disconnect();
            },
            { threshold: 0.4 },
          );
          io.observe(art);
          const stop = failsafe(art, tl, 5000);
          cleanup = () => {
            io.disconnect();
            stop();
            replay.current?.kill();
            tlRef.current = null;
          };
        });
        return () => cleanup?.();
      });
      return () => mm.revert();
    },
    { scope },
  );

  return { goTo };
}
