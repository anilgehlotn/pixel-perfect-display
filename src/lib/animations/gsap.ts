// The ONE place GSAP plugins are registered. Always import gsap, ScrollTrigger, SplitText
// and useGSAP from here, never from "gsap" directly, so registration happens exactly once.
import gsapCore from "gsap";
import { ScrollTrigger as ScrollTriggerPlugin } from "gsap/ScrollTrigger";
import { SplitText as SplitTextPlugin } from "gsap/SplitText";
import { useGSAP as useGSAPHook } from "@gsap/react";

let registered = false;

// package.json sets "sideEffects": false, so a bare top-level registerPlugin() call could be
// dropped by the bundler when a file only re-exports from here. Every export below goes
// through register(), which ties registration to actually using GSAP.
function register<T>(value: T): T {
  if (!registered && typeof window !== "undefined") {
    registered = true;
    gsapCore.registerPlugin(ScrollTriggerPlugin, SplitTextPlugin, useGSAPHook);
    // Mobile address bars resize the viewport while scrolling; don't recalculate on that.
    ScrollTriggerPlugin.config({ ignoreMobileResize: true });
    gsapCore.defaults({ ease: "power3.out" });
  }
  return value;
}

export const gsap = register(gsapCore);
export const ScrollTrigger = register(ScrollTriggerPlugin);
export const SplitText = register(SplitTextPlugin);
export const useGSAP = register(useGSAPHook);
