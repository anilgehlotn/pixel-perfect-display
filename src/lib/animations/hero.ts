import { gsap, SplitText } from "./gsap";
import type { MotionMode } from "./media";
import type { Cleanup } from "./presets";
import { CLEAR_PROPS, failsafe } from "./safety";

export type HeroParts = {
  section: HTMLElement;
  heading: HTMLElement;
  line: HTMLElement;
  actions: HTMLElement;
  /** Composition pieces (centre image first), each a wrapper without its own CSS animation. */
  pieces: HTMLElement[];
};

/**
 * Homepage hero entrance. `delayMs` lines it up with the intro loader sliding away.
 * `withChrome` also brings in the floating nav and the 10%-off badge: only after the intro
 * loader, since on a normal page change those are already on screen.
 */
export function heroEntrance(
  parts: HeroParts,
  mode: MotionMode,
  { delayMs, withChrome }: { delayMs: number; withChrome: boolean },
): Cleanup {
  const { section, heading, line, actions, pieces } = parts;
  const buttons = Array.from(actions.children) as HTMLElement[];
  const header = withChrome ? document.querySelector<HTMLElement>('[data-hero="header"]') : null;
  const badge = withChrome ? document.querySelector<HTMLElement>('[data-hero="badge"]') : null;
  const all = [heading, line, ...buttons, ...pieces, header, badge].filter(
    Boolean,
  ) as HTMLElement[];

  let split: SplitText | null = null;
  const tl = gsap.timeline({
    delay: delayMs / 1000,
    defaults: { ease: "power3.out" },
    onStart: () => gsap.set(all, { willChange: "transform, opacity" }),
    onComplete: () => {
      split?.revert();
      gsap.set(all, { clearProps: CLEAR_PROPS });
    },
  });
  // Buttons and the nav have CSS transform transitions; switch them off while animating.
  gsap.set(all, { transition: "none" });

  if (mode === "desktop") {
    split = SplitText.create(heading, { type: "lines", mask: "lines", aria: "auto" });
    if (header) tl.from(header, { y: -24, opacity: 0, duration: 0.8 }, 0);
    tl.from(split.lines, { yPercent: 105, duration: 1.2, ease: "power4.out", stagger: 0.12 }, 0.1)
      .from(line, { y: 16, opacity: 0, duration: 0.8 }, 0.5)
      .from(buttons, { y: 16, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.65)
      .from(
        pieces,
        { opacity: 0, scale: 0.94, y: 24, duration: 1.4, ease: "power2.out", stagger: 0.08 },
        0.2,
      );
    if (badge)
      tl.from(badge, { scale: 0.6, opacity: 0, duration: 0.6, ease: "back.out(1.7)" }, 1.2);
  } else {
    // Mobile: no splitting. Transform and opacity only, short distances.
    tl.from([heading, line], { y: 20, opacity: 0, duration: 0.7, stagger: 0.06 }, 0)
      .from(buttons, { y: 16, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.3)
      .from(pieces, { opacity: 0, scale: 0.97, duration: 0.9, stagger: 0.05 }, 0.15);
  }

  return failsafe(section, tl, delayMs + 3000);
}
