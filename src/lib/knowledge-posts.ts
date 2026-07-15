import { supabase } from "./supabase";
import type { KnowledgePost } from "./types";

type DbKnowledgePost = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  topic: string | null;
  reference_title: string | null;
  created_at: string;
};

type DbProfile = { id: string; name: string; username: string };

const knowledgePostSelect = "id,user_id,title,body,topic,reference_title,created_at";

async function hydrateKnowledgePosts(rows: DbKnowledgePost[]) {
  if (!supabase || rows.length === 0) return [] as KnowledgePost[];
  const postIds = rows.map((row) => row.id);
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const [profilesResult, likesResult] = await Promise.all([
    supabase.from("profiles").select("id,name,username").in("id", userIds),
    supabase.from("likes").select("target_id").eq("target_type", "knowledge_post").in("target_id", postIds)
  ]);
  const profiles = Object.fromEntries(((profilesResult.data || []) as DbProfile[]).map((profile) => [profile.id, profile]));
  const likes = (likesResult.data || []).reduce<Record<string, number>>((counts, row) => {
    counts[row.target_id] = (counts[row.target_id] || 0) + 1;
    return counts;
  }, {});

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    authorName: profiles[row.user_id]?.name,
    authorUsername: profiles[row.user_id]?.username,
    title: row.title,
    body: row.body,
    topic: row.topic || "Reflection",
    referenceTitle: row.reference_title || undefined,
    createdAt: row.created_at,
    likes: likes[row.id] || 0,
    comments: 0
  }));
}

export async function getSupabaseKnowledgePosts(limit = 30) {
  if (!supabase) return [] as KnowledgePost[];
  const { data, error } = await supabase
    .from("knowledge_posts")
    .select(knowledgePostSelect)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data?.length) return [];
  return hydrateKnowledgePosts(data as DbKnowledgePost[]);
}

export async function getSupabaseKnowledgePost(id: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("knowledge_posts")
    .select(knowledgePostSelect)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const [post] = await hydrateKnowledgePosts([data as DbKnowledgePost]);
  return post || null;
}

export async function createSupabaseKnowledgePost(input: {
  profileId: string;
  title: string;
  body: string;
  topic?: string;
  referenceTitle?: string;
}) {
  if (!supabase) return { post: null, error: "Community publishing is temporarily unavailable." };
  const { data, error } = await supabase
    .from("knowledge_posts")
    .insert({
      user_id: input.profileId,
      title: input.title,
      body: input.body,
      topic: input.topic?.trim() || null,
      reference_title: input.referenceTitle?.trim() || null
    })
    .select(knowledgePostSelect)
    .single();
  if (error || !data) return { post: null, error: "We could not publish this thought. Please try again." };
  const [post] = await hydrateKnowledgePosts([data as DbKnowledgePost]);
  return { post: post || null, error: null };
}
