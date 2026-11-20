import { useId } from "react";
import type { Packaging } from "@/data/content";

/**
 * Illustrated SkinFusion stand-up pouch (SVG). A stand-in for packaging photography: matte
 * pouch with heat-seal band, zip line and tear notches, a watercolour wash behind a single
 * brush character, and the product name. Purely decorative unless `title` is given.
 */
export function Pouch({
  look,
  className = "",
  title,
  shadow = true,
}: {
  look: Packaging;
  className?: string;
  title?: string;
  shadow?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const body =
    "M48 34 L252 34 C256 140 258 250 262 352 C262 372 232 382 150 382 C68 382 38 372 38 352 C42 250 44 140 48 34 Z";
  return (
    <svg
      viewBox="0 0 300 420"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={look.shade} />
          <stop offset="0.16" stopColor={look.color} />
          <stop offset="0.55" stopColor={look.color} />
          <stop offset="0.86" stopColor={look.color} />
          <stop offset="1" stopColor={look.shade} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
        <filter id={`${id}-wash`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="16" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id={`${id}-paper`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.07 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-shadow`} x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={body} />
        </clipPath>
      </defs>

      {shadow && (
        <ellipse
          cx="150"
          cy="386"
          rx="118"
          ry="12"
          fill="#3a1a12"
          opacity="0.28"
          filter={`url(#${id}-shadow)`}
        />
      )}

      <path d={body} fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {/* matte paper grain */}
        <rect width="300" height="420" fill="#fff" filter={`url(#${id}-paper)`} />
        {/* heat-seal band with fine ribs */}
        <rect x="0" y="34" width="300" height="30" fill={look.shade} opacity="0.35" />
        {Array.from({ length: 52 }, (_, i) => (
          <line
            key={i}
            x1={46 + i * 4}
            x2={46 + i * 4}
            y1="36"
            y2="62"
            stroke={look.ink}
            strokeOpacity="0.07"
            strokeWidth="1.2"
          />
        ))}
        {/* zip */}
        <line
          x1="40"
          x2="260"
          y1="78"
          y2="78"
          stroke={look.ink}
          strokeOpacity="0.16"
          strokeWidth="1.4"
        />
        <line x1="40" x2="260" y1="81" y2="81" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
        {/* soft vertical sheen and base shading */}
        <rect x="70" y="30" width="46" height="360" fill={`url(#${id}-sheen)`} />
        <rect x="0" y="250" width="300" height="140" fill={`url(#${id}-base)`} />
        {/* bottom gusset seam */}
        <path
          d="M40 350 C80 362 220 362 260 350"
          fill="none"
          stroke={look.ink}
          strokeOpacity="0.12"
          strokeWidth="1.2"
        />
      </g>
      {/* tear notches */}
      <path d="M48 70 l7 -4 l0 8 Z" fill="#fff" opacity="0.9" />
      <path d="M252 70 l-7 -4 l0 8 Z" fill="#fff" opacity="0.9" />

      {/* front print */}
      <text
        x="150"
        y="118"
        textAnchor="middle"
        fontFamily="'Jost Variable', Jost, system-ui, sans-serif"
        fontSize="13"
        fontWeight="500"
        letterSpacing="5.5"
        fill={look.ink}
      >
        SKINFUSION
      </text>
      <circle
        cx="150"
        cy="198"
        r="54"
        fill={look.wash}
        opacity="0.82"
        filter={`url(#${id}-wash)`}
      />
      <circle
        cx="168"
        cy="214"
        r="30"
        fill={look.wash}
        opacity="0.35"
        filter={`url(#${id}-wash)`}
      />
      <text
        x="150"
        y="222"
        textAnchor="middle"
        fontFamily="'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
        fontSize="64"
        fill="#fff"
        opacity="0.96"
      >
        {look.glyph}
      </text>
      {look.name.map((line, i) => (
        <text
          key={line}
          x="150"
          y={292 + i * 24}
          textAnchor="middle"
          fontFamily="'Jost Variable', Jost, system-ui, sans-serif"
          fontSize="19"
          fontWeight="500"
          letterSpacing="3.2"
          fill={look.ink}
        >
          {line.toUpperCase()}
        </text>
      ))}
      <text
        x="150"
        y={look.weight ? 336 : 340}
        textAnchor="middle"
        fontFamily="'Jost Variable', Jost, system-ui, sans-serif"
        fontSize="7.6"
        letterSpacing="0.5"
        fill={look.ink}
        opacity="0.75"
      >
        {look.line}
      </text>
      {look.weight && (
        <text
          x="150"
          y="352"
          textAnchor="middle"
          fontFamily="'Jost Variable', Jost, system-ui, sans-serif"
          fontSize="8"
          letterSpacing="1.6"
          fill={look.ink}
          opacity="0.6"
        >
          {look.weight.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
