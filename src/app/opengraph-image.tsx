import { ImageResponse } from "next/og";

// The card a shared link is judged on, set like the product it opens: paper, one ink rule,
// a mono stamp, and the sentence the landing page actually leads with. It used to be a dark
// green panel with a rounded square where a logo would go - a third visual language, seen
// before either of the other two.
export const alt = "BookSphere — read the people who read the book";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#121713";
const INK_50 = "#5f665e";
const PAPER = "#f6f7f2";
const ACCENT = "#18392d";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          borderTop: `10px solid ${INK}`,
          padding: "64px 72px 56px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", color: ACCENT, fontSize: "24px", fontWeight: 600, letterSpacing: "4px" }}>
          BOOKSPHERE · EARLY ACCESS
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: INK, fontSize: "76px", lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: "950px" }}>
            You&apos;ll never read them all. Read the people who did.
          </div>
          <div style={{ color: INK_50, fontSize: "30px", marginTop: "32px", maxWidth: "860px", lineHeight: 1.4 }}>
            What people applied, questioned, changed their minds about, and could not make work.
          </div>
        </div>

        <div style={{ display: "flex", borderTop: `2px solid ${INK}`, paddingTop: "20px", color: INK_50, fontSize: "24px" }}>
          Free to read. No account needed.
        </div>
      </div>
    ),
    size
  );
}
