"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("BookSphere route error", { message: error.message, digest: error.digest });
    // Record the failure somewhere durable. Until now a production error existed only in
    // the reader's own console, so a route could break for everyone and leave no trace an
    // operator could ever see. Routed through analytics_events rather than a new service:
    // it needs no dependency, no key, and no account, and it surfaces in /admin/analytics
    // beside everything else. This is visibility, not alerting - nothing pages anyone.
    trackEvent("client_error", {
      message: error.message?.slice(0, 300) || "unknown",
      digest: error.digest || null,
      path: typeof window !== "undefined" ? window.location.pathname : null
    });
  }, [error]);

  return (
    <div className="editorial-page max-w-2xl">
      <p className="caption">Something went wrong</p>
      <h1 className="title-1 mt-3">This page could not finish loading.</h1>
      <p className="body-copy mt-4">Your work has not been intentionally cleared. Try the page again, or return to Explore.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white">Try again</button>
        <a href="/explore" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium ring-1 ring-black/[0.05]">Return to Explore</a>
      </div>
    </div>
  );
}
