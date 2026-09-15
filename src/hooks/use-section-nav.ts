"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { scrollToElement } from "@/lib/smooth-scroll";

/**
 * Navigates to a landing page section from anywhere in the app.
 * Eases to it when already on "/", otherwise sends the user back to "/" with a
 * hash so the section can scroll itself into view.
 */
export function useSectionNav() {
  const pathname = usePathname();
  const router = useRouter();

  return useCallback(
    (id: string) => {
      const element = document.getElementById(id);

      if (pathname === "/" && element) {
        scrollToElement(element);
        return;
      }

      router.push(`/#${id}`);
    },
    [pathname, router]
  );
}
