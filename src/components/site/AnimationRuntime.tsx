import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { markHydrated } from "@/lib/animations/hydration";

// Page-wide animation housekeeping, mounted once in __root.tsx:
// - marks the end of the first hydration (see hydration.ts)
// - recalculates ScrollTrigger positions after fonts, images and route changes
export function AnimationRuntime() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    markHydrated();
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    if (document.readyState !== "complete") window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
