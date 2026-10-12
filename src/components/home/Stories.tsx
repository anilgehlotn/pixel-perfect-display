import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { home, type StoryQuote } from "@/data/content";
import { media, type MediaImage, type MediaVideo } from "@/data/media";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { DESKTOP_QUERY } from "@/lib/animations/media";
import { safely } from "@/lib/animations/safety";
import { Img, LoopVideo, PlayPill, VideoDialog } from "./media";

/*
 * 7. STORIES: a full-bleed strip of mixed shapes (circles at both edges, tall portraits, a
 * stadium above a quote, video cards, a green quote card).
 * Desktop with a mouse: drag to scroll with momentum, a slow drift while the page scrolls,
 * and slight parallax between cards (data-depth). Phones: native swipe with snap points.
 * The strip is a normal horizontal scroller, so keyboard (arrow keys) and trackpads work.
 */
export function Stories() {
  const copy = home.stories;
  const s = media.stories;
  const [q1, q2, q3] = copy.quotes;
  const [cap1, cap2, cap3] = copy.videoCaptions;
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<MediaVideo | null>(null);
  const [open, setOpen] = useState(false);
  const play = (video: MediaVideo) => {
    setActive(video);
    setOpen(true);
  };

  useDragScroll(viewport);

  // Slow drift of the whole strip while the page scrolls past (desktop only).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
        safely("stories drift", track.current, () => {
          gsap.fromTo(
            track.current,
            { x: 0 },
            {
              x: -140,
              ease: "none",
              scrollTrigger: {
                trigger: viewport.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: viewport },
  );

  return (
    <section id="stories" aria-labelledby="stories-title" className="section-y scroll-mt-20">
      <div className="container-x">
        <h2 id="stories-title" data-anim="lines" className="title max-w-3xl">
          {copy.title}
        </h2>
      </div>
      <div
        ref={viewport}
        role="region"
        aria-label="Customer stories"
        tabIndex={0}
        className="no-scrollbar mt-10 snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-10 md:mt-14 lg:cursor-grab lg:snap-none lg:select-none lg:py-16 lg:active:cursor-grabbing"
      >
        <ul
          ref={track}
          data-anim="cards"
          className="flex w-max items-center gap-4 pl-0 pr-6 md:gap-6 lg:pr-48"
        >
          {/* Half-visible circle at the left edge */}
          <Card className="-ml-24 w-48 md:-ml-36 md:w-72" depth={0.2}>
            <Photo media={s.edgeStart} className="aspect-square rounded-full" />
          </Card>
          <Card className="w-60 md:w-72" depth={-0.15}>
            <Photo media={s.portraitA} className="aspect-[3/4.4] rounded-card" />
          </Card>
          {q1 && (
            <Card className="w-64 md:w-80" depth={0.25}>
              <Photo media={s.stadium} className="aspect-[2/1] rounded-stadium" />
              <Quote quote={q1} className="mt-4 bg-blush" />
            </Card>
          )}
          <Card className="w-60 md:w-72" depth={-0.2}>
            <VideoCard video={s.videoA} caption={cap1} onPlay={play} label={copy.play} />
          </Card>
          {q2 && (
            <Card className="w-72 md:w-96" depth={0.1}>
              <Quote quote={q2} large className="bg-green text-cream" />
            </Card>
          )}
          <Card className="w-56 md:w-64" depth={0.3}>
            <Photo media={s.portraitB} className="aspect-[3/4.6] rounded-card" />
          </Card>
          <Card className="w-56 md:w-72" depth={-0.25}>
            <VideoCard video={s.videoB} caption={cap2} onPlay={play} label={copy.play} />
          </Card>
          {q3 && (
            <Card className="w-64 md:w-80" depth={0.2}>
              <Quote quote={q3} className="mb-4 bg-beige" />
              <Photo media={s.portraitC} className="aspect-[4/3] rounded-card" />
            </Card>
          )}
          <Card className="w-80 md:w-[28rem]" depth={-0.1}>
            <VideoCard video={s.videoC} caption={cap3} onPlay={play} label={copy.play} landscape />
          </Card>
          {/* Half-visible circle at the right edge (the strip ends past the screen) */}
          <Card className="w-48 md:w-72" depth={0.2} snap="end">
            <Photo media={s.edgeEnd} className="aspect-square rounded-full" />
          </Card>
        </ul>
      </div>
      {active && (
        <VideoDialog video={active} title={active.alt} open={open} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}

function Card({
  className,
  depth,
  snap = "start",
  children,
}: {
  className: string;
  depth: number;
  snap?: "start" | "end";
  children: ReactNode;
}) {
  return (
    <li className={`shrink-0 ${snap === "end" ? "snap-end" : "snap-start"} ${className}`}>
      <div data-depth={depth}>{children}</div>
    </li>
  );
}

function Photo({ media: m, className }: { media: MediaImage; className: string }) {
  return (
    <div className={`overflow-hidden bg-beige ${className}`}>
      <Img media={m} sizes="(min-width: 768px) 20rem, 16rem" className="h-full w-full" />
    </div>
  );
}

function Quote({
  quote,
  large = false,
  className,
}: {
  quote: StoryQuote;
  large?: boolean;
  className: string;
}) {
  return (
    <figure className={`rounded-card p-6 md:p-8 ${className}`}>
      <blockquote className={large ? "text-2xl leading-snug md:text-3xl" : "text-lg leading-snug"}>
        <p>“{quote.text}”</p>
      </blockquote>
      <figcaption className={`mt-5 text-sm ${large ? "text-cream/85" : "text-muted-foreground"}`}>
        {quote.name}, {quote.city}
      </figcaption>
    </figure>
  );
}

function VideoCard({
  video,
  caption,
  label,
  onPlay,
  landscape = false,
}: {
  video: MediaVideo;
  caption: string | undefined;
  label: string;
  onPlay: (video: MediaVideo) => void;
  landscape?: boolean;
}) {
  return (
    <div className="relative">
      <LoopVideo
        video={video}
        className={`w-full rounded-card bg-beige ${landscape ? "aspect-[4/3]" : "aspect-[3/4.6]"}`}
      />
      <PlayPill label={label} onClick={() => onPlay(video)} className="absolute right-3 top-3" />
      {caption && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-card bg-linear-to-t from-ink/70 to-transparent p-5 pr-16 pt-12 text-on-image">
          {caption}
        </p>
      )}
    </div>
  );
}

/**
 * Drag to scroll with momentum, for a mouse on desktop only (touch keeps native swiping).
 * A drag of more than 6px swallows the click that follows, so cards aren't opened by it.
 */
function useDragScroll(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia(DESKTOP_QUERY).matches) return;
    let startX = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let moved = 0;
    let dragging = false;
    let frame = 0;

    const glide = () => {
      velocity *= 0.94;
      el.scrollLeft -= velocity;
      if (Math.abs(velocity) > 0.3) frame = requestAnimationFrame(glide);
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(frame);
      dragging = true;
      moved = 0;
      startX = lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      moved = Math.max(moved, Math.abs(e.clientX - startX));
      if (moved > 6 && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      el.scrollLeft -= dx;
      velocity = (dx / Math.max(1, now - lastT)) * 16;
      lastX = e.clientX;
      lastT = now;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      if (moved > 6) frame = requestAnimationFrame(glide);
    };
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const stopGlide = () => cancelAnimationFrame(frame);
    const noDrag = (e: DragEvent) => e.preventDefault();

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("wheel", stopGlide, { passive: true });
    el.addEventListener("dragstart", noDrag);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("wheel", stopGlide);
      el.removeEventListener("dragstart", noDrag);
    };
  }, [ref]);
}
