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
    <div className="editorial-page editorial-prose">
      <p className="caption">Something went wrong</p>
      <h1 className="title-1 mt-4 max-w-[20ch]">This page could not finish loading.</h1>
      <p className="body-copy measure mt-5">
        Nothing you wrote has been cleared. Load the page again, or go back to Home.
      </p>
      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-ink w-full sm:w-auto">Load it again</button>
        <a href="/explore" className="footnote inline-flex min-h-11 items-center text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] decoration-1 underline-offset-[5px]">Back to Home</a>
      </div>
    </div>
  );
}
