import { gsap, SplitText } from "./gsap";
import type { MotionMode } from "./media";
import type { Cleanup } from "./presets";
import { CLEAR_PROPS, failsafe } from "./safety";

export type HeroParts = {
  section: HTMLElement;
  image: HTMLElement;
  kicker: HTMLElement;
  heading: HTMLElement;
  actions: HTMLElement;
};

/**
 * Homepage hero entrance. `delayMs` lines it up with the intro loader sliding away.
 * `withChrome` also brings in the header, nav links and 10%-off badge: only after the intro
 * loader, since on a normal page change those are already on screen.
 */
export function heroEntrance(
  parts: HeroParts,
  mode: MotionMode,
  { delayMs, withChrome }: { delayMs: number; withChrome: boolean },
): Cleanup {
  const { section, image, kicker, heading, actions } = parts;
  const buttons = Array.from(actions.children);
  const header = withChrome ? document.querySelector<HTMLElement>('[data-hero="header"]') : null;
  const navLinks = withChrome
    ? Array.from(document.querySelectorAll<HTMLElement>('[data-hero="nav"] > *'))
    : [];
  const badge = withChrome ? document.querySelector<HTMLElement>('[data-hero="badge"]') : null;
  const all = [image, kicker, heading, ...buttons, header, ...navLinks, badge].filter(
    Boolean,
  ) as HTMLElement[];

  let split: SplitText | null = null;
  const tl = gsap.timeline({
    delay: delayMs / 1000,
    onStart: () => gsap.set(all, { willChange: "transform, opacity" }),
    onComplete: () => {
      split?.revert();
      gsap.set(all, { clearProps: CLEAR_PROPS });
    },
  });
  // Buttons have a CSS transform transition (press effect); switch it off while animating.
  gsap.set(buttons, { transition: "none" });

  if (mode === "desktop") {
    split = SplitText.create(heading, { type: "words", mask: "words", aria: "auto" });
    if (header) tl.from(header, { y: -24, opacity: 0, duration: 0.7 }, 0);
    if (navLinks.length)
      tl.from(navLinks, { y: -12, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.15);
    tl.fromTo(
      image,
      { clipPath: "inset(0% 0% 0% 100%)", scale: 1.08 },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut" },
      0,
    )
      .to(image, { scale: 1, duration: 1.6, ease: "power2.out" }, 0)
      .from(kicker, { y: 16, opacity: 0, duration: 0.6 }, 0.45)
      .from(split.words, { yPercent: 110, color: "#d4d4d4", duration: 0.9, stagger: 0.06 }, 0.5)
      .from(buttons, { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, 0.9);
    if (badge)
      tl.from(badge, { scale: 0.6, opacity: 0, duration: 0.6, ease: "back.out(1.7)" }, 1.2);
  } else {
    // Mobile: no clip-path, no word split, no color. Transform and opacity only.
    tl.from([kicker, heading], { y: 20, opacity: 0, duration: 0.7 }, 0)
      .from(image, { opacity: 0, scale: 1.04, duration: 0.9 }, 0)
      .from(buttons, { y: 16, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.35);
  }

  return failsafe(section, tl, delayMs + 3000);
}
