import { useId } from "react";

/** Soft watercolour disc (SVG), the backdrop for icons and ingredient photos. Decorative. */
export function Wash({
  color,
  className = "",
  seed = 4,
}: {
  color: string;
  className?: string;
  seed?: number;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <defs>
        <filter id={id} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="9" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="42" fill={color} filter={`url(#${id})`} />
      <circle cx="56" cy="56" r="26" fill={color} opacity="0.6" filter={`url(#${id})`} />
    </svg>
  );
}
