import { useEffect, useRef, useState } from "react";
import { skinLayers } from "@/data/content";

/**
 * The idea behind SkinFusion, drawn: three skin layers. A drop of cream lands and stays on
 * the outer layer; food from a cup rises through a blood vessel into the deeper layers.
 * `play` starts the drop and the rising particles; with `playOnView` it starts the first time
 * the drawing scrolls into view. The rising loop runs on desktop only, reduced motion shows
 * the finished picture, and a `data-paused` ancestor pauses it.
 */
export function SkinLayers({
  play = false,
  playOnView = false,
  className = "",
}: {
  play?: boolean;
  playOnView?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!playOnView || seen || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [playOnView, seen]);
  const on = play || seen;
  const [outer, middle, deep] = skinLayers.layers;
  const wave = (y: number) =>
    `M0 ${y} C40 ${y - 6} 80 ${y + 6} 120 ${y} S200 ${y - 6} 240 ${y} S300 ${y + 4} 320 ${y}`;
  return (
    <svg
      ref={ref}
      viewBox="0 0 320 300"
      role="img"
      aria-label={`${skinLayers.label}: ${skinLayers.cream}. ${skinLayers.food}.`}
      className={className}
    >
      {/* Layers, top to bottom. */}
      <path d={`${wave(78)} V300 H0 Z`} fill="var(--pastel-pink)" />
      <path d={`${wave(128)} V300 H0 Z`} fill="var(--blush)" />
      <path d={`${wave(198)} V300 H0 Z`} fill="var(--pastel-peach)" />
      <g fill="var(--muted-foreground)" fontSize="10" letterSpacing="0.5">
        <text x="12" y="104">
          {outer}
        </text>
        <text x="12" y="166">
          {middle}
        </text>
        <text x="12" y="236">
          {deep}
        </text>
      </g>

      {/* Cream: a drop that lands and spreads on the outer layer, and stays there. */}
      <text x="156" y="72" fontSize="10.5" fill="var(--green)">
        {skinLayers.cream}
      </text>
      <path
        d="M122 34 C116 44 112 50 112 56 A10 10 0 0 0 132 56 C132 50 128 44 122 34 Z"
        fill="var(--surface)"
        stroke="var(--muted-foreground)"
        strokeWidth="1"
        className={on ? "anim-drop" : ""}
      />
      <ellipse
        cx="122"
        cy="80"
        rx="26"
        ry="4.5"
        fill="var(--surface)"
        stroke="var(--muted-foreground)"
        strokeWidth="1"
        className={on ? "anim-spread" : ""}
      />

      {/* Blood vessel through the deep and middle layers, fed from the cup. */}
      <path
        d="M0 214 C60 206 120 222 180 212 S260 206 320 214"
        fill="none"
        stroke="var(--primary)"
        strokeOpacity="0.35"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M236 262 C236 236 230 214 236 190 S240 150 236 120"
        fill="none"
        stroke="var(--primary)"
        strokeOpacity="0.35"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <g fill="var(--primary)">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx="236"
            cy="252"
            r="3.6"
            // Still picture: dots spaced up the vessel. The rising animation (desktop)
            // overrides this transform and starts every dot at the cup.
            transform={`translate(0 ${-i * 28})`}
            className={on ? "anim-rise" : ""}
            style={on ? { animationDelay: `${0.6 + i * 0.64}s` } : undefined}
          />
        ))}
      </g>
      <text x="226" y="150" textAnchor="end" fontSize="10.5" fill="var(--green)">
        {skinLayers.food}
      </text>

      {/* The cup. */}
      <g fill="none" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M220 268 h32 v14 a10 10 0 0 1 -10 10 h-12 a10 10 0 0 1 -10 -10 Z" />
        <path d="M252 272 h4 a5 5 0 0 1 0 10 h-4" />
      </g>
      <text x="212" y="286" textAnchor="end" fontSize="10.5" fill="var(--green)">
        {skinLayers.cup}
      </text>
    </svg>
  );
}
