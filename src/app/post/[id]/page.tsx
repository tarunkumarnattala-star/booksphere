import { LocalKnowledgePostPage } from "@/components/local-knowledge-post-page";
import { getKnowledgePost } from "@/lib/data";
import { getSupabaseKnowledgePost } from "@/lib/knowledge-posts";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

// A knowledge post has its own address and is meant to be shared, and it was carrying the
// site-wide title, the site-wide description and an og:url pointing at the homepage.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = (await getSupabaseKnowledgePost(id)) || getKnowledgePost(id);
  if (!post) return pageMetadata({ title: "Post not found", noIndex: true });
  const author = post.authorName || "A reader";
  return pageMetadata({
    title: post.title,
    description: `${author}: ${post.body.slice(0, 155)}`,
    path: `/post/${id}`
  });
}

export default async function KnowledgePostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getSupabaseKnowledgePost(id) || getKnowledgePost(id);
  if (!post) return <LocalKnowledgePostPage id={id} />;
  return <LocalKnowledgePostPage id={id} initialPost={post} />;
}
