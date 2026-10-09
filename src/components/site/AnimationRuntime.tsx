import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { markHydrated, settleInitialLoad } from "@/lib/animations/hydration";
import { initSmoothScroll } from "@/lib/animations/smooth-scroll";

// Page-wide animation housekeeping, mounted once in __root.tsx:
// - marks the end of the first hydration, then starts the queued first-load scroll
//   animations once the page has loaded and the scroll position is restored (hydration.ts)
// - starts Lenis smooth scroll on desktop with a mouse (native scroll everywhere else)
// - recalculates ScrollTrigger positions after fonts, images and route changes
export function AnimationRuntime() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    markHydrated();
    let stopSmoothScroll = () => {};
    try {
      stopSmoothScroll = initSmoothScroll();
    } catch (error) {
      console.error("[animations] smooth scroll failed", error);
    }
    // Settle after `load` (scroll restoration on refresh/back has happened by then), two
    // frames later; at most 3s so slow images can't hold animations back.
    let frame = 0;
    const settle = () => {
      window.removeEventListener("load", settle);
      clearTimeout(timeout);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          settleInitialLoad();
          ScrollTrigger.refresh();
        });
      });
    };
    const timeout = setTimeout(settle, 3000);
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle);
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      stopSmoothScroll();
      window.removeEventListener("load", settle);
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, []);

  // After a route change, recalculate trigger positions (the footer's trigger outlives the
  // page). Each trigger is refreshed on its own: a global ScrollTrigger.refresh() restores
  // the scroll position it recorded, which would undo the router's scroll restoration on
  // back/forward.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.getAll().forEach((st) => st.refresh()));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
