"use client";

import { useEffect, useRef, useState } from "react";
import { revealPage } from "@/lib/reveal-store";
import {
  PRELOADER_SESSION_KEY,
  releasePageContent,
  shouldSkipPreloader,
} from "@/lib/preloader";
import { lockScroll } from "@/lib/smooth-scroll";

const NAME = "Kamal.";
const LETTER_DELAY = 300;
const LETTER_STAGGER = 65;
/** Minimum time the curtain stays up, so the brand moment is not a flash. */
const MIN_DURATION = 1150;
/** Hard cap — never make anyone wait longer than this. */
const MAX_DURATION = 2400;
const WIPE_DURATION = 900;

type Phase = "loading" | "leaving" | "done";

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const countRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (shouldSkipPreloader()) {
      revealPage();
      releasePageContent();
      setPhase("done");
      return;
    }

    lockScroll(true);

    let frame = 0;
    let pageReady = document.readyState === "complete";
    let finished = false;

    const startedAt = performance.now();

    const markReady = () => {
      pageReady = true;
    };

    window.addEventListener("load", markReady, { once: true });
    // Never reveal the name before the font it is set in has arrived.
    document.fonts?.ready.then(markReady).catch(() => {});

    const paint = (progress: number) => {
      if (meterRef.current) {
        meterRef.current.style.transform = `scaleX(${progress})`;
      }
      if (countRef.current) {
        const label = String(Math.round(progress * 100));
        if (countRef.current.textContent !== label) {
          countRef.current.textContent = label;
        }
      }
    };

    const finish = () => {
      if (finished) return;
      finished = true;

      // Hand the stage over to the page transition, then drop the curtain.
      releasePageContent();
      revealPage();
      setPhase("leaving");
      lockScroll(false);

      try {
        window.sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
      } catch {
        /* storage unavailable — the loader simply runs again next visit */
      }
    };

    const step = (now: number) => {
      const elapsed = now - startedAt;
      if (elapsed >= MAX_DURATION) pageReady = true;

      // Ease out into the 88% plateau, then hold until the page is ready.
      const raw = Math.min(elapsed / MIN_DURATION, 1);
      const eased = raw * (2 - raw);
      const progress = pageReady ? eased : Math.min(eased, 0.88);

      paint(progress);

      if (progress >= 1 && pageReady) {
        finish();
        return;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", markReady);
      lockScroll(false);
    };
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const id = setTimeout(() => setPhase("done"), WIPE_DURATION);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`preloader${phase === "leaving" ? " preloader-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Kamal's portfolio"
    >
      <div className="preloader-glow" aria-hidden="true" />

      <div className="preloader-center" aria-hidden="true">
        <div className="preloader-name">
          {NAME.split("").map((letter, index) => (
            <span className="preloader-letter" key={`${letter}-${index}`}>
              <span
                className="preloader-letter-inner"
                style={{ animationDelay: `${LETTER_DELAY + index * LETTER_STAGGER}ms` }}
              >
                {letter}
              </span>
            </span>
          ))}
        </div>

        <span className="preloader-rule" />
        <p className="preloader-role">Web Developer · UI Designer</p>
      </div>

      <div className="preloader-foot" aria-hidden="true">
        <span className="preloader-meter">
          <span className="preloader-meter-fill" ref={meterRef} />
        </span>
        <span className="preloader-foot-row">
          <span>Preparing the portfolio</span>
          <span>
            <span className="preloader-count" ref={countRef}>
              0
            </span>
            %
          </span>
        </span>
      </div>
    </div>
  );
}
