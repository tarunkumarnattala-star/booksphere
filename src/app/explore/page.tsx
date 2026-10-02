import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionShelf } from "@/components/section-shelf";
import { BookCover } from "@/components/book-cover";
import {
  authorProfileFor,
  getBook,
  getDiscussionRankingLabel,
  getMostDiscussed,
  getTrendingDiscussionPosts
} from "@/lib/data";
import type { DiscussionPost } from "@/lib/types";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { isSupabaseConfigured } from "@/lib/supabase";
import { bookCoverData } from "@/lib/book-cover-data";

export const metadata: Metadata = pageMetadata({
  title: "Explore",
  description: "What readers made of these books.",
  path: "/explore"
});

// This page was 826 KB and uncacheable: it served a greeting, a value proposition, an FAQ,
// three book shelves, the reading paths, the whole genre directory, and a search box that
// carried all 394 books to the browser. On a phone it sat on the loading screen long enough
// to read as broken. It now does one thing - show what readers wrote - and caches, because
// perspectives arriving a few minutes late costs nobody anything.
export const revalidate = 300;

export default async function ExplorePage() {
  const persistedPosts = await getSupabaseFeedContributions(12);
  const trendingPosts = isSupabaseConfigured ? persistedPosts : getTrendingDiscussionPosts(12);
  // A card returns null when the catalog cannot resolve post.bookId, so filter once and drive
  // both the list and the empty state from the same array.
  const perspectives = trendingPosts.filter((post) => Boolean(getBook(post.bookId)));

  return (
    <div className="mx-auto max-w-[1560px]">
      {/* The first-use tour highlights [data-onboarding='explore']; without it the tour
          polls twenty times and then highlights nothing. */}
      <section data-onboarding="explore" className="container-page pb-6 pt-7 md:pt-9">
        <p className="caption mb-3">Perspectives</p>
        <h1 className="title-1 max-w-3xl">What readers made of these books</h1>
        <p className="body-copy mt-3 max-w-2xl">
          Open one to read it in full, ask the writer about it, or add your own.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/search"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85"
          >
            Find a book <ArrowRight size={16} />
          </Link>
          <Link
            href="/genres"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] transition hover:bg-black/[0.035]"
          >
            Browse genres
          </Link>
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="grid gap-2.5 lg:grid-cols-2">
          {perspectives.slice(0, 8).map((post, index) => (
            <PerspectiveCard key={post.id} post={post} priority={index === 0} />
          ))}
        </div>
        {!perspectives.length && (
          <p className="rounded-[20px] bg-black/[0.025] px-4 py-6 text-sm font-medium leading-6 text-[color:var(--color-text-secondary)]">
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

// The card shows the perspective's own first words. A card that describes a perspective
// ("a sharper way to discuss money and identity") is less interesting than the thing itself.
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
        <h2 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-[1.18] tracking-[-0.025em] text-[color:var(--color-text-primary)]">
          {post.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-sm leading-[1.45] text-[color:var(--color-text-secondary)]">{post.body}</p>
        <p className="mt-1.5 truncate text-[13px] text-[color:var(--color-text-muted)]">
          {book.title} · {profile.name}
        </p>
      </div>
    </Link>
  );
}
