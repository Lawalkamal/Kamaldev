"use client";

import { useEffect, useRef } from "react";

/**
 * Reveals anything marked with `data-reveal` inside the returned ref once it
 * scrolls into view, then stops watching it.
 *
 * The CSS lives in globals.css (`.reveal` until `data-revealed`); this hook
 * only decides when. The attribute is deliberate — the cards re-render, and
 * React rewrites `className` on re-render, which would drop a class added
 * from here. Reduced motion (and browsers without IntersectionObserver) skip
 * straight to the revealed state, so nothing is ever left invisible.
 */
export function useRevealOnView<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = Array.from(
      container.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (!targets.length) return;

    const revealAll = () => targets.forEach((el) => el.setAttribute("data-revealed", ""));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      // Fires a little before the card is centred, so the rise lands as it
      // settles rather than starting from a dead stop.
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return containerRef;
}
