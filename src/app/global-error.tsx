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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f7",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#1a1a1a"
        }}
      >
        <main style={{ maxWidth: "480px", padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a7a7a", margin: 0 }}>
            BookSphere
          </p>
          <h1 style={{ fontSize: "28px", lineHeight: 1.2, margin: "12px 0 0", letterSpacing: "-0.02em" }}>
            Something went wrong at our end.
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#5a5a5a", margin: "16px 0 0" }}>
            This is not your connection. Try again, and if it keeps happening, email{" "}
            <a href="mailto:booksphere.support@gmail.com" style={{ color: "#1a1a1a" }}>
              booksphere.support@gmail.com
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              minHeight: "44px",
              padding: "0 24px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
