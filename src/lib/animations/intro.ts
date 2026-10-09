// Intro loader timings (ms). The loader itself is pure CSS, switched on by a tiny inline
// script in <head> before first paint, so it never waits for the JS bundle and can never
// stay up longer than `total`. Without JavaScript it never shows.
// letter: fade-up of each letter, stagger: delay between letters, out: slide-up duration,
// total: when the loader is fully gone. The hold is whatever is left between the last
// letter landing and the slide starting at (total - out).
type IntroTiming = { letter: number; stagger: number; out: number; total: number };
export const INTRO: Record<"desktop" | "mobile", IntroTiming> = {
  desktop: { letter: 500, stagger: 55, out: 450, total: 1600 },
  mobile: { letter: 350, stagger: 30, out: 320, total: 1000 },
};

export const INTRO_STORAGE_KEY = "sf-intro-seen";

type IntroTimes = { start: number; reveal: number };
declare global {
  interface Window {
    __sfIntro?: IntroTimes;
  }
}

/**
 * Runs before first paint. Shows the loader only on the homepage, once per session, when
 * the page starts at the top (no reload/back-forward, no #hash) and motion is allowed.
 */
export const introScript = `(function(){try{
var d=document.documentElement,w=window;
if(location.pathname!=="/"||location.hash)return;
if(w.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(sessionStorage.getItem("${INTRO_STORAGE_KEY}"))return;
var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
if(n&&(n.type==="reload"||n.type==="back_forward"))return;
if(w.scrollY>0)return;
sessionStorage.setItem("${INTRO_STORAGE_KEY}","1");
var desk=w.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
d.setAttribute("data-intro",desk?"desktop":"mobile");
w.__sfIntro={start:performance.now(),reveal:desk?${INTRO.desktop.total - INTRO.desktop.out}:${INTRO.mobile.total - INTRO.mobile.out}};
}catch(e){}})();`;

const vars = (t: IntroTiming) =>
  `--sf-letter:${t.letter}ms;--sf-stagger:${t.stagger}ms;--sf-out:${t.out}ms;--sf-out-delay:${t.total - t.out}ms;`;

// Loader styles, inlined in <head> so they apply at first paint. Letters start faint
// (0.15), not invisible, so the first frame counts as content for FCP/LCP: Chrome doesn't
// record a paint when a compositor opacity animation starts from 0. Hidden unless the script
// above set html[data-intro]. The overlay ends translated off-screen and visibility:hidden,
// so it can't block clicks after `total`.
export const introCss = `
.sf-intro{display:none}
html[data-intro] .sf-intro{display:grid;place-items:center;position:fixed;inset:0;z-index:100;
background:#fbf7f2;color:#1f1f1f;will-change:transform;
animation:sf-intro-out var(--sf-out) cubic-bezier(.76,0,.24,1) var(--sf-out-delay) forwards}
html[data-intro="desktop"] .sf-intro{${vars(INTRO.desktop)}}
html[data-intro="mobile"] .sf-intro{${vars(INTRO.mobile)}}
.sf-intro__word{font:500 1.5rem/1 "Jost Variable","Jost",system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;padding-left:.3em}
.sf-intro__word>span{display:inline-block;opacity:.15;transform:translateY(60%);
animation:sf-intro-letter var(--sf-letter) cubic-bezier(.16,1,.3,1) calc(var(--i)*var(--sf-stagger)) forwards}
@media (min-width:768px){.sf-intro__word{font-size:2rem}}
@keyframes sf-intro-letter{to{opacity:1;transform:none}}
@keyframes sf-intro-out{to{transform:translateY(-100%);visibility:hidden}}
@media (prefers-reduced-motion:reduce){html[data-intro] .sf-intro{display:none}}
`;

/**
 * Milliseconds until the loader starts sliding away, or null if no loader is running (or it
 * already finished before React hydrated, in which case the hero must not re-animate).
 * Consumed once: later client-side visits to the homepage get no delay.
 */
export function takeIntroDelay(): number | null {
  const intro = typeof window !== "undefined" ? window.__sfIntro : undefined;
  if (!intro) return null;
  delete window.__sfIntro;
  const remaining = intro.start + intro.reveal - performance.now();
  return remaining > 0 ? remaining : null;
}

export const introRan = () =>
  typeof document !== "undefined" && document.documentElement.hasAttribute("data-intro");
