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
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    const head = headRef.current;
    if (!track || !fill || !head) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reduced ? 1 : EASE;

    let frame = 0;
    let width = track.clientWidth;
    let current = 0;
    let target = 0;

    const paint = () => {
      fill.style.transform = `scaleX(${current})`;
      head.style.transform = `translate3d(${current * width}px, 0, 0)`;
      // The head only means something while there is progress to point at.
      head.style.opacity = current > 0.002 && current < 0.998 ? "1" : "0";
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

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      if (frame === 0) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      width = track.clientWidth;
      readScroll();
    };

    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="progress-track" ref={trackRef} aria-hidden="true">
      <div className="progress-fill" ref={fillRef} />
      <div className="progress-head" ref={headRef} />
    </div>
  );
}
