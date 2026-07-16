import { LocalKnowledgePostPage } from "@/components/local-knowledge-post-page";
import { getKnowledgePost } from "@/lib/data";
import { getSupabaseKnowledgePost } from "@/lib/knowledge-posts";

export const dynamic = "force-dynamic";

export default async function KnowledgePostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getSupabaseKnowledgePost(id) || getKnowledgePost(id);
  if (!post) return <LocalKnowledgePostPage id={id} />;
  return <LocalKnowledgePostPage id={id} initialPost={post} />;
}
