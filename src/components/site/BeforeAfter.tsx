import { useRef, useState, type PointerEvent } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/** Beige box with a small label, shown where real customer media will go. */
export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={`grid place-items-center bg-beige ${className}`}>
      <span className="label-caps px-4 text-center text-[0.65rem] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/**
 * Before and after drag slider (pointer, touch and arrow keys). Used on /real-results and
 * in the homepage results section. Only ever with real customer photos shared with
 * permission: never stock photos (that would be an invented result).
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
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
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
      onPointerDown={onPointerDown}
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
      className="relative aspect-[4/5] cursor-ew-resize touch-none select-none overflow-hidden bg-beige outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {after ? (
        <img
          src={after}
          alt={`${name} after`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Placeholder label="Customer photo coming soon" className="absolute inset-0" />
      )}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {before ? (
          <img
            src={before}
            alt={`${name} before`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Placeholder
            label="Customer photo coming soon"
            className="absolute inset-0 h-full w-full"
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
        <span className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background">
          <CaretLeft size={14} weight="light" />
          <CaretRight size={14} weight="light" className="-ml-2" />
        </span>
      </div>
    </div>
  );
}
