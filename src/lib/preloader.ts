/** Shared preloader policy so the head script and the component cannot drift. */

/**
 * A plain data attribute on <html> rather than a class: the guard below runs
 * before hydration, and React does not manage attributes it never rendered,
 * so nothing is reported as a hydration mismatch.
 */
export const PRELOADER_ATTR = "data-preloader";
export const PRELOADER_PENDING = "pending";
export const PRELOADER_SKIP = "skip";
export const PRELOADER_SESSION_KEY = "kamal:preloaded";

/** Marks the document as still being in its first, server-rendered pass. */
const BOOT_ATTR = "data-boot";

/**
 * Rendered as the first element in <body>, so it runs while the parser is
 * still reading the document — before anything has been painted. It decides,
 * without waiting for hydration, whether the curtain will be shown:
 *
 *  - returning visitor / reduced motion -> hide the curtain outright
 *  - otherwise -> hold the page content behind the curtain, so nothing
 *    flashes before the reveal
 */
export const PRELOADER_GUARD_SCRIPT = `
(function () {
  try {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var seen = window.sessionStorage.getItem("${PRELOADER_SESSION_KEY}") === "1";
    var root = document.documentElement;
    root.setAttribute(
      "${PRELOADER_ATTR}",
      reduced || seen ? "${PRELOADER_SKIP}" : "${PRELOADER_PENDING}"
    );
    root.setAttribute("${BOOT_ATTR}", "1");
  } catch (error) {
    /* private mode or blocked storage: just show the page */
  }
})();
`;

/** Client-side counterpart of the guard script. */
export function shouldSkipPreloader() {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;

  try {
    return window.sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * True only for the mount that adopts the server-rendered markup.
 *
 * That markup has very likely been painted already, so animating it in would
 * make it blink: visible, hidden, then fading back. The marker is cleared on a
 * later task rather than immediately, so React's dev double-invoke still reads
 * the same answer as the first pass.
 */
export function isFirstPaint() {
  if (typeof document === "undefined") return false;

  const root = document.documentElement;
  if (root.getAttribute(BOOT_ATTR) !== "1") return false;

  setTimeout(() => root.removeAttribute(BOOT_ATTR), 0);
  return true;
}

/** True while the curtain is holding the page content back. */
export function isPageContentHeld() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(PRELOADER_ATTR) === PRELOADER_PENDING;
}

/**
 * Lifts the hold. The `skip` state is left alone — it keeps the curtain
 * hidden by CSS for the rest of the session.
 */
export function releasePageContent() {
  if (!isPageContentHeld()) return;
  document.documentElement.removeAttribute(PRELOADER_ATTR);
}
