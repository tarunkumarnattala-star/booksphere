import { ImageResponse } from "next/og";

// Shared links rendered with no image card. That matters more here than for most products:
// discussion permalinks exist so a single perspective can travel, and a bare link travels
// badly. Generated rather than shipped as a static asset so it stays in step with the
// wording on the landing page, and uses next/og, which is part of Next - no new dependency.
export const alt = "BookSphere — understand books through the people who lived their ideas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          backgroundColor: "#1e3a2f",
          padding: "72px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              border: "3px solid #f4f1e8",
              display: "flex"
            }}
          />
          <div style={{ color: "#f4f1e8", fontSize: "34px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            BookSphere
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#f4f1e8",
              fontSize: "68px",
              lineHeight: 1.08,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              maxWidth: "950px"
            }}
          >
            Understand books through the people who lived their ideas.
          </div>
          <div style={{ color: "#a9bdb0", fontSize: "30px", marginTop: "28px", maxWidth: "820px" }}>
            Go beyond the takeaway. See what people applied, questioned, changed, and learned.
          </div>
        </div>
      </div>
    ),
    size
  );
}
