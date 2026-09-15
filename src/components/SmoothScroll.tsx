"use client";

import { useEffect } from "react";
import { initSmoothScroll } from "@/lib/smooth-scroll";

/** Mounts the global smooth-scroll loop. Renders nothing. */
export default function SmoothScroll() {
  useEffect(() => initSmoothScroll(), []);

  return null;
}
