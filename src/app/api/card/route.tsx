import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Carousel slides for BookSphere's organic content, rendered from markup by next/og.
//
// Monochrome except for one green, which belongs to the book. The book is the subject of
// every slide, so it is the only thing that gets colour - on the opening slide it is the
// largest thing on the frame, not a credit line under the headline.
//
// Rendered rather than model-generated because text IS the content here, and image models
// still mangle letters. Markup gives exact type and a slide identical on day 1 and day 60.
//
// GET /api/card?kind=idea&num=01&title=...&body=...&index=2&total=7
// kinds: hook (dark, stacked headline) | idea | quote | tension | line (dark, closing)
// ratio: portrait (1080x1350, default) | story (1080x1920)

// Node.js runtime, not edge. On edge this route bundled to 1.05 MB against the plan's 1 MB
// edge-function limit, and Vercel rejected every production deploy that included it -
// the build passed and only the deploy step failed. ImageResponse renders the same on Node.
export const runtime = "nodejs";

const INK = "#0d0d0d";
const PAPER = "#f4f4f2";
const CHARCOAL = "#1c1c1c";
const SOFT = "#8a8a86";
const GREEN_ON_DARK = "#9acfb1";
const GREEN_ON_LIGHT = "#1d5c45";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const kind = q.get("kind") || "idea";
  const eyebrow = q.get("eyebrow") || "";
  const title = q.get("title") || "";
  const body = q.get("body") || "";
  const num = q.get("num") || "";
  const book = q.get("book") || "";
  const bookAuthor = q.get("bookAuthor") || "";
  // The opening slide sets the headline as three stacked lines so the book can be the
  // biggest thing on the frame: pre / BOOK / post.
  const pre = q.get("pre") || "";
  const post = q.get("post") || "";
  const index = Number(q.get("index") || "0");
  const total = Number(q.get("total") || "0");
  const story = q.get("ratio") === "story";

  const width = 1080;
  const height = story ? 1920 : 1350;

  const isQuote = kind === "quote";
  const isHook = kind === "hook";
  const isLine = kind === "line";
  const dark = isHook || isQuote || isLine;
  const bg = dark ? INK : PAPER;
  const fg = dark ? PAPER : CHARCOAL;
  const dim = dark ? "rgba(244,244,242,0.62)" : SOFT;
  const green = dark ? GREEN_ON_DARK : GREEN_ON_LIGHT;

  const len = title.length;
  const titleSize = isLine
    ? len > 64
      ? 92
      : 112
    : isQuote
      ? len > 120
        ? 60
        : 74
      : len > 96
        ? 62
        : len > 60
          ? 72
          : 84;

  // The book on the opening slide scales to fill the width it is given. It is the point of
  // the frame, so it never drops below the size of the words around it.
  const bookLen = book.length;
  const bookSize = bookLen > 26 ? 88 : bookLen > 18 ? 106 : bookLen > 12 ? 124 : 140;

  const padY = story ? 150 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: bg,
          padding: `${padY}px 78px`,
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* On the opening slide the book lives in the headline, so it is not repeated here. */}
            {book && !pre ? (
              <div
                style={{
                  display: "flex",
                  color: green,
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: "-0.01em"
                }}
              >
                {book}
              </div>
            ) : null}
            {bookAuthor && !pre ? (
              <div style={{ display: "flex", marginTop: 6, color: dim, fontSize: 24 }}>
                {bookAuthor}
              </div>
            ) : null}
            {(!book || pre) && eyebrow ? (
              <div
                style={{
                  display: "flex",
                  color: dim,
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase"
                }}
              >
                {eyebrow}
              </div>
            ) : null}
          </div>
          {total > 1 ? (
            <div style={{ display: "flex", color: dim, fontSize: 22, letterSpacing: "0.08em" }}>
              {index} / {total}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {pre ? (
            // Stacked headline. The book is a full line of its own, in green, at display size.
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", color: dim, fontSize: 58, letterSpacing: "-0.02em" }}>
                {pre}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  marginBottom: 8,
                  color: green,
                  fontSize: bookSize,
                  fontWeight: 600,
                  lineHeight: 0.98,
                  letterSpacing: "-0.04em"
                }}
              >
                {book}
              </div>
              <div
                style={{
                  display: "flex",
                  color: fg,
                  fontSize: 58,
                  fontWeight: 500,
                  lineHeight: 1.12,
                  letterSpacing: "-0.02em",
                  maxWidth: 840
                }}
              >
                {post}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {num ? (
                <div
                  style={{
                    display: "flex",
                    marginBottom: 22,
                    color: green,
                    fontSize: 30,
                    fontWeight: 600,
                    letterSpacing: "0.16em"
                  }}
                >
                  {num}
                </div>
              ) : null}

              {isQuote ? (
                <div style={{ display: "flex", color: dim, fontSize: 92, lineHeight: 0.6, marginBottom: 18 }}>
                  &ldquo;
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  color: fg,
                  fontSize: titleSize,
                  fontWeight: isLine ? 500 : isQuote ? 300 : 500,
                  lineHeight: isLine ? 1.0 : 1.08,
                  letterSpacing: "-0.035em",
                  maxWidth: 900
                }}
              >
                {title}
              </div>

              {/* One short line, never a paragraph. Set large enough to read as a statement. */}
              {body ? (
                <div
                  style={{
                    display: "flex",
                    marginTop: 34,
                    color: dark ? "rgba(244,244,242,0.72)" : "#55554f",
                    fontSize: 38,
                    lineHeight: 1.42,
                    letterSpacing: "-0.015em",
                    maxWidth: 880
                  }}
                >
                  {body}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${dark ? "rgba(244,244,242,0.2)" : "rgba(13,13,13,0.12)"}`,
            paddingTop: 26
          }}
        >
          <div
            style={{
              display: "flex",
              color: dim,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase"
            }}
          >
            {pre ? "" : eyebrow}
          </div>
          <div style={{ display: "flex", color: dim, fontSize: 22, letterSpacing: "0.14em" }}>
            BOOKSPHERE
          </div>
        </div>
      </div>
    ),
    { width, height }
  );
}
