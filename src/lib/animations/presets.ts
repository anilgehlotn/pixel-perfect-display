import { gsap, SplitText } from "./gsap";
import { alreadySeen } from "./hydration";
import type { MotionMode } from "./media";
import { CLEAR_PROPS, failsafe } from "./safety";

// Every preset: content is visible in the server HTML; the hidden start state is applied
// here, in the browser, right before the element scrolls in. Each returns a cleanup function
// for anything gsap.context() can't revert on its own (observers, timers).
export type Cleanup = () => void;
const noop: Cleanup = () => {};

const MOBILE_MAX_ITEMS = 6;

/** Fade + rise once when `trigger` scrolls into view. The shared building block. */
export function riseOnce(
  targets: Element[],
  trigger: Element,
  mode: MotionMode,
  opts: { y?: number; stagger?: number; duration?: number; start?: string } = {},
): Cleanup {
  if (!targets.length) return noop;
  const desktop = mode === "desktop";
  const tween = gsap.from(targets, {
    opacity: 0,
    y: opts.y ?? (desktop ? 48 : 20),
    duration: opts.duration ?? (desktop ? 0.9 : 0.6),
    stagger: opts.stagger ?? (desktop ? 0.1 : 0.05),
    transition: "none", // CSS transitions on the same props would fight GSAP
    scrollTrigger: { trigger, start: opts.start ?? "top 88%", once: true },
    onStart: () => gsap.set(targets, { willChange: "transform, opacity" }),
    onComplete: () => gsap.set(targets, { clearProps: CLEAR_PROPS }),
  });
  return failsafe(trigger, tween);
}

/** data-anim="fade": a single block fades up. */
export function fadeUp(el: HTMLElement, mode: MotionMode): Cleanup {
  if (alreadySeen(el)) return noop;
  return riseOnce([el], el, mode, { y: mode === "desktop" ? 24 : 16 });
}

/** data-anim="cards": direct children rise in with a stagger. Mobile animates at most 6. */
export function cards(el: HTMLElement, mode: MotionMode): Cleanup {
  if (alreadySeen(el)) return noop;
  let items = Array.from(el.children);
  if (mode === "mobile") items = items.slice(0, MOBILE_MAX_ITEMS);
  return riseOnce(items, el, mode);
}

/**
 * data-anim="heading". Desktop: words fill from 15% to full opacity as the heading scrolls
 * up the screen (scrubbed). Mobile: the whole heading fades up once.
 */
export function heading(el: HTMLElement, mode: MotionMode): Cleanup {
  if (alreadySeen(el)) return noop;
  if (mode === "mobile") return riseOnce([el], el, mode, { y: 20 });
  // autoSplit re-splits after fonts load or the width changes; onSplit returns the tween so
  // the old one is reverted with it. aria: "auto" keeps the heading text readable for
  // screen readers.
  SplitText.create(el, {
    type: "words",
    aria: "auto",
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(
        self.words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 85%", end: "top 45%", scrub: true },
        },
      ),
  });
  return noop;
}

/** data-anim="tilt": three cards. Sides slide in and settle at -6deg / 6deg, center rises. */
export function tilt(el: HTMLElement, mode: MotionMode): Cleanup {
  const items = Array.from(el.children) as HTMLElement[];
  if (mode === "mobile" || items.length !== 3) return cards(el, mode);
  const [left, center, right] = items as [HTMLElement, HTMLElement, HTMLElement];
  const rest = { rotation: (i: number) => [-6, 0, 6][i] ?? 0, x: 0, y: 0, opacity: 1 };

  // Slight parallax on the photos inside the cards while scrolling (desktop only).
  const imgs = items.map((i) => i.querySelector("img")).filter(Boolean) as HTMLElement[];
  // The photos keep their CSS hover zoom (the separate `scale` property) but must not
  // transition `transform`, or the scrubbed parallax would lag behind the scroll.
  gsap.set(imgs, { scale: 1.12, transitionProperty: "scale" });
  gsap.fromTo(
    imgs,
    { yPercent: -4 },
    {
      yPercent: 4,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    },
  );

  if (alreadySeen(el)) {
    gsap.set(items, rest);
    return noop;
  }
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: "top 80%", once: true },
    defaults: { duration: 1.1, ease: "power3.out" },
    onComplete: () => gsap.set(items, { clearProps: "opacity,willChange" }),
  });
  tl.set(items, { willChange: "transform, opacity" })
    .from(center, { y: 120, opacity: 0 }, 0)
    .fromTo(left, { x: -140, rotation: 0, opacity: 0 }, { x: 0, rotation: -6, opacity: 1 }, 0.1)
    .fromTo(right, { x: 140, rotation: 0, opacity: 0 }, { x: 0, rotation: 6, opacity: 1 }, 0.1);
  return failsafe(el, tl);
}

/**
 * data-count on an element whose text contains a number ("4.8", "1,000", "95"): counts up
 * from 0 once when visible. The final value is in the server HTML; while counting, the
 * element is hidden from screen readers so they never announce an in-between number.
 */
export function countUp(el: HTMLElement, mode: MotionMode): Cleanup {
  const node = el.firstChild;
  const text = node?.nodeValue ?? "";
  const match = /\d[\d,]*(?:\.\d+)?/.exec(text);
  if (!node || !match || alreadySeen(el)) return noop;
  const raw = match[0];
  const final = Number(raw.replace(/,/g, ""));
  const decimals = raw.split(".")[1]?.length ?? 0;
  const grouped = raw.includes(",");
  const format = (v: number) => {
    const n = grouped
      ? v.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : v.toFixed(decimals);
    return text.slice(0, match.index) + n + text.slice(match.index + raw.length);
  };
  const state = { v: 0 };
  node.nodeValue = format(0);
  const tween = gsap.to(state, {
    v: final,
    duration: mode === "desktop" ? 1.4 : 1,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 92%", once: true },
    onStart: () => el.setAttribute("aria-hidden", "true"),
    onUpdate: () => {
      node.nodeValue = format(state.v);
    },
    onComplete: () => {
      node.nodeValue = text;
      el.removeAttribute("aria-hidden");
    },
  });
  const stop = failsafe(el, tween);
  return () => {
    stop();
    node.nodeValue = text;
    el.removeAttribute("aria-hidden");
  };
}

/** data-anim="draw": SVG paths draw themselves once (stroke-dashoffset). */
export function draw(el: HTMLElement, mode: MotionMode): Cleanup {
  if (alreadySeen(el)) return noop;
  const paths = Array.from(el.querySelectorAll<SVGGeometryElement>("path"));
  if (!paths.length) return noop;
  for (const p of paths) {
    const length = p.getTotalLength();
    gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
  }
  const tween = gsap.to(paths, {
    strokeDashoffset: 0,
    duration: mode === "desktop" ? 1.4 : 1,
    ease: "power2.inOut",
    scrollTrigger: { trigger: el, start: "top 90%", once: true },
    onComplete: () => gsap.set(paths, { clearProps: "strokeDasharray,strokeDashoffset" }),
  });
  return failsafe(el, tween);
}

/** data-anim="pop": scales in from 0.85 once (round image in What's Inside). */
export function pop(el: HTMLElement, mode: MotionMode): Cleanup {
  if (alreadySeen(el)) return noop;
  const tween = gsap.from(el, {
    scale: 0.85,
    opacity: 0,
    duration: mode === "desktop" ? 1.2 : 0.8,
    scrollTrigger: { trigger: el, start: "top 88%", once: true },
    onStart: () => gsap.set(el, { willChange: "transform, opacity" }),
    onComplete: () => gsap.set(el, { clearProps: CLEAR_PROPS }),
  });
  return failsafe(el, tween);
}

/**
 * data-anim="lines": a big headline whose lines rise from a mask, once (slow and soft).
 * Mobile: the whole headline fades up once (no splitting).
 */
export function lines(el: HTMLElement, mode: MotionMode): Cleanup {
  if (alreadySeen(el)) return noop;
  if (mode === "mobile") return riseOnce([el], el, mode, { y: 20, duration: 0.8 });
  let tween: gsap.core.Tween | null = null;
  const split = SplitText.create(el, {
    type: "lines",
    mask: "lines",
    aria: "auto",
    onSplit: (self) => {
      tween = gsap.from(self.lines, {
        yPercent: 105,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onComplete: () => split.revert(),
      });
      return tween;
    },
  });
  if (!tween) return noop;
  const stop = failsafe(el, tween);
  return () => {
    stop();
    split.revert();
  };
}

/**
 * data-anim="media": a rounded image/video frame. The frame fades in while the picture inside
 * settles from scale 1.06 to 1, once. The frame must clip (overflow-hidden).
 */
export function media(el: HTMLElement, mode: MotionMode): Cleanup {
  if (alreadySeen(el)) return noop;
  const inner = el.querySelector<HTMLElement>("[data-media-inner]") ?? el.firstElementChild;
  const desktop = mode === "desktop";
  const all = inner ? [el, inner] : [el];
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: "top 90%", once: true },
    defaults: { duration: desktop ? 1.4 : 0.9, ease: "power2.out" },
    onStart: () => gsap.set(all, { willChange: "transform, opacity", transition: "none" }),
    onComplete: () => gsap.set(all, { clearProps: CLEAR_PROPS }),
  });
  tl.from(el, { opacity: 0, duration: desktop ? 1 : 0.7 }, 0);
  if (inner) tl.from(inner, { scale: 1.06 }, 0);
  return failsafe(el, tl);
}

/**
 * data-depth="0.5" (any number, negative moves the other way): slow scroll-linked parallax,
 * desktop only. The element moves up by depth x 80px across its pass through the screen.
 * It starts at its normal place (clamped start), so nothing jumps when the page loads with
 * the element already on screen. Use it on a wrapper, never on an element that already has
 * a CSS transform animation.
 */
export function depth(el: HTMLElement, mode: MotionMode): Cleanup {
  if (mode === "mobile") return noop;
  const amount = Number(el.dataset["depth"] ?? 0) * 80;
  if (!amount) return noop;
  gsap.fromTo(
    el,
    { y: 0 },
    {
      y: -amount,
      ease: "none",
      scrollTrigger: { trigger: el, start: "clamp(top bottom)", end: "bottom top", scrub: 0.6 },
    },
  );
  return noop;
}

export const presets = {
  fade: fadeUp,
  cards,
  heading,
  lines,
  media,
  tilt,
  draw,
  pop,
} satisfies Record<string, (el: HTMLElement, mode: MotionMode) => Cleanup>;

export type PresetName = keyof typeof presets;

/** Footer: content slides up slightly into place, then the columns fade in one by one. */
export function footerReveal(footer: HTMLElement, mode: MotionMode): Cleanup {
  const inner = footer.querySelector<HTMLElement>("[data-footer-columns]");
  if (!inner || alreadySeen(footer)) return noop;
  const columns = Array.from(inner.children);
  const all = [inner, ...columns];
  const desktop = mode === "desktop";
  const tl = gsap.timeline({
    scrollTrigger: { trigger: footer, start: "top 92%", once: true },
    onStart: () => gsap.set(all, { willChange: "transform, opacity" }),
    onComplete: () => gsap.set(all, { clearProps: CLEAR_PROPS }),
  });
  tl.from(inner, { y: desktop ? 48 : 24, duration: desktop ? 0.9 : 0.6 }, 0).from(
    columns,
    { opacity: 0, y: desktop ? 16 : 10, duration: 0.6, stagger: desktop ? 0.1 : 0.05 },
    0.15,
  );
  return failsafe(footer, tl);
}
