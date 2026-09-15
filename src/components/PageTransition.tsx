"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { isFirstPaint, isPageContentHeld } from "@/lib/preloader";

/**
 * Wraps page content and eases it in.
 *
 * Mounting happens in one of three states:
 *  - behind the preloader: <html> carries the pending flag (set before the
 *    first paint by the guard script), so the content is already hidden and
 *    only the transition has to be armed. Lifting the flag plays it.
 *  - the document's first paint without a curtain: the browser has already
 *    painted, so leave it be rather than blinking it out and back in.
 *  - a client-side navigation: hide before the browser paints, then hand over
 *    to the transition on the next frame.
 *
 * Either way the markup is authored visible, so the page still renders
 * completely if JavaScript never runs.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Read before anything else: it clears itself for later mounts.
    const firstPaint = isFirstPaint();

    element.classList.add("page-enter-active");

    if (isPageContentHeld() || firstPaint) {
      return;
    }

    // Hide, force the browser to commit that state, then hand over to the
    // transition. Reading offsetWidth is what makes this reliable: waiting for
    // a frame instead would leave the content blank in a throttled tab.
    element.classList.add("page-enter");
    void element.offsetWidth;
    element.classList.remove("page-enter");

    // Paranoia: content must never stay invisible, whatever happens above.
    const safety = setTimeout(() => element.classList.remove("page-enter"), 700);
    return () => clearTimeout(safety);
  }, []);

  return (
    <div ref={ref} className="page-enter-gate">
      {children}
    </div>
  );
}
