import { useEffect, type RefObject } from "react";

/**
 * Pauses the endless CSS animations inside `ref` (rotating badge, marquee) while the
 * element is off-screen or the browser tab is hidden, by toggling the `is-paused` class
 * (see styles.css). Returns nothing; safe to call during server rendering.
 */
export function usePauseWhenHidden(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let onScreen = false;
    const update = () => el.classList.toggle("is-paused", !onScreen || document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
}
