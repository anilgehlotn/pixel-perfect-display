/**
 * The hero's lens of colour, framework-free so the static preview can run the same code.
 *
 * Markup (inside `root`): [data-lens] is a circle (overflow hidden) holding [data-lens-inner],
 * a copy of the full-colour world sized to the hero (--fw / --fh on root). The circle is moved
 * and scaled with transforms; the inner copy gets the inverse transform so the picture stays
 * still while the circle travels over it. Only transform and opacity change.
 *
 * - Mouse: the circle grows in on enter, follows the cursor (eased), shrinks on leave; a click
 *   spreads it until it covers the hero, then `onReveal` swaps in the full tea world.
 * - Touch: a tap spreads it from the tap point.
 * - reveal(): spreads from the centre (the hint button). reset(): back to black and white.
 * - Reduced motion: no circle; reveal() calls onReveal at once.
 */
export function attachLens(
  root: HTMLElement,
  onReveal: () => void,
  /** Keep the circle covering after the reveal (static preview with no full layer). */
  keepCover = false,
) {
  const lens = root.querySelector<HTMLElement>("[data-lens]");
  const inner = root.querySelector<HTMLElement>("[data-lens-inner]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!lens || !inner) return { reveal: onReveal, reset() {}, destroy() {} };

  let w = root.clientWidth;
  let h = root.clientHeight;
  const size = () => lens.offsetWidth || 320;
  const cover = () => (Math.hypot(w, h) * 2.1) / size();
  const setVars = () => {
    w = root.clientWidth;
    h = root.clientHeight;
    root.style.setProperty("--fw", `${w}px`);
    root.style.setProperty("--fh", `${h}px`);
  };
  setVars();
  const ro = new ResizeObserver(setVars);
  ro.observe(root);

  let x = w / 2;
  let y = h / 2;
  let tx = x;
  let ty = y;
  let s = 0;
  let ts = 0;
  let mode: "idle" | "hover" | "reveal" | "done" = "idle";
  let raf = 0;

  const paint = () => {
    const d = size();
    const k = Math.max(s, 0.0001);
    lens.style.visibility = s < 0.01 ? "hidden" : "visible";
    lens.style.transform = `translate3d(${x - d / 2}px, ${y - d / 2}px, 0) scale(${k})`;
    inner.style.transformOrigin = `${x}px ${y}px`;
    inner.style.transform = `translate3d(${-(x - d / 2)}px, ${-(y - d / 2)}px, 0) scale(${1 / k})`;
  };

  const loop = () => {
    cancelAnimationFrame(raf);
    const tick = () => {
      const follow = mode === "reveal" ? 0.25 : 0.18;
      const grow = mode === "reveal" ? 0.055 : 0.14;
      x += (tx - x) * follow;
      y += (ty - y) * follow;
      s += (ts - s) * grow;
      paint();
      if (mode === "reveal" && s > ts * 0.97) {
        mode = "done";
        onReveal();
        // Keep the circle covering until the full layer has faded in, then hide it.
        window.setTimeout(() => {
          if (mode !== "done" || keepCover) return;
          s = ts = 0;
          paint();
        }, 800);
        return;
      }
      const settled = Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3 && Math.abs(ts - s) < 0.002;
      if (settled) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const local = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const spreadFrom = (px: number, py: number) => {
    if (mode === "done") return;
    if (reduced) {
      mode = "done";
      onReveal();
      return;
    }
    if (mode === "idle") {
      x = tx = px;
      y = ty = py;
    } else {
      tx = px;
      ty = py;
    }
    mode = "reveal";
    ts = cover();
    loop();
  };

  const onMove = (e: PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !fine) return;
    if (mode === "reveal" || mode === "done") return;
    const [px, py] = local(e);
    if (mode === "idle") {
      x = tx = px;
      y = ty = py;
      mode = "hover";
      ts = 1;
    }
    tx = px;
    ty = py;
    loop();
  };
  const onLeave = () => {
    if (mode !== "hover") return;
    mode = "idle";
    ts = 0;
    loop();
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input")) return;
    const [px, py] = local(e);
    spreadFrom(px, py);
  };

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointerdown", onDown);

  return {
    reveal() {
      spreadFrom(w / 2, h * 0.55);
    },
    reset() {
      cancelAnimationFrame(raf);
      mode = "idle";
      s = ts = 0;
      paint();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
    },
  };
}
