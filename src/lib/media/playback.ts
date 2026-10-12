import { DESKTOP_QUERY, REDUCED_QUERY } from "@/lib/animations/media";

// Shared rules for the muted looping videos on the homepage:
// - never autoplay with reduced motion or the browser's data saver on
// - phones and tablets: at most 2 videos playing at once (the oldest one pauses)
// - everything pauses while the tab is hidden
const MOBILE_LIMIT = 2;
const playing: HTMLVideoElement[] = [];
let listening = false;

type NetworkInformation = { saveData?: boolean };

export function canAutoplay() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia(REDUCED_QUERY).matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return !connection?.saveData;
}

function onVisibility() {
  if (!document.hidden) return;
  for (const video of [...playing]) stop(video);
}

/** Starts a video, pausing the oldest one first if a phone already has 2 playing. */
export function play(video: HTMLVideoElement) {
  if (!listening) {
    listening = true;
    document.addEventListener("visibilitychange", onVisibility);
  }
  if (document.hidden || playing.includes(video)) return;
  const limit = window.matchMedia(DESKTOP_QUERY).matches ? Infinity : MOBILE_LIMIT;
  while (playing.length >= limit) {
    const oldest = playing[0];
    if (!oldest) break;
    stop(oldest);
  }
  playing.push(video);
  // play() rejects if the browser blocks it or the source is gone; the poster stays.
  void video.play().catch(() => stop(video));
}

export function stop(video: HTMLVideoElement) {
  const i = playing.indexOf(video);
  if (i !== -1) playing.splice(i, 1);
  if (!video.paused) video.pause();
}
