import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { CommentThread } from "@/components/comment-thread";
import { PostActions } from "@/components/post-actions";
import { getSupabaseContributionById } from "@/lib/contributions";
import { getBook } from "@/lib/data";
import { bookCoverData } from "@/lib/book-cover-data";

// A discussion is the unit of value here - one reader's account of what happened when
// they used an idea. Until this route existed the only way to reach one was
// /book/<slug>?thread=<id>, so every share pointed at the book rather than at the
// perspective, and the thing worth passing on had no address of its own.
// Comments accrue on this page, so it must not be served stale.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { post } = await getSupabaseContributionById(id);
  // Raised here as well as in the page body so metadata is never generated for a post
  // that does not exist. It does not change the status code: this was tried as a fix for
  // the soft 404 on the theory that metadata runs before the response streams, and
  // production disproved it - a malformed id, which never reaches a database lookup at
  // all, still answers 200. Whatever commits the status here happens earlier than any
  // application code, so it is not fixable from the route. Left in place because it is
  // correct on its own terms; the status limitation is recorded in LAUNCH_GATE.md.
  if (!post) notFound();
  const book = getBook(post.bookId);
  const author = post.authorName || "a reader";
  return pageMetadata({
    title: `${post.title} — ${book ? book.title : "BookSphere"}`,
    description: `${author} on ${book ? book.title : "a book"}: ${post.body.slice(0, 155)}`,
    path: `/discussion/${id}`,
    // Named rather than inherited from the segment's opengraph-image file, so the card
    // cannot be lost to metadata merge order the way the book cards just were.
    image: `/discussion/${id}/opengraph-image`,
    imageAlt: "A reader perspective on BookSphere"
  });
}

export default async function DiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { post } = await getSupabaseContributionById(id);
  if (!post) notFound();

  const book = getBook(post.bookId);
  const paragraphs = post.body.split("\n").map((line) => line.trim()).filter(Boolean);

  const written = new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article className="editorial-page editorial-prose">
      {book && (
        <p>
          <Link
            href={`/book/${book.id}`}
            className="caption caption-muted inline-flex min-h-11 items-center transition-colors hover:text-[color:var(--ink)]"
          >
            Back to {book.title}
          </Link>
        </p>
      )}

      {/* The perspective is the page. No card, no fill: the type stamp, the title, who wrote
          it and when, then the text set the way a book page is set - 17px, 1.72 leading,
          68 characters to the line. */}
      <header className="mt-5 border-t-2 border-[color:var(--ink)] pt-5">
        <p className="caption">{post.postType}</p>
        <h1 className="large-title mt-4 max-w-[20ch]">{post.title}</h1>
        <p className="footnote mt-5">
          {post.authorName || "A reader"}
          {post.authorUsername ? (
            <>
              {" \u00b7 "}
              <Link href={`/profile/${post.authorUsername}`} className="underline decoration-[color:var(--rule-strong)] underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">
                @{post.authorUsername}
              </Link>
            </>
          ) : null}
          {" \u00b7 "}
          {written}
        </p>
      </header>

      <div className="prose-perspective mt-8 space-y-5">
        {paragraphs.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      {post.quoteReference && (
        <p className="prose-perspective mt-8 border-l-2 border-[color:var(--rule-strong)] pl-5 text-[color:var(--ink-70)]">
          {post.quoteReference}
        </p>
      )}

      <PostActions
        post={post}
        targetId={post.id}
        likes={post.likes}
        comments={post.comments}
        saves={post.saves}
        follows={post.follows}
        awards={post.awards}
        usefulness={post.usefulness}
      />

      {book && (
        <section className="section-rule">
          <p className="caption">The book this is about</p>
          <ol className="records records-tight">
            <li className="record record-media">
              <Link href={`/book/${book.id}`} className="block w-full md:w-[96px]" tabIndex={-1} aria-hidden="true">
                <BookCover book={bookCoverData(book)} className="w-full" />
              </Link>
              <div className="min-w-0">
                <h2 className="record-title">
                  <Link href={`/book/${book.id}`} className="transition-colors hover:text-[color:var(--accent)]">{book.title}</Link>
                </h2>
                <p className="record-meta !mt-2">{book.author}</p>
                <p className="mt-5">
                  <Link href={`/book/${book.id}/create-discussion`} className="caption caption-muted inline-flex min-h-11 items-center transition-colors hover:text-[color:var(--ink)]">
                    Write your own on this book
                  </Link>
                </p>
              </div>
            </li>
          </ol>
        </section>
      )}

      <section className="section-rule">
        <CommentThread postId={post.id} mode={post.postType === "Question" ? "answers" : "comments"} />
      </section>
    </article>
  );
}
