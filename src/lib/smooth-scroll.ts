/**
 * Lightweight smooth scrolling.
 *
 * Intercepts wheel + keyboard input, then eases the *real* scroll position
 * towards a target with a requestAnimationFrame lerp loop. Because it moves
 * the native scroll position instead of transforming a wrapper, sticky and
 * fixed elements, scrollbars, browser find-in-page and Next.js scroll
 * restoration all keep working.
 *
 * Disabled for reduced-motion users and for touch/coarse pointers, where the
 * native momentum scrolling is better than anything we could fake.
 */

const LERP = 0.12;
const EPSILON = 0.4;
const KEY_STEP = 90;

let active = false;
let locked = false;
let refCount = 0;
let frameId: number | null = null;
let lastFrame = 0;
let current = 0;
let target = 0;
// Cached scrollable length. Reading `scrollHeight` inside `onWheel` forced a
// full layout on every wheel tick — measurable on a throttled CPU. The page
// only changes height when content loads or the window resizes, both caught
// by the ResizeObserver / resize handler below.
let maxScrollY = 0;

/* ---------------------------------------------------------------- utils */

const canUseDom = () => typeof window !== "undefined" && typeof document !== "undefined";

function prefersReducedMotion() {
  return canUseDom() && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointer() {
  return canUseDom() && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function measureMaxScroll() {
  maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** Cached page length, measured lazily so first use never reads 0. */
function scrollLimit() {
  if (maxScrollY <= 0) measureMaxScroll();
  return maxScrollY;
}

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

/* ------------------------------------------------------------ animation */

function tick(now: number) {
  // Frame-rate independent easing so 60Hz and 144Hz feel the same.
  const dt = Math.min(now - lastFrame, 64) / 16.6667;
  lastFrame = now;

  const diff = target - current;

  if (Math.abs(diff) < EPSILON) {
    current = target;
    window.scrollTo(0, current);
    frameId = null;
    return;
  }

  current += diff * (1 - Math.pow(1 - LERP, dt));
  window.scrollTo(0, current);
  frameId = requestAnimationFrame(tick);
}

function start() {
  if (frameId !== null) return;
  lastFrame = performance.now();
  frameId = requestAnimationFrame(tick);
}

function stop() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}

/* -------------------------------------------------------------- handlers */

function normalizeWheel(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * 16; // lines
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight; // pages
  return event.deltaY;
}

function onWheel(event: WheelEvent) {
  if (!active || locked || event.ctrlKey || event.defaultPrevented) return;

  event.preventDefault();
  target = clamp(target + normalizeWheel(event), 0, scrollLimit());
  start();
}

function onKeyDown(event: KeyboardEvent) {
  if (!active || locked) return;
  const el = event.target as HTMLElement | null;
  if (
    el &&
    (el.isContentEditable ||
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT")
  ) {
    return;
  }

  const page = window.innerHeight * 0.9;
  let next: number;

  switch (event.key) {
    case "ArrowDown":
      next = target + KEY_STEP;
      break;
    case "ArrowUp":
      next = target - KEY_STEP;
      break;
    case "PageDown":
      next = target + page;
      break;
    case "PageUp":
      next = target - page;
      break;
    case " ":
    case "Spacebar":
      next = target + (event.shiftKey ? -page : page);
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = scrollLimit();
      break;
    default:
      return;
  }

  event.preventDefault();
  target = clamp(next, 0, scrollLimit());
  start();
}

/**
 * Anything that scrolls outside of our loop (scrollbar drag, keyboard on a
 * browser we do not intercept, Next.js restoring a position, a hash jump)
 * is picked up here and adopted as the new target.
 */
function onNativeScroll() {
  if (!active) return;

  const y = window.scrollY;
  if (Math.abs(y - current) > 2) {
    stop();
    current = y;
    target = y;
  }
}

function onResize() {
  if (!active) return;

  measureMaxScroll();
  const max = maxScrollY;
  target = clamp(target, 0, max);
  current = clamp(current, 0, max);
}

/* ----------------------------------------------------------------- api */

let resizeObserver: ResizeObserver | null = null;

export function initSmoothScroll(): () => void {
  if (!canUseDom()) return () => {};

  refCount += 1;

  if (!active) {
    if (prefersReducedMotion() || isCoarsePointer()) {
      return () => {
        refCount -= 1;
      };
    }

    active = true;
    current = target = window.scrollY;
    measureMaxScroll();

    // Our own scrollTo calls must not be re-animated by CSS.
    document.documentElement.style.scrollBehavior = "auto";

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // Lazy images, filters and preloader unlock all change the page height;
    // re-measure when that actually happens instead of per wheel tick.
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (active) measureMaxScroll();
      });
      resizeObserver.observe(document.body);
    }
  }

  return () => {
    refCount -= 1;
    if (refCount > 0) return;

    stop();
    active = false;
    document.documentElement.style.scrollBehavior = "";
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("scroll", onNativeScroll);
    window.removeEventListener("resize", onResize);
    resizeObserver?.disconnect();
    resizeObserver = null;
  };
}

export function isSmoothScrollActive() {
  return active;
}

/** Animates to an absolute document position. */
export function scrollToY(y: number, options: { immediate?: boolean } = {}) {
  if (!canUseDom()) return;

  const destination = clamp(y, 0, scrollLimit());

  if (!active) {
    window.scrollTo({
      top: destination,
      behavior: options.immediate || prefersReducedMotion() ? "auto" : "smooth",
    });
    return;
  }

  if (options.immediate) {
    stop();
    current = target = destination;
    window.scrollTo(0, destination);
    return;
  }

  target = destination;
  start();
}

/** Animates to an element, optionally leaving `offset` px of breathing room. */
export function scrollToElement(element: Element | null, offset = 0) {
  if (!element) return;
  scrollToY(element.getBoundingClientRect().top + window.scrollY - offset);
}

export function scrollToTop(immediate = false) {
  scrollToY(0, { immediate });
}

/**
 * Freezes scrolling (used while the preloader is on screen) without leaking a
 * layout shift, thanks to `scrollbar-gutter: stable` on <html>.
 */
export function lockScroll(nextLocked: boolean) {
  if (!canUseDom() || locked === nextLocked) return;

  locked = nextLocked;
  document.documentElement.style.overflow = nextLocked ? "hidden" : "";

  if (nextLocked) {
    stop();
  } else {
    current = target = window.scrollY;
    // Content rendered or images loaded behind the curtain changed the page
    // height; refresh the cached limit as scrolling resumes.
    measureMaxScroll();
  }
}

/** Current eased position — useful for progress indicators. */
export function getScrollPosition() {
  return active ? current : canUseDom() ? window.scrollY : 0;
}
