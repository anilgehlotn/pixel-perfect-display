import { useEffect } from "react";
import { setSmoothScrollLocked } from "@/lib/animations/smooth-scroll";

// One shared page-scroll lock for the cart drawer, mobile menu and modals. Counted, so
// closing one overlay while another is still open keeps the page locked. overflow:hidden on
// both <html> and <body> stops page scrolling on iOS Safari 16+ as well as desktop, without
// the position:fixed trick that jumps the page and confuses ScrollTrigger.
let count = 0;

function apply() {
  const value = count > 0 ? "hidden" : "";
  document.documentElement.style.overflow = value;
  document.body.style.overflow = value;
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    count += 1;
    apply();
    setSmoothScrollLocked(true);
    return () => {
      count -= 1;
      apply();
      setSmoothScrollLocked(false);
    };
  }, [active]);
}
