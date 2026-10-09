// The ONE place GSAP plugins are registered. Always import gsap, ScrollTrigger, SplitText
// and useGSAP from here, never from "gsap" directly, so registration happens exactly once.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Mobile address bars resize the viewport while scrolling; don't recalculate on that.
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power3.out" });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
