/**
 * Tiny pub/sub that lets the preloader and the page transition hand off to
 * each other: the page content stays put until the curtain starts lifting,
 * so the entrance animation is actually seen instead of playing behind it.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
const SAFETY_TIMEOUT = 5000;

let revealed = typeof window === "undefined";
let timer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

export function hasRevealed() {
  return revealed;
}

export function revealPage() {
  if (revealed) return;
  revealed = true;
  clearTimer();
  listeners.forEach((listener) => listener());
}

export function subscribeReveal(listener: Listener) {
  listeners.add(listener);

  // Belt and braces: if the preloader ever fails to hand off, the content
  // must still become visible.
  if (!revealed && timer === null) {
    timer = setTimeout(() => revealPage(), SAFETY_TIMEOUT);
  }

  return () => {
    listeners.delete(listener);
  };
}
