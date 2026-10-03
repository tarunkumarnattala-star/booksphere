import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { FeedComposer } from "@/components/feed-composer";
import { KnowledgeFeed } from "@/components/knowledge-feed";
import { knowledgePosts } from "@/lib/data";
import { getSupabaseKnowledgePosts } from "@/lib/knowledge-posts";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = pageMetadata({
  title: "Feed",
  description: "What readers are learning from books, in public.",
  path: "/feed"
});

// Stays dynamic while Home caches: Home shows a question that changes daily, the Feed shows
// what somebody wrote a minute ago - including your own post, which has to appear the moment
// you publish it.
export const dynamic = "force-dynamic";

// Three ways in, for the blank-page moment. They are prompts, not examples: nothing here
// pretends to be a post somebody wrote.
const starters = [
  "An idea you tried this week, and what actually happened.",
  "Something a book changed your mind about.",
  "A question you cannot settle yet."
];

export default async function FeedPage({ searchParams }: { searchParams?: Promise<{ topic?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const initialTopic = params.topic?.trim().slice(0, 80) || "";
  // The three editorial seeds share ids with their database rows, so the dedupe hides this
  // today - but past 24 live posts the database copies fall outside getSupabaseKnowledgePosts
  // and the seed copies re-enter at the bottom carrying likes: 0, comments: 0 and no author,
  // contradicting the same post's counts on /post/[id].
  const persistedPosts = await getSupabaseKnowledgePosts(24);
  const posts = (isSupabaseConfigured ? persistedPosts : [...persistedPosts, ...knowledgePosts]).filter(
    (post, index, all) => all.findIndex((item) => item.id === post.id) === index
  );

  return (
    <div className="editorial-page max-w-[980px]">
      {/* The tab is already labelled Feed in the bar at the bottom of the screen, so the
          eyebrow above the heading was the third time the word appeared. */}
      <header className="mb-4 border-b border-[color:var(--color-hairline)] pb-4">
        <h1 className="title-1">What readers are learning, out loud.</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[color:var(--color-text-secondary)]">
          A book can be the reason, but it is never required.
        </p>
      </header>

      <FeedComposer initialTopic={initialTopic} />

      <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
        {starters.map((starter) => (
          <li
            key={starter}
            className="rounded-[16px] bg-black/[0.025] px-3.5 py-3 text-[13px] leading-[1.4] text-[color:var(--color-text-secondary)]"
          >
            {starter}
          </li>
        ))}
      </ul>

      <section className="mt-6">
        <h2 className="title-3 mb-3">{posts.length ? "What readers are sharing" : "Nobody has posted yet"}</h2>
        {posts.length ? (
          <KnowledgeFeed seedPosts={posts} variant="stream" />
        ) : (
          // The feed used to render nothing at all when it was empty, which reads as a broken
          // page rather than an early one.
          <div className="rounded-[24px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
            <p className="text-[15px] leading-[1.55] text-[color:var(--color-text-primary)]">
              This is the first page of it. Write the thing you would have wanted to read after
              finishing your last book &mdash; a few lines is enough.
            </p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">
              Posts here are public, and anyone can reply to yours.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
