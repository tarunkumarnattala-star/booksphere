import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { SectionShelf } from "@/components/section-shelf";
import { BookCover } from "@/components/book-cover";
import {
  authorProfileFor,
  getBook,
  getDiscussionRankingLabel,
  getMostDiscussed,
  getTrendingDiscussionPosts
} from "@/lib/data";
import type { DiscussionPost, KnowledgePost } from "@/lib/types";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { getSupabaseKnowledgePosts } from "@/lib/knowledge-posts";
import { getFeaturedQuestion } from "@/lib/featured-question";
import { isSupabaseConfigured } from "@/lib/supabase";
import { bookCoverData } from "@/lib/book-cover-data";

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description: "An open question, and what readers made of these books.",
  path: "/explore"
});

// Was 826 KB and uncacheable: a greeting, a value proposition, an FAQ, three shelves, the
// reading paths, the whole genre directory, and a search box carrying all 394 books. It now
// opens with one unanswered question and shows what readers wrote - and caches, because a
// perspective arriving a few minutes late costs nobody anything.
export const revalidate = 300;

type StreamItem =
  | { kind: "perspective"; at: string; post: DiscussionPost }
  | { kind: "note"; at: string; post: KnowledgePost };

export default async function HomePage() {
  const [persistedPosts, notes, featured] = await Promise.all([
    getSupabaseFeedContributions(12),
    getSupabaseKnowledgePosts(8),
    getFeaturedQuestion()
  ]);
  const trendingPosts = isSupabaseConfigured ? persistedPosts : getTrendingDiscussionPosts(12);
  const perspectives = trendingPosts.filter((post) => Boolean(getBook(post.bookId)));

  // Perspectives about a book and notes without one used to be two separate tabs. They are
  // the same thing to a reader - someone wrote something worth reading - so they share a
  // stream, newest first.
  const stream: StreamItem[] = [
    ...perspectives.map((post) => ({ kind: "perspective" as const, at: post.createdAt, post })),
    ...notes.map((post) => ({ kind: "note" as const, at: post.createdAt, post }))
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-[1560px]">
      {featured && (
        <section data-onboarding="explore" className="container-page pb-2 pt-7 md:pt-9">
          <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
            <p className="caption mb-3">Nobody has answered this yet</p>
            <h1 className="text-[26px] font-medium leading-[1.12] tracking-[-0.035em] text-[color:var(--color-text-primary)] md:text-[34px]">
              {featured.prompt.title}
            </h1>
            <p className="mt-3 text-sm text-[color:var(--color-text-secondary)] md:text-base">
              {featured.book.title} · {featured.book.author}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book/${featured.book.id}/create-discussion?prompt=${encodeURIComponent(featured.prompt.id)}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85"
              >
                <PenLine size={16} /> Answer this
              </Link>
              <Link
                href={`/book/${featured.book.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-black/[0.03] px-5 py-3 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:bg-black/[0.06]"
              >
                Read this book&rsquo;s page
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={`container-page pb-6 ${featured ? "pt-8" : "pt-7 md:pt-9"}`}>
        <p className="caption mb-3">Perspectives</p>
        <h2 className="title-1 max-w-3xl">What readers made of these books</h2>
        <p className="body-copy mt-3 max-w-2xl">
          Open one to read it in full, ask the writer about it, or add your own.
        </p>
        <div className="mt-6 grid gap-2.5 lg:grid-cols-2">
          {stream.map((item, index) =>
            item.kind === "perspective" ? (
              <PerspectiveCard key={item.post.id} post={item.post} priority={index === 0} />
            ) : (
              <NoteCard key={item.post.id} post={item.post} />
            )
          )}
        </div>
        {!stream.length && (
          <p className="mt-6 rounded-[20px] bg-black/[0.025] px-4 py-6 text-sm font-medium leading-6 text-[color:var(--color-text-secondary)]">
            Nothing has been written yet. Pick a book and answer one of its questions.
          </p>
        )}
      </section>

      <SectionShelf
        title="Books people are arguing about"
        subtitle="The books with the most perspectives written on them so far."
        books={getMostDiscussed()}
        badge="Most discussed"
        signal="insights"
      />
    </div>
  );
}

// Cards carry the writer's own first words. A card describing a perspective says less than
// the sentence it is describing.
function PerspectiveCard({ post, priority = false }: { post: DiscussionPost; priority?: boolean }) {
  const book = getBook(post.bookId);
  const profile = authorProfileFor(post);
  if (!book) return null;

  return (
    <Link
      href={`/discussion/${post.id}`}
      className="group flex min-w-0 items-start gap-3 rounded-[20px] p-3 transition hover:bg-black/[0.025]"
    >
      <BookCover
        book={bookCoverData(book)}
        priority={priority}
        className="w-[52px] shrink-0 rounded-[11px] shadow-[0_10px_24px_rgba(0,0,0,0.10)]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-text-secondary)]">
            {getDiscussionRankingLabel(post)}
          </span>
          <span className="caption text-[10px]">{post.postType}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-[1.18] tracking-[-0.025em] text-[color:var(--color-text-primary)]">
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-[1.45] text-[color:var(--color-text-secondary)]">{post.body}</p>
        <p className="mt-1.5 truncate text-[13px] text-[color:var(--color-text-muted)]">
          {book.title} · {profile.name}
        </p>
      </div>
    </Link>
  );
}

function NoteCard({ post }: { post: KnowledgePost }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group flex min-w-0 items-start gap-3 rounded-[20px] p-3 transition hover:bg-black/[0.025]"
    >
      <span className="mt-0.5 grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[11px] bg-black/[0.04] text-[color:var(--color-text-muted)]">
        <PenLine size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="caption text-[10px]">{post.topic || "Reader note"}</span>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-[1.18] tracking-[-0.025em] text-[color:var(--color-text-primary)]">
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-[1.45] text-[color:var(--color-text-secondary)]">{post.body}</p>
        <p className="mt-1.5 truncate text-[13px] text-[color:var(--color-text-muted)]">
          {post.referenceTitle ? `${post.referenceTitle} · ` : ""}
          {post.authorName || "A reader"}
        </p>
      </div>
    </Link>
  );
}
