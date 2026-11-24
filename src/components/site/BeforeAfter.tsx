import { useRef, useState, type PointerEvent } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/**
 * Box with a small label, shown where real customer media will go. In the before/after
 * slider the two sides get different tints (beige before, blush after) and each label sits
 * in its own half, so the two empty sides still read as before and after.
 */
export function Placeholder({
  label,
  className = "",
  side,
}: {
  label: string;
  className?: string;
  side?: "before" | "after";
}) {
  const tone = side === "after" ? "bg-blush" : "bg-beige";
  const place =
    side === "after" ? "justify-end" : side === "before" ? "justify-start" : "justify-center";
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center ${place} ${tone} ${className}`}
    >
      <span
        className={`label-caps px-4 text-center text-[0.65rem] text-muted-foreground ${side ? "w-1/2" : ""}`}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Before and after drag slider. Used on /real-results and in the homepage results section.
 * - Touch: ONLY the round handle (a 48px grab strip down the divider) moves the slider; a
 *   swipe anywhere else on the photo scrolls the page as normal (`touch-action: pan-y`).
 * - Mouse: drag the handle, or click / drag anywhere on the photo.
 * - Keyboard: arrow keys.
 * Only ever with real customer photos shared with permission before launch (stock photos as
 * a real before/after would be an invented result).
 */
export function BeforeAfter({
  before,
  after,
  name,
}: {
  before: string | null;
  after: string | null;
  name: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  };
  // Handle: every pointer type. Captured, so the drag keeps going outside the handle.
  const onHandleDown = (e: PointerEvent<HTMLElement>) => {
    e.stopPropagation();
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  // Photo: a mouse may click or drag anywhere; touch and pen are left to scroll the page.
  const onPhotoDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const stop = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={`Before and after comparison for ${name}`}
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onPointerDown={onPhotoDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setPos((p) => Math.max(4, p - 5));
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setPos((p) => Math.min(96, p + 5));
        }
      }}
      className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden bg-beige outline-none focus-visible:ring-2 focus-visible:ring-primary [@media(pointer:fine)]:cursor-ew-resize"
    >
      {after ? (
        <img
          src={after}
          alt={`${name} after`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Placeholder label="After photo coming soon" side="after" className="absolute inset-0" />
      )}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%`, ["--ba-w" as string]: `${(100 / pos) * 100}%` }}
      >
        {before ? (
          <img
            src={before}
            alt={`${name} before`}
            // Full slider width (not the clipped width), so it lines up with the after photo.
            className="absolute inset-y-0 left-0 h-full w-[var(--ba-w)] max-w-none object-cover"
          />
        ) : (
          <Placeholder
            label="Before photo coming soon"
            side="before"
            className="absolute inset-y-0 left-0 w-[var(--ba-w)]"
          />
        )}
      </div>
      <span className="label-caps absolute left-3 top-3 bg-background/80 px-2 py-1 text-[0.6rem]">
        Before
      </span>
      <span className="label-caps absolute right-3 top-3 bg-background/80 px-2 py-1 text-[0.6rem]">
        After
      </span>
      <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-background" />
        {/* The grab strip: the only place a finger moves the slider. */}
        <span
          data-ba-handle
          aria-hidden="true"
          onPointerDown={onHandleDown}
          onPointerMove={onPointerMove}
          onPointerUp={stop}
          onPointerCancel={stop}
          className="absolute inset-y-0 -left-6 w-12 cursor-ew-resize touch-none"
        >
          <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-background text-green shadow-sm">
            <CaretLeft size={14} weight="bold" />
            <CaretRight size={14} weight="bold" className="-ml-2" />
          </span>
        </span>
      </div>
    </div>
  );
}
