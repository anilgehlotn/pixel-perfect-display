// On the first page load the server HTML is already on screen before React hydrates, and
// the browser / router may still restore the scroll position (refresh, back/forward).
// Hiding something the visitor can already see (to animate it in) would make it flash, so:
// - scroll animations on the first load wait until the page has loaded and the scroll
//   position has settled (afterInitialLoad), then skip anything already in view
//   (alreadySeen);
// - after that (client-side route changes) React renders new DOM before paint, so setups
//   run immediately and everything can animate.
let hydrated = false;
let settled = false;
const queue = new Set<() => void>();

export const markHydrated = () => {
  hydrated = true;
};

/** True once React has hydrated the first page (used by the hero entrance). */
export const isHydrated = () => hydrated;

/** Runs the queued first-load setups, then switches to immediate mode. */
export function settleInitialLoad() {
  if (settled) return;
  for (const fn of queue) fn();
  queue.clear();
  settled = true;
}

/**
 * Runs `fn` now if the first load has settled, otherwise once it has. Returns a cancel
 * function for unmounts before that.
 */
export function afterInitialLoad(fn: () => void) {
  if (settled) {
    fn();
    return () => {};
  }
  queue.add(fn);
  return () => queue.delete(fn);
}

export function isInViewport(el: Element) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

/** True if this element was already visible on the first load before animations started. */
export const alreadySeen = (el: Element) => !settled && isInViewport(el);
