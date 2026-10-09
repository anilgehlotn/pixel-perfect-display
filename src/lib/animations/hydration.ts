// On the first page load the server HTML is already on screen before React hydrates. Hiding
// something the visitor can already see (to animate it in) would make it flash, so presets
// skip elements that are in view during that first hydration. After hydration (client-side
// route changes) React renders new DOM before paint, so everything can animate.
let hydrated = false;

export const markHydrated = () => {
  hydrated = true;
};

export const isHydrated = () => hydrated;

export function isInViewport(el: Element) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

/** True if this element was already visible to the visitor before animations could start. */
export const alreadySeen = (el: Element) => !hydrated && isInViewport(el);
