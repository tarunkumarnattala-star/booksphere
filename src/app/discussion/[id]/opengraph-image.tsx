import { ImageResponse } from "next/og";
import { getSupabaseContributionById } from "@/lib/contributions";
import { getBook } from "@/lib/data";

// A perspective's card should show the perspective, not the site. This is the surface a
// shared discussion link is judged on, and the argument itself is the reason to click.
export const alt = "A reader perspective on BookSphere";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function DiscussionOpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { post } = await getSupabaseContributionById(id);
  const book = post ? getBook(post.bookId) : undefined;

  const heading = post?.title || "A reader perspective";
  const attribution = post
    ? `${post.authorName || "A reader"}${book ? ` · ${book.title}` : ""}`
    : "BookSphere";

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
        <div style={{ display: "flex", color: "#a9bdb0", fontSize: "26px", letterSpacing: "0.08em" }}>
          {(post?.postType || "PERSPECTIVE").toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            color: "#f4f1e8",
            fontSize: heading.length > 90 ? "50px" : "62px",
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            maxWidth: "1000px"
          }}
        >
          {heading.slice(0, 150)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", color: "#a9bdb0", fontSize: "28px" }}>{attribution}</div>
          <div style={{ display: "flex", color: "#f4f1e8", fontSize: "26px", fontWeight: 600 }}>BookSphere</div>
        </div>
      </div>
    ),
    size
  );
}
