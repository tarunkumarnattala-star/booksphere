"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

// Nothing recorded an arrival. Every event in the app fired from a deliberate action -
// saving a book, awarding a post - and all of those happen after sign-in, so the entire
// pre-account funnel was invisible: how many people landed, how many opened a book, how
// many reached the login screen and stopped.
//
// Records one event per pathname. Search params are deliberately excluded: they carry
// reader queries, which do not belong in an analytics table.
export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackEvent("page_viewed", { path: pathname });
  }, [pathname]);

  return null;
}
