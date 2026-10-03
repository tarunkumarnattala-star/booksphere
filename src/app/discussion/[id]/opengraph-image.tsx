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
          backgroundColor: "#f6f7f2",
          borderTop: "10px solid #121713",
          padding: "64px 72px 56px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", color: "#18392d", fontSize: "24px", fontWeight: 600, letterSpacing: "4px" }}>
          {(post?.postType || "PERSPECTIVE").toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            color: "#121713",
            fontSize: heading.length > 90 ? "54px" : "68px",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: "1000px"
          }}
        >
          {heading.slice(0, 150)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "2px solid #121713", paddingTop: "20px" }}>
          <div style={{ display: "flex", color: "#5f665e", fontSize: "26px" }}>{attribution}</div>
          <div style={{ display: "flex", color: "#18392d", fontSize: "22px", fontWeight: 600, letterSpacing: "4px" }}>BOOKSPHERE</div>
        </div>
      </div>
    ),
    size
  );
}
