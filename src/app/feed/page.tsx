import { FeedComposer } from "@/components/feed-composer";
import { KnowledgeFeed } from "@/components/knowledge-feed";
import { knowledgePosts } from "@/lib/data";
import { getSupabaseKnowledgePosts } from "@/lib/knowledge-posts";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const persistedPosts = await getSupabaseKnowledgePosts(24);
  const posts = [...persistedPosts, ...knowledgePosts].filter(
    (post, index, all) => all.findIndex((item) => item.id === post.id) === index
  );

  return (
    <div className="editorial-page max-w-[980px]">
      <header className="mb-6 border-b border-[color:var(--color-hairline)] pb-5 md:mb-7">
        <p className="caption mb-2">Feed</p>
        <h1 className="title-1">Ideas shaped by real life.</h1>
        <p className="mt-2 max-w-2xl text-[15px] font-medium leading-6 text-[color:var(--color-text-secondary)] md:text-base">
          Share what you noticed, tried, changed, or questioned. A book can add context, but it is never required.
        </p>
      </header>

      <FeedComposer />

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="caption mb-2">For you</p>
            <h2 className="title-3">Useful thoughts from readers</h2>
          </div>
          <p className="hidden text-sm font-medium text-[color:var(--color-text-secondary)] sm:block">Following and community picks</p>
        </div>
        <KnowledgeFeed seedPosts={posts} variant="stream" />
      </section>
    </div>
  );
}
