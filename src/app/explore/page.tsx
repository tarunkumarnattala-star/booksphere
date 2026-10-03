import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import {
  authorProfileFor,
  books,
  getBook
} from "@/lib/data";
import type { DiscussionPost } from "@/lib/types";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { getFeaturedQuestion } from "@/lib/featured-question";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getTrendingDiscussionPosts } from "@/lib/data";

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

export default async function HomePage() {
  const [persistedPosts, featured] = await Promise.all([
    getSupabaseFeedContributions(12),
    getFeaturedQuestion()
  ]);
  const trendingPosts = isSupabaseConfigured ? persistedPosts : getTrendingDiscussionPosts(12);
  const perspectives = trendingPosts.filter((post) => Boolean(getBook(post.bookId)));

  // Notes without a book live in the Feed, which is its own destination: that is where
  // readers talk about what they are learning. Home stays about the books.
  const stream = perspectives.slice(0, 10);

  return (
    <div className="editorial-page">
      {featured && (
        // The question is the page. It sits on the paper with nothing around it - no card,
        // no fill, no shadow - because anything drawn around it would make it one item among
        // several instead of the thing you came to.
        <section data-onboarding="explore" className="pb-[52px]">
          <p className="caption">Nobody has answered this yet</p>
          <h1 className="large-title mt-5 max-w-[16ch]">{featured.prompt.title}</h1>
          <p className="footnote mt-5">
            {featured.book.title} &middot; {featured.book.author}
          </p>
          {/* One action is boxed. The second is a line of text, because reading the book page
              first is a smaller decision than writing and should not be offered at equal weight. */}
          <div className="mt-8 flex flex-col items-start gap-3">
            <Link
              href={`/book/${featured.book.id}/create-discussion?prompt=${encodeURIComponent(featured.prompt.id)}`}
              className="btn-ink w-full sm:w-auto"
            >
              Answer this
            </Link>
            <Link
              href={`/book/${featured.book.id}`}
              className="footnote inline-flex min-h-11 items-center text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] decoration-1 underline-offset-[5px] transition hover:decoration-[color:var(--ink)]"
            >
              Or read this book&rsquo;s page first
            </Link>
          </div>
        </section>
      )}

      <section className={`border-t-2 border-[color:var(--ink)] pt-8 ${featured ? "" : "mt-0 border-t-0 pt-0"}`}>
        <p className="caption">Perspectives</p>
        {stream.length ? (
          <>
            <h2 className="title-1 mt-4 max-w-[18ch]">What has been written so far</h2>
            <p className="body-copy measure mt-5">
              Each one is signed. Open one to read it in full, or reply to whoever wrote it.
            </p>
            {/* One record per perspective, separated by a rule: the same typographic pattern the
                landing page uses for the same content, so arriving here from there is continuous. */}
            <ol className="records">
              {stream.map((post) => (
                <PerspectiveRecord key={post.id} post={post} />
              ))}
            </ol>
          </>
        ) : (
          <>
            <h2 className="title-1 mt-4 max-w-[18ch]">Nothing has been written yet</h2>
            <p className="body-copy measure mt-5">
              {featured
                ? "The question above is a real one, and answering it would make this the first entry."
                : "Open any book and answer one of its questions. Yours would be the first entry."}
            </p>
          </>
        )}
      </section>

      {/* The shelf that used to close this page labelled six covers MOST DISCUSSED while every
          discussion count in the catalogue was zero, and the books it showed were already named
          under the perspectives above it. One honest line replaces it. */}
      <p className="mt-5">
        <Link
          href="/search"
          className="footnote text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] decoration-1 underline-offset-[5px] transition hover:decoration-[color:var(--ink)]"
        >
          All <span className="numeral">{books.length}</span> books, by name, genre or reading path
        </Link>
      </p>
    </div>
  );
}

// Cards carry the writer's own first words. A card describing a perspective says less than
// the sentence it is describing.
function PerspectiveRecord({ post }: { post: DiscussionPost }) {
  const book = getBook(post.bookId);
  const profile = authorProfileFor(post);
  if (!book) return null;

  return (
    <li>
      <Link href={`/discussion/${post.id}`} className="record interactive-lift hover:bg-[color:var(--band)]">
        <p className="caption record-stamp">{post.postType}</p>
        <div className="min-w-0">
          <h3 className="record-title">{post.title}</h3>
          <p className="record-text line-clamp-2">{post.body}</p>
          <p className="record-meta">
            {book.title} &middot; {book.author}
          </p>
          <p className="record-writer">Written by {profile.name}</p>
        </div>
      </Link>
    </li>
  );
}
