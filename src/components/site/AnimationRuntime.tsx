import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { markHydrated } from "@/lib/animations/hydration";
import { initSmoothScroll } from "@/lib/animations/smooth-scroll";

// Page-wide animation housekeeping, mounted once in __root.tsx:
// - marks the end of the first hydration (see hydration.ts)
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
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    if (document.readyState !== "complete") window.addEventListener("load", refresh);
    return () => {
      stopSmoothScroll();
      window.removeEventListener("load", refresh);
    };
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
