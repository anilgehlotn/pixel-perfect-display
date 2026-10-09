import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { DESKTOP_QUERY } from "./media";

// Lenis smooth scrolling, desktop with a mouse only. Phones and tablets keep native scroll.
let lenis: Lenis | null = null;
let locks = 0;

export const getLenis = () => lenis;

/** Starts Lenis while the desktop media query matches. Returns a cleanup function. */
export function initSmoothScroll() {
  const mm = gsap.matchMedia();
  mm.add(DESKTOP_QUERY, () => {
    const instance = new Lenis({ anchors: true, autoRaf: false });
    lenis = instance;
    instance.on("scroll", ScrollTrigger.update);
    // Drive Lenis from GSAP's ticker so scrolling and ScrollTrigger share one frame loop.
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (locks > 0) instance.stop();
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis = null;
    };
  });
  return () => mm.revert();
}

/** Called by the scroll lock so Lenis stops while a drawer, menu or modal is open. */
export function setSmoothScrollLocked(locked: boolean) {
  locks = Math.max(0, locks + (locked ? 1 : -1));
  if (!lenis) return;
  if (locks > 0) lenis.stop();
  else lenis.start();
}
