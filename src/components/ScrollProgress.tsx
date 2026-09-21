"use client";

import { useEffect, useRef } from "react";

/** How quickly the bar chases the true scroll position (0-1 per frame). */
const EASE = 0.14;
const SETTLED = 0.0006;

/**
 * Top-of-page reading progress.
 *
 * The bar eases towards the real scroll offset on its own rAF loop, so it
 * trails the page slightly and glides to a stop instead of snapping. All work
 * happens on transform only — no React state, no layout, no per-frame renders.
 */
export default function ScrollProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reduced ? 1 : EASE;

    let frame = 0;
    let current = 0;
    let target = 0;
    // Cached length of the scrollable page. Reading `scrollHeight` inside the
    // scroll handler forced a layout on every scroll event; the page only
    // changes height when content loads or the window resizes, and the
    // ResizeObserver below catches both.
    let max = 0;

    const paint = () => {
      fill.style.transform = `scaleX(${current})`;
    };

    const tick = () => {
      current += (target - current) * ease;

      if (Math.abs(target - current) < SETTLED) {
        current = target;
        paint();
        frame = 0;
        return;
      }

      paint();
      frame = requestAnimationFrame(tick);
    };

    const measure = () => {
      max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };

    const readScroll = () => {
      target = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      if (frame === 0) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      readScroll();
    };

    measure();
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // Lazy images landing in the page change its height; re-measure only when
    // that actually happens rather than on every scroll event.
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(document.body);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="progress-track" ref={trackRef} aria-hidden="true">
      <div className="progress-fill" ref={fillRef} />
    </div>
  );
}
