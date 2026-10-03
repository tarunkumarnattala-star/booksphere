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
    <div className="editorial-page">
      <header>
        <p className="caption">Feed</p>
        <h1 className="large-title mt-4 max-w-[18ch]">What readers are learning, out loud</h1>
        <p className="body-copy measure mt-5">
          Something you learned, tried, changed your mind about, or still cannot settle. A book
          can be the reason, but it is never required.
        </p>
      </header>

      <div className="mt-8">
        <FeedComposer initialTopic={initialTopic} />
      </div>

      {/* Three ways in for the blank-page moment. They are prompts, not examples: nothing here
          pretends to be something somebody wrote. */}
      <ul className="mt-5 grid gap-5 sm:grid-cols-3">
        {starters.map((starter) => (
          <li key={starter} className="footnote border-t border-[color:var(--rule)] pt-3">
            {starter}
          </li>
        ))}
      </ul>

      <section className="section-rule">
        <p className="caption">{posts.length ? "Latest" : "Nothing yet"}</p>
        {posts.length ? (
          <KnowledgeFeed seedPosts={posts} />
        ) : (
          // The feed used to render nothing at all when it was empty, which reads as a broken
          // page rather than an early one.
          <>
            <h2 className="title-1 mt-4 max-w-[18ch]">This is the first page of it</h2>
            <p className="body-copy measure mt-5">
              Write the thing you would have wanted to read after finishing your last book. A few
              lines is enough. Posts here are public, and anyone can reply to yours.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
