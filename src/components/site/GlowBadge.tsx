import { useRef } from "react";
import { images, inside } from "@/data/content";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";

// Round lifestyle photo with a slowly rotating circle of text around it ("What's Inside").
// The ring rotates with CSS (20s per turn), paused off-screen; the whole badge scales in
// once via data-anim="pop".
const R = 86; // text path radius in the 200 x 200 viewBox
const CIRCUMFERENCE = 2 * Math.PI * R;

export function GlowBadge() {
  const ref = useRef<HTMLDivElement>(null);
  usePauseWhenHidden(ref);
  return (
    <div ref={ref} data-anim="pop" className="relative size-40 md:size-52" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="animate-rotate-slow absolute inset-0 size-full">
        <defs>
          <path
            id="glow-badge-ring"
            d={`M100,100 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`}
          />
        </defs>
        <text className="fill-foreground text-[13px] font-medium">
          <textPath href="#glow-badge-ring" textLength={CIRCUMFERENCE - 4} lengthAdjust="spacing">
            {inside.badge.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <img
        src={images.circle}
        alt=""
        width={1024}
        height={1024}
        loading="lazy"
        decoding="async"
        className="absolute inset-[17%] size-[66%] rounded-full object-cover"
      />
    </div>
  );
}
