import { books } from "./data";
import { hydrateContributions, type DbContribution } from "./contributions";
import { supabase } from "./supabase";
import { getSupabaseKnowledgePostsByUser } from "./knowledge-posts";
import type { DiscussionPost, KnowledgePost, Profile } from "./types";

type DbProfile = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  created_at: string;
};

export type CanonicalProfileBundle = {
  profile: Profile;
  contributions: DiscussionPost[];
  knowledgePosts: KnowledgePost[];
  totals: {
    likesReceived: number;
    commentsReceived: number;
    savesReceived: number;
    usefulnessReceived: number;
    followers: number;
    following: number;
    insights: number;
    applications: number;
    questions: number;
    disagreements: number;
    summaries: number;
  };
};

function topGenresFromContributions(contributions: DiscussionPost[]) {
  const counts = new Map<string, number>();
  contributions.forEach((post) => {
    const book = books.find((item) => item.id === post.bookId);
    book?.genres.forEach((genre) => counts.set(genre, (counts.get(genre) || 0) + 1));
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([genre]) => genre).slice(0, 3);
}

export async function getCanonicalProfileBundle(username: string): Promise<CanonicalProfileBundle | null> {
  if (!supabase) return null;
  const { data: dbProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id,name,username,bio,created_at")
    .eq("username", username)
    .maybeSingle();

  if (profileError || !dbProfile) return null;
  const profileRow = dbProfile as DbProfile;
  const [
    postsResult,
    followersResult,
    followingResult
  ] = await Promise.all([
    supabase
      .from("discussion_posts")
      .select("id,book_id,user_id,post_type,perspective_type,title,body,quote_reference,chapter_id,concept_id,connected_book_id,context_type,action_taken,outcome,what_failed,would_change,status,created_at,updated_at")
      .eq("user_id", profileRow.id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profileRow.id),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profileRow.id)
  ]);

  if (postsResult.error) return null;
  const postRows = (postsResult.data || []) as DbContribution[];
  const bookIds = [...new Set(postRows.map((post) => post.book_id))];
  const { data: dbBooks } = bookIds.length
    ? await supabase.from("books").select("id,title,author").in("id", bookIds)
    : { data: [] };
  const dbBooksById = Object.fromEntries(((dbBooks || []) as Array<{ id: string; title: string; author: string }>).map((book) => [book.id, book]));
  const contributions = await hydrateContributions(postRows, dbBooksById);
  const knowledgePosts = await getSupabaseKnowledgePostsByUser(profileRow.id);
  const usefulnessReceived = contributions.reduce((sum, post) => sum + (post.usefulness || []).reduce((inner, reaction) => inner + reaction.count, 0), 0);
  const profile: Profile = {
    id: profileRow.id,
    name: profileRow.name,
    username: profileRow.username,
    bio: profileRow.bio || "Sharing useful book perspectives on BookSphere.",
    createdAt: profileRow.created_at,
    followers: followersResult.count || 0,
    following: followingResult.count || 0,
    badges: contributions.length ? ["Community Contributor"] : [],
    topGenres: topGenresFromContributions(contributions)
  };

  return {
    profile,
    contributions,
    knowledgePosts,
    totals: {
      likesReceived: contributions.reduce((sum, post) => sum + post.likes, 0),
      commentsReceived: contributions.reduce((sum, post) => sum + post.comments, 0),
      savesReceived: contributions.reduce((sum, post) => sum + post.saves, 0),
      usefulnessReceived,
      followers: profile.followers,
      following: profile.following,
      insights: contributions.filter((post) => post.postType === "Insight").length,
      applications: contributions.filter((post) => post.postType === "Application" || post.postType === "Real-Life Result").length,
      questions: contributions.filter((post) => post.postType === "Question").length,
      disagreements: contributions.filter((post) => post.postType === "Disagreement").length,
      summaries: contributions.filter((post) => post.postType === "Summary").length
    }
  };
}
