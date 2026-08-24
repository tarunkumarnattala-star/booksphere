"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

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

  // Sign-ins were invisible. profiles told you how many accounts exist, but not when anyone
  // came back, and the beta's whole question is who arrived versus who wrote. onAuthStateChange
  // fires SIGNED_IN on every token refresh and tab focus, so it is deduped per browser session
  // - otherwise one reader with a tab open all day would look like a crowd.
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      try {
        if (window.sessionStorage.getItem("booksphere.signedInTracked")) return;
        window.sessionStorage.setItem("booksphere.signedInTracked", "1");
      } catch {
        // A blocked sessionStorage should not cost us the event entirely.
      }
      trackEvent("signed_in", {});
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
