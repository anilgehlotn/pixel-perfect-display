import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { MOTION_CONDITIONS } from "./media";
import { failsafe, safely } from "./safety";

/**
 * "Why we make skin care you eat" told in three steps, each acted out by the skin-layers
 * drawing:
 *   1. Creams and serums: a drop falls and spreads on the outer layer, which lights up.
 *   2. Food: the blood vessel appears and food rises from the cup into the deeper layers.
 *   3. SkinFusion: the cup comes forward, the whole picture settles.
 * Before the story, a big statement ("Your skin has layers...") lights up word by word, and
 * inside the drawing a camera zooms on the cream, pans down with the food and pulls back.
 *
 * Desktop with a mouse: the statement and then the story are pinned and the story follows the scroll (scrub), with
 * the active point at full ink, the others dimmed, a progress line beside the points, and the
 * drawing's card growing in as the section arrives.
 * Phones and tablets: no pinning; the same story plays once (about 3s) when the drawing
 * comes into view, points first. Reduced motion and no JavaScript: the finished picture.
 * Transform and opacity only.
 */
export function useWhyEdibleStory(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = (s: string) => Array.from(root.querySelectorAll<SVGElement | HTMLElement>(s));
      const sl = (name: string) => q(`[data-sl="${name}"]`);
      const steps = q("[data-why-step]");
      const rail = root.querySelector<HTMLElement>("[data-why-rail]");
      const card = root.querySelector<HTMLElement>("[data-why-card]");
      const art = root.querySelector<HTMLElement>("[data-why-art]");
      if (!card || !art || steps.length !== 3) return;
      const dots = sl("dot");
      const all = [...steps, card, ...q("[data-sl]"), ...(rail ? [rail] : [])];

      // The drawing, as a timeline of 3 steps (1 unit each). Used by both modes.
      const drawing = (tl: gsap.core.Timeline, stepOn: (i: number, at: number) => void) => {
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
        stepOn(0, 0);
        tl.to(sl("drop"), { y: 0, opacity: 1, duration: 0.45, ease: "power2.in" }, 0.05)
          .to(sl("spread"), { scaleX: 1, opacity: 1, duration: 0.35, ease: "power3.out" }, 0.45)
          .to(sl("edge-outer"), { opacity: 1, duration: 0.3 }, 0.45)
          .to(sl("cream-label"), { opacity: 1, duration: 0.3 }, 0.55);

        // Step 2: food rises from the cup through the blood into the deeper layers.
        stepOn(1, 1);
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
        stepOn(2, 2);
        tl.to(sl("edge-deep"), { opacity: 0, duration: 0.3 }, 2)
          .to(sl("cup"), { scale: 1, duration: 0.5, ease: "back.out(2)" }, 2)
          .to(sl("cup-label"), { opacity: 1, duration: 0.3 }, 2.15)
          .to({}, { duration: 0.35 }, 2.65);
      };

      const statement = root.querySelector<HTMLElement>("[data-why-statement]");
      const story = root.querySelector<HTMLElement>("[data-why-story]");
      const words = q("[data-why-word]");
      if (!statement || !story) return;
      all.push(...words);

      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
        if (isReduced) return;
        let cleanup: (() => void) | undefined;
        safely("why-edible", all, () => {
          if (isDesktop) {
            // The statement holds on screen while its words light up one by one.
            gsap.fromTo(
              words,
              { opacity: 0.14 },
              {
                opacity: 1,
                stagger: 0.1,
                ease: "none",
                scrollTrigger: {
                  trigger: statement,
                  start: "top top",
                  end: "+=100%",
                  scrub: 0.6,
                  pin: true,
                  anticipatePin: 1,
                },
              },
            );
            // The card grows in as the story scrolls up to the top of the screen.
            gsap.fromTo(
              card,
              { scale: 0.86, opacity: 0.4 },
              {
                scale: 1,
                opacity: 1,
                ease: "none",
                scrollTrigger: { trigger: story, start: "top bottom", end: "top top", scrub: 0.6 },
              },
            );

            const tl = gsap.timeline({
              defaults: { ease: "power2.out" },
              scrollTrigger: {
                trigger: story,
                start: "top top",
                end: "+=260%",
                scrub: 0.8,
                pin: true,
                anticipatePin: 1,
              },
            });
            tl.set(steps, { opacity: 0.28 }, 0);
            if (rail) tl.fromTo(rail, { scaleY: 0 }, { scaleY: 1, ease: "none", duration: 3 }, 0);
            drawing(tl, (i, at) => {
              if (i > 0) tl.to(steps[i - 1]!, { opacity: 0.28, duration: 0.3 }, at);
              tl.to(steps[i]!, { opacity: 1, duration: 0.3 }, at);
              tl.fromTo(
                steps[i]!.querySelector("[data-why-dot]"),
                { scale: 1 },
                { scale: 1.6, duration: 0.3, yoyo: true, repeat: 1 },
                at,
              );
            });
            // The last point stays lit; the others come back to full ink at the end.
            tl.to(steps, { opacity: 1, duration: 0.3 }, 2.65);
            return;
          }

          // Phones and tablets: the statement's words light up once, then the story plays once.
          const said = gsap.fromTo(
            words,
            { opacity: 0.14 },
            { opacity: 1, duration: 0.5, stagger: 0.035, ease: "none", paused: true },
          );
          const sayIo = new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return;
              said.play();
              sayIo.disconnect();
            },
            { threshold: 0.4 },
          );
          sayIo.observe(statement);
          const sayStop = failsafe(statement, said, 5000);
          const tl = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.out" },
            onComplete: () => {
              gsap.set([...steps, card], { clearProps: "opacity,transform" });
            },
          });
          tl.fromTo(card, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0);
          tl.set(steps, { opacity: 0, y: 16 }, 0);
          drawing(tl, (i, at) => {
            tl.to(steps[i]!, { opacity: 1, y: 0, duration: 0.45 }, at * 0.9 + 0.3);
          });
          tl.timeScale(1.15);
          const io = new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return;
              tl.play();
              io.disconnect();
            },
            { threshold: 0.3 },
          );
          io.observe(art);
          const stop = failsafe(art, tl, 6000);
          cleanup = () => {
            io.disconnect();
            stop();
            sayIo.disconnect();
            sayStop();
          };
        });
        return () => cleanup?.();
      });
      return () => mm.revert();
    },
    { scope },
  );
}
