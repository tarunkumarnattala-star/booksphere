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
  const [profilesResult, likesResult, commentsResult] = await Promise.all([
    supabase.from("profiles").select("id,name,username").in("id", userIds),
    supabase.from("likes").select("target_id").eq("target_type", "knowledge_post").in("target_id", postIds),
    supabase.from("discussion_comments").select("knowledge_post_id").in("knowledge_post_id", postIds)
  ]);
  const profiles = Object.fromEntries(((profilesResult.data || []) as DbProfile[]).map((profile) => [profile.id, profile]));
  const likes = (likesResult.data || []).reduce<Record<string, number>>((counts, row) => {
    counts[row.target_id] = (counts[row.target_id] || 0) + 1;
    return counts;
  }, {});
  const comments = (commentsResult.data || []).reduce<Record<string, number>>((counts, row) => {
    if (row.knowledge_post_id) counts[row.knowledge_post_id] = (counts[row.knowledge_post_id] || 0) + 1;
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
    comments: comments[row.id] || 0
  }));
}

// The database floor is char_length(trim(body)) between 4 and 2000
// (20260715061000_allow_short_feed_posts / 20260715061000_align_feed_post_minimum).
// Both the composer and the edit form read this so they cannot drift apart again - they
// already had, at 4 and 20, which froze every post written between those bounds.
export const MIN_KNOWLEDGE_POST_LENGTH = 4;

export function knowledgePostTitleFromBody(body: string) {
  const firstLine = body.split(/\n|(?<=[.!?])\s/)[0].trim();
  return firstLine.length <= 120 ? firstLine : `${firstLine.slice(0, 117).trim()}...`;
}

export async function getKnowledgePostViewerState(profileId: string, postId: string) {
  if (!supabase) return { liked: false, saved: false };
  const [likeResult, saveResult] = await Promise.all([
    supabase
      .from("likes")
      .select("id")
      .eq("user_id", profileId)
      .eq("target_type", "knowledge_post")
      .eq("target_id", postId)
      .maybeSingle(),
    supabase
      .from("saved_knowledge_posts")
      .select("id")
      .eq("user_id", profileId)
      .eq("knowledge_post_id", postId)
      .maybeSingle()
  ]);
  return { liked: Boolean(likeResult.data), saved: Boolean(saveResult.data) };
}

export async function toggleSupabaseKnowledgePostLike(profileId: string, postId: string, adding: boolean) {
  if (!supabase) return { error: "Community actions are temporarily unavailable." };
  const query = adding
    ? supabase.from("likes").upsert(
        { user_id: profileId, target_type: "knowledge_post", target_id: postId },
        { onConflict: "user_id,target_type,target_id" }
      )
    : supabase.from("likes").delete().eq("user_id", profileId).eq("target_type", "knowledge_post").eq("target_id", postId);
  const { error } = await query;
  return { error: error ? "We could not save your like. Please try again." : null };
}

export async function toggleSupabaseKnowledgePostSave(profileId: string, postId: string, adding: boolean) {
  if (!supabase) return { error: "Community actions are temporarily unavailable." };
  const query = adding
    // insert, not upsert - same fault as reporting. saved_knowledge_posts grants
    // authenticated select, insert and delete but no update, and upsert compiles to
    // INSERT ... ON CONFLICT DO UPDATE, which Postgres refuses to plan without update
    // privilege. Saving a feed post has therefore never worked either. A duplicate here
    // means the post is already saved, which is exactly what the reader asked for.
    ? supabase.from("saved_knowledge_posts").insert(
        { user_id: profileId, knowledge_post_id: postId }
      )
    : supabase.from("saved_knowledge_posts").delete().eq("user_id", profileId).eq("knowledge_post_id", postId);
  const { error } = await query;
  if (error && error.code === "23505") return { error: null };
  return { error: error ? "We could not save this post. Please try again." : null };
}

export async function updateSupabaseKnowledgePost(profileId: string, postId: string, input: {
  body: string;
  topic?: string;
  referenceTitle?: string;
}) {
  if (!supabase) return { post: null, error: "Community editing is temporarily unavailable." };
  const { data, error } = await supabase
    .from("knowledge_posts")
    .update({
      title: knowledgePostTitleFromBody(input.body),
      body: input.body.trim(),
      topic: input.topic?.trim() || null,
      reference_title: input.referenceTitle?.trim() || null
    })
    .eq("id", postId)
    .eq("user_id", profileId)
    .select(knowledgePostSelect)
    .single();
  if (error || !data) return { post: null, error: "We could not save your edit. Please try again." };
  const [post] = await hydrateKnowledgePosts([data as DbKnowledgePost]);
  return { post: post || null, error: null };
}

export async function deleteSupabaseKnowledgePost(profileId: string, postId: string) {
  if (!supabase) return { error: "Community editing is temporarily unavailable." };
  // Zero rows deleted is not an error to PostgREST. Without the read-back the author is
  // shown their post vanishing and redirected to the feed while the post is still public.
  const { data, error } = await supabase
    .from("knowledge_posts").delete().eq("id", postId).eq("user_id", profileId).select("id");
  if (error) return { error: "We could not delete this post. Please try again." };
  if (!data?.length) return { error: "You do not have permission to delete this post." };
  return { error: null };
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

export async function getSupabaseKnowledgePostsByUser(userId: string, limit = 50) {
  if (!supabase) return [] as KnowledgePost[];
  const { data, error } = await supabase
    .from("knowledge_posts")
    .select(knowledgePostSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data?.length) return [];
  return hydrateKnowledgePosts(data as DbKnowledgePost[]);
}

// /saved queried saved_books and saved_insights only, so a reader who saved a feed post
// wrote a real row into saved_knowledge_posts and then never saw it anywhere. The button
// said "Saved" and the shelf denied it existed.
export async function getSupabaseKnowledgePostsByIds(ids: string[]) {
  if (!supabase || ids.length === 0) return [] as KnowledgePost[];
  const { data, error } = await supabase
    .from("knowledge_posts")
    .select(knowledgePostSelect)
    .in("id", ids.slice(0, 200));
  if (error || !data?.length) return [];
  const posts = await hydrateKnowledgePosts(data as DbKnowledgePost[]);
  const byId = new Map(posts.map((post) => [post.id, post]));
  return ids.flatMap((id) => {
    const post = byId.get(id);
    return post ? [post] : [];
  });
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
