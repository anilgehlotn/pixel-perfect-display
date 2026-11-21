import { skinLayers } from "@/data/content";

/**
 * The idea behind SkinFusion, drawn: three skin layers. A drop of cream lands and stays on
 * the outer layer; food from a cup rises through a blood vessel into the deeper layers.
 *
 * The markup is the finished picture (server HTML, reduced motion, no JavaScript). The
 * "Why edible" story animation (lib/animations/why-edible.ts) finds the parts by their
 * `data-sl` names and plays them in three steps.
 */
export function SkinLayers({ className = "" }: { className?: string }) {
  const [outer, middle, deep] = skinLayers.layers;
  const wave = (y: number) =>
    `M0 ${y} C40 ${y - 6} 80 ${y + 6} 120 ${y} S200 ${y - 6} 240 ${y} S300 ${y + 4} 320 ${y}`;
  return (
    <svg
      viewBox="0 0 320 300"
      role="img"
      aria-label={`${skinLayers.label}: ${skinLayers.cream}. ${skinLayers.food}.`}
      className={className}
    >
      {/* Layers, top to bottom. */}
      <path data-sl="layer" d={`${wave(78)} V300 H0 Z`} fill="var(--pastel-pink)" />
      <path data-sl="layer" d={`${wave(128)} V300 H0 Z`} fill="var(--blush)" />
      <path data-sl="layer" d={`${wave(198)} V300 H0 Z`} fill="var(--pastel-peach)" />
      <g fill="var(--muted-foreground)" fontSize="12.5" letterSpacing="0.3">
        <text data-sl="layer-label" x="12" y="104">
          {outer}
        </text>
        <text data-sl="layer-label" x="12" y="166">
          {middle}
        </text>
        <text data-sl="layer-label" x="12" y="236">
          {deep}
        </text>
      </g>

      {/* Highlights: the outer layer (step 1) and the deeper layers (step 2). */}
      <path
        data-sl="edge-outer"
        d={wave(78)}
        fill="none"
        stroke="var(--green)"
        strokeWidth="1.6"
        opacity="0"
      />
      <path
        data-sl="edge-deep"
        d={wave(128)}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.6"
        opacity="0"
      />

      {/* Cream: a drop that lands and spreads on the outer layer, and stays there. */}
      <text data-sl="cream-label" x="146" y="70" fontSize="13" fill="var(--green)">
        {skinLayers.cream}
      </text>
      <path
        data-sl="drop"
        d="M122 34 C116 44 112 50 112 56 A10 10 0 0 0 132 56 C132 50 128 44 122 34 Z"
        fill="var(--surface)"
        stroke="var(--muted-foreground)"
        strokeWidth="1"
      />
      <ellipse
        data-sl="spread"
        cx="122"
        cy="80"
        rx="26"
        ry="4.5"
        fill="var(--surface)"
        stroke="var(--muted-foreground)"
        strokeWidth="1"
      />

      {/* Blood vessel through the deep and middle layers, fed from the cup. */}
      <g data-sl="vessel">
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
      </g>
      <g fill="var(--primary)">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            data-sl="dot"
            data-i={i}
            cx="236"
            cy="252"
            r="3.6"
            transform={`translate(0 ${-i * 28})`}
          />
        ))}
      </g>
      <text data-sl="food-label" x="226" y="150" textAnchor="end" fontSize="13" fill="var(--green)">
        {skinLayers.food}
      </text>

      {/* The cup. */}
      <g data-sl="cup" fill="none" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M220 268 h32 v14 a10 10 0 0 1 -10 10 h-12 a10 10 0 0 1 -10 -10 Z" />
        <path d="M252 272 h4 a5 5 0 0 1 0 10 h-4" />
      </g>
      <text data-sl="cup-label" x="212" y="286" textAnchor="end" fontSize="13" fill="var(--green)">
        {skinLayers.cup}
      </text>
    </svg>
  );
}
