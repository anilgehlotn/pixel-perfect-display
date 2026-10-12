import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, X } from "@phosphor-icons/react";
import type { MediaImage, MediaVideo } from "@/data/media";
import { canAutoplay, play, stop } from "@/lib/media/playback";
import { useScrollLock } from "@/lib/scroll-lock";

/** A photo from src/data/media.ts. width/height reserve the space (no layout shift). */
export function Img({
  media,
  className = "",
  priority = false,
  sizes,
}: {
  media: MediaImage;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <img
      src={media.src}
      srcSet={media.srcSet}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}

/**
 * Muted looping video over its poster. The poster (or `children`, e.g. a product photo) is
 * what the server renders and what screen readers get; the video is decorative.
 * - The file is only attached when the frame is within 300px of the screen (preload="none").
 * - trigger "view": plays while at least a quarter is on screen, pauses off-screen.
 * - trigger "hover": desktop with a mouse plays on hover or keyboard focus inside the
 *   closest [data-video-hover] element; touch screens fall back to "view".
 * - Never autoplays with reduced motion or data saver on; at most 2 play at once on phones.
 * - "view" videos get a pause button (WCAG 2.2.2: moving content over 5s must be pausable).
 *   A paused video stays paused until the visitor presses play again.
 */
export function LoopVideo({
  video,
  trigger = "view",
  className = "",
  priority = false,
  onPausedChange,
  children,
}: {
  video: MediaVideo;
  trigger?: "view" | "hover";
  className?: string;
  priority?: boolean;
  onPausedChange?: (paused: boolean) => void;
  children?: ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [canPlay, setCanPlay] = useState(false);
  const [paused, setPaused] = useState(false);
  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    onPausedChange?.(userPaused.current);
    if (userPaused.current) stop(el);
    else {
      if (!el.getAttribute("src")) el.src = video.src;
      play(el);
    }
  };

  useEffect(() => {
    const box = frame.current;
    const el = ref.current;
    if (!box || !el || !canAutoplay()) return;
    el.muted = true;
    if (trigger === "view") setCanPlay(true);
    const hoverable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const hoverRoot =
      trigger === "hover" && hoverable
        ? (box.closest<HTMLElement>("[data-video-hover]") ?? box)
        : null;
    let inView = false;
    let hovered = false;

    const update = () => {
      const want = hoverRoot ? hovered : inView && !userPaused.current;
      if (want) {
        if (!el.getAttribute("src")) el.src = video.src;
        play(el);
      } else stop(el);
    };
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !el.getAttribute("src")) el.src = video.src;
      },
      { rootMargin: "300px" },
    );
    const seen = new IntersectionObserver(
      ([entry]) => {
        inView = !!entry?.isIntersecting;
        if (!inView) hovered = false;
        update();
      },
      { threshold: 0.25 },
    );
    near.observe(box);
    seen.observe(box);

    const enter = () => {
      hovered = true;
      update();
    };
    const leave = () => {
      hovered = false;
      update();
    };
    hoverRoot?.addEventListener("pointerenter", enter);
    hoverRoot?.addEventListener("pointerleave", leave);
    hoverRoot?.addEventListener("focusin", enter);
    hoverRoot?.addEventListener("focusout", leave);

    // Fade the video in over the poster once frames are actually playing, out when paused.
    const shown = () => (el.dataset["on"] = "1");
    const hidden = () => delete el.dataset["on"];
    el.addEventListener("playing", shown);
    el.addEventListener("pause", hidden);

    return () => {
      near.disconnect();
      seen.disconnect();
      hoverRoot?.removeEventListener("pointerenter", enter);
      hoverRoot?.removeEventListener("pointerleave", leave);
      hoverRoot?.removeEventListener("focusin", enter);
      hoverRoot?.removeEventListener("focusout", leave);
      el.removeEventListener("playing", shown);
      el.removeEventListener("pause", hidden);
      stop(el);
    };
  }, [video.src, trigger]);

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <div data-media-inner className="absolute inset-0">
        {children ?? (
          <img
            src={video.poster}
            alt={video.alt}
            width={video.width}
            height={video.height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 data-[on=1]:opacity-100"
        />
      </div>
      {canPlay && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play background video" : "Pause background video"}
          className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-background/85 text-green backdrop-blur-sm transition-colors hover:bg-background"
        >
          {paused ? (
            <Play size={16} weight="fill" aria-hidden="true" />
          ) : (
            <Pause size={16} weight="fill" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}

/** Small "Play" pill. Place it inside a positioned frame. */
export function PlayPill({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-background/90 px-4 text-sm font-medium text-green backdrop-blur-sm transition-transform duration-300 hover:bg-background active:scale-[0.98] ${className}`}
    >
      <Play size={14} weight="fill" aria-hidden="true" />
      {label}
    </button>
  );
}

/**
 * Full-screen video player in a native <dialog>: focus stays inside, Escape and the backdrop
 * close it, focus returns to the button that opened it. The file only loads once opened.
 */
export function VideoDialog({
  video,
  title,
  open,
  onClose,
}: {
  video: MediaVideo;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useScrollLock(open);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[min(92vw,70rem)] overflow-visible bg-transparent p-0 backdrop:bg-ink/85"
    >
      <div className="flex justify-end pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="grid h-11 w-11 place-items-center rounded-full bg-background text-green"
        >
          <X size={20} weight="light" />
        </button>
      </div>
      {open ? (
        <video
          src={video.src}
          poster={video.poster}
          width={video.width}
          height={video.height}
          controls
          autoPlay
          muted
          loop
          playsInline
          aria-label={video.alt}
          className="max-h-[80dvh] w-full rounded-card bg-ink object-contain"
        />
      ) : null}
    </dialog>
  );
}
