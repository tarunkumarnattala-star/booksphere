"use client";

import { useEffect } from "react";

// error.tsx cannot catch a failure in the root layout itself - when that breaks, the reader
// gets Next's unstyled default, which does not look like this product at all. This is the
// last line before that. It must render its own <html> and <body> because the layout that
// normally provides them is what failed, and it deliberately avoids importing anything
// beyond React: a boundary that depends on the app is a boundary that fails with it.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("BookSphere root error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#f6f7f2",
          fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          color: "#121713"
        }}
      >
        {/* Ranged left on the paper, like every other page, rather than centred in the
            middle of the screen - the one screen a reader sees when everything else has
            failed should still look like the same product. */}
        <main style={{ maxWidth: "664px", padding: "32px 24px" }}>
          <p style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#18392d", margin: 0 }}>
            BookSphere
          </p>
          <h1 style={{ fontSize: "32px", fontWeight: 300, lineHeight: 1.08, margin: "20px 0 0", letterSpacing: "-0.02em", maxWidth: "20ch" }}>
            Something went wrong at our end.
          </h1>
          <p style={{ fontSize: "15px", lineHeight: 1.62, color: "#42493f", margin: "20px 0 0", maxWidth: "38em" }}>
            This is not your connection. Try again, and if it keeps happening, email{" "}
            <a href="mailto:booksphere.support@gmail.com" style={{ color: "#121713" }}>
              booksphere.support@gmail.com
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "32px",
              minHeight: "52px",
              padding: "0 32px",
              border: "1px solid #121713",
              backgroundColor: "#121713",
              color: "#f6f7f2",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer"
            }}
          >
            Load it again
          </button>
        </main>
      </body>
    </html>
  );
}
