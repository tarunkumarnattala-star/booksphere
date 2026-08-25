import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Carousel slides for BookSphere's organic content, rendered from markup by next/og.
//
// Monochrome on purpose: the content strategy specifies black, white, charcoal and soft
// grey, with colour rare and intentional. The product's green belongs to the product; an
// editorial account that teaches before it sells should not look like an ad for one.
//
// Rendered rather than model-generated because text IS the content here - a claim, a quote,
// an author's name - and image models still mangle text. Markup gives exact letters and a
// slide that looks identical on day 1 and day 60.
//
// GET /api/card?kind=hook&eyebrow=...&title=...&body=...&footer=...&index=1&total=5
// kinds: hook | idea | quote | tension | apply | ask
// ratio: portrait (1080x1350, default) | story (1080x1920)

export const runtime = "edge";

const INK = "#0d0d0d";
const PAPER = "#f4f4f2";
const CHARCOAL = "#1c1c1c";
const SOFT = "#8a8a86";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const kind = q.get("kind") || "idea";
  const eyebrow = q.get("eyebrow") || "";
  const title = q.get("title") || "";
  const body = q.get("body") || "";
  const footer = q.get("footer") || "";
  const attribution = q.get("attribution") || "";
  const index = Number(q.get("index") || "0");
  const total = Number(q.get("total") || "0");
  const story = q.get("ratio") === "story";

  const width = 1080;
  const height = story ? 1920 : 1350;

  // A quote slide is the one place the type should dominate; everything else keeps a
  // steadier hierarchy so a carousel does not shout on every frame.
  const isQuote = kind === "quote";
  const dark = kind === "hook" || isQuote;
  const bg = dark ? INK : PAPER;
  const fg = dark ? PAPER : CHARCOAL;
  const dim = dark ? "rgba(244,244,242,0.62)" : SOFT;

  const len = title.length;
  const titleSize = isQuote
    ? len > 150
      ? 54
      : len > 90
        ? 64
        : 76
    : len > 120
      ? 56
      : len > 74
        ? 66
        : 78;

  // Safe zone: platform controls sit over the bottom of a story, so pad harder there.
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
          {total > 1 ? (
            <div style={{ display: "flex", color: dim, fontSize: 22, letterSpacing: "0.08em" }}>
              {index} / {total}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {isQuote ? (
            <div
              style={{
                display: "flex",
                color: dim,
                fontSize: 96,
                lineHeight: 0.6,
                marginBottom: 18
              }}
            >
              &ldquo;
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              color: fg,
              fontSize: titleSize,
              fontWeight: isQuote ? 300 : 400,
              lineHeight: isQuote ? 1.16 : 1.08,
              letterSpacing: "-0.03em"
            }}
          >
            {title}
          </div>

          {attribution ? (
            <div style={{ display: "flex", marginTop: 26, color: dim, fontSize: 26 }}>
              {attribution}
            </div>
          ) : null}

          {body ? (
            <div
              style={{
                display: "flex",
                marginTop: 30,
                color: dark ? "rgba(244,244,242,0.74)" : "#4a4a48",
                fontSize: 30,
                lineHeight: 1.48,
                maxWidth: 860
              }}
            >
              {body}
            </div>
          ) : null}
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
          <div style={{ display: "flex", color: dim, fontSize: 24 }}>{footer}</div>
          <div style={{ display: "flex", color: dim, fontSize: 22, letterSpacing: "0.14em" }}>
            BOOKSPHERE
          </div>
        </div>
      </div>
    ),
    { width, height }
  );
}
