// Breakpoints for gsap.matchMedia(). Everything that is not "desktop" (phones, tablets,
// touch laptops) gets the light mobile presets.
export const DESKTOP_QUERY =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

// Everything that isn't a desktop with a mouse (reduced motion is checked separately).
export const MOBILE_QUERY = "not all and (min-width: 1024px) and (pointer: fine)";

// Pass to gsap.matchMedia().add(); read back with ctx.conditions. gsap only runs the setup
// when at least one condition matches, so every device must match one of these.
export const MOTION_CONDITIONS = {
  isDesktop: DESKTOP_QUERY,
  isMobile: MOBILE_QUERY,
  isReduced: REDUCED_QUERY,
};

export type MotionMode = "desktop" | "mobile";

export const isBrowser = () => typeof window !== "undefined";

export const prefersReducedMotion = () => isBrowser() && window.matchMedia(REDUCED_QUERY).matches;

export const isDesktopMotion = () => isBrowser() && window.matchMedia(DESKTOP_QUERY).matches;
