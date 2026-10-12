import { gsap } from "./gsap";

// Inline styles GSAP may leave behind; cleared after every entrance so CSS is in charge again.
export const CLEAR_PROPS = "opacity,transform,visibility,willChange,transition,clipPath,color";

/**
 * Runs an animation setup function. If it throws, the error is logged and the targets are
 * reset to their normal (visible) state, so an animation bug can never hide content or crash
 * React.
 */
export function safely(label: string, targets: gsap.TweenTarget | null, setup: () => void) {
  try {
    setup();
  } catch (error) {
    console.error(`[animations] ${label} failed`, error);
    if (targets) gsap.set(targets, { clearProps: CLEAR_PROPS });
  }
}

/**
 * Safety net for play-once entrances: if the element has been on screen for 3 seconds and
 * its animation still hasn't finished (trigger never fired, tab throttled...), jump to the
 * end so the content is shown. Returns a cleanup function.
 */
export function failsafe(trigger: Element, animation: gsap.core.Animation, ms = 3000) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting) || timer) return;
    timer = setTimeout(() => {
      if (animation.progress() < 1) animation.progress(1);
      io.disconnect();
    }, ms);
  });
  io.observe(trigger);
  return () => {
    io.disconnect();
    if (timer) clearTimeout(timer);
  };
}
