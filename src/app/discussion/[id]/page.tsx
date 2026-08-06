import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  if (!post) return { title: "Perspective not found" };
  const book = getBook(post.bookId);
  const author = post.authorName || "a reader";
  return {
    title: `${post.title} — ${book ? book.title : "BookSphere"}`,
    description: `${author} on ${book ? book.title : "a book"}: ${post.body.slice(0, 155)}`
  };
}

export default async function DiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { post } = await getSupabaseContributionById(id);
  if (!post) notFound();

  const book = getBook(post.bookId);
  const paragraphs = post.body.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <div className="editorial-page max-w-3xl">
      {book && (
        <Link href={`/book/${book.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">
          <ArrowLeft size={16} /> Back to {book.title}
        </Link>
      )}

      <article className="mt-6 rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
        <p className="caption">{post.postType}</p>
        <h1 className="title-1 mt-3 text-balance">{post.title}</h1>

        <p className="mt-4 text-sm font-medium text-[color:var(--color-text-secondary)]">
          {post.authorName || "A reader"}
          {post.authorUsername ? (
            <>
              {" · "}
              <Link href={`/profile/${post.authorUsername}`} className="underline underline-offset-4">@{post.authorUsername}</Link>
            </>
          ) : null}
        </p>

        <div className="mt-6 space-y-4">
          {paragraphs.map((line, index) => (
            <p key={index} className="text-[17px] leading-8 text-[color:var(--color-text-primary)]">{line}</p>
          ))}
        </div>

        {post.quoteReference && (
          <p className="mt-6 border-l-2 border-[color:var(--color-hairline)] pl-4 text-sm italic text-[color:var(--color-text-secondary)]">
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
      </article>

      {book && (
        <section className="mt-8 rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
          <p className="caption">The book this is about</p>
          <Link href={`/book/${book.id}`} className="mt-4 grid grid-cols-[64px_1fr] items-center gap-4">
            <BookCover book={bookCoverData(book)} className="w-full rounded-[10px]" />
            <span className="min-w-0">
              <span className="block text-base font-semibold text-[color:var(--color-text-primary)]">{book.title}</span>
              <span className="mt-1 block text-sm text-[color:var(--color-text-secondary)]">{book.author}</span>
            </span>
          </Link>
        </section>
      )}

      <section id="comments" className="mt-8 scroll-mt-24">
        <CommentThread postId={post.id} mode={post.postType === "Question" ? "answers" : "comments"} />
      </section>
    </div>
  );
}
