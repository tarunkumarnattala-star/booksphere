import { supabase } from "./supabase";
import { books, getBook } from "./data";
import type { AwardType, Book, DiscussionPost, PostType, UsefulnessReaction, UsefulnessReactionType } from "./types";

export type DbContribution = {
  id: string;
  book_id: string;
  user_id: string;
  post_type: PostType;
  perspective_type?: string | null;
  title: string;
  body: string;
  quote_reference?: string | null;
  chapter_id?: string | null;
  concept_id?: string | null;
  connected_book_id?: string | null;
  context_type?: string | null;
  action_taken?: string | null;
  outcome?: string | null;
  what_failed?: string | null;
  would_change?: string | null;
  status?: "draft" | "published" | "archived" | "removed";
  created_at: string;
  updated_at?: string | null;
};

type DbBookRef = { id: string; title: string; author: string };
type DbProfileRef = { id: string; name: string; username: string };

export const perspectiveTypeByPostType: Record<PostType, string> = {
  Insight: "insight",
  Application: "application",
  Disagreement: "disagreement",
  Summary: "summary",
  Question: "question",
  Connection: "connection",
  "Real-Life Result": "real_life_result",
  "What Did Not Work": "did_not_work",
  Limitation: "limitation",
  Quote: "insight",
  "Personal Experience": "real_life_result"
};

const postTypeByPerspectiveType: Record<string, PostType> = {
  insight: "Insight",
  application: "Application",
  disagreement: "Disagreement",
  summary: "Summary",
  question: "Question",
  connection: "Connection",
  real_life_result: "Real-Life Result",
  did_not_work: "What Did Not Work",
  limitation: "Limitation"
};

export const dbReactionByLabel: Record<UsefulnessReactionType, string> = {
  "Helped me understand": "helped_understand",
  "Helped me apply": "helped_apply",
  "Changed my thinking": "changed_thinking",
  "Strong counterargument": "strong_counterargument",
  "Best summary": "best_summary",
  "Worth reading full book": "worth_full_read"
};

export const reactionLabelByDb: Record<string, UsefulnessReactionType> = Object.fromEntries(
  Object.entries(dbReactionByLabel).map(([label, db]) => [db, label as UsefulnessReactionType])
) as Record<string, UsefulnessReactionType>;

function localBookForDbBook(dbBook?: DbBookRef | null) {
  if (!dbBook) return undefined;
  return books.find((book) => book.title.toLowerCase() === dbBook.title.toLowerCase() && book.author.toLowerCase() === dbBook.author.toLowerCase());
}

async function resolveDbBook(book: Book) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("books")
    .select("id,title,author")
    .ilike("title", book.title)
    .ilike("author", book.author)
    .maybeSingle();
  if (error || !data?.id) return null;
  return data as DbBookRef;
}

function countBy<T extends string>(items: Array<Record<T, string | null | undefined>>, key: T) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = item[key];
    if (value) counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function usefulnessCounts(rows: Array<{ target_id: string; reaction_type: string }>) {
  return rows.reduce<Record<string, UsefulnessReaction[]>>((counts, row) => {
    const label = reactionLabelByDb[row.reaction_type];
    if (!label) return counts;
    const existing = counts[row.target_id] || [];
    const reaction = existing.find((item) => item.type === label);
    if (reaction) reaction.count += 1;
    else existing.push({ type: label, count: 1 });
    counts[row.target_id] = existing;
    return counts;
  }, {});
}

function awardCounts(rows: Array<{ discussion_post_id: string; award_type: AwardType }>) {
  return rows.reduce<Record<string, Array<{ type: AwardType; count: number }>>>((counts, row) => {
    const existing = counts[row.discussion_post_id] || [];
    const award = existing.find((item) => item.type === row.award_type);
    if (award) award.count += 1;
    else existing.push({ type: row.award_type, count: 1 });
    counts[row.discussion_post_id] = existing;
    return counts;
  }, {});
}

const contributionSelect = "id,book_id,user_id,post_type,perspective_type,title,body,quote_reference,chapter_id,concept_id,connected_book_id,context_type,action_taken,outcome,what_failed,would_change,status,created_at,updated_at";

export function contributionDestinationUrl(post: DiscussionPost) {
  return `/book/${post.bookId}#${post.id}`;
}

export async function hydrateContributions(rows: DbContribution[], dbBooksById: Record<string, DbBookRef> = {}) {
  if (!supabase || rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const [
    likesResult,
    commentsResult,
    engagementResult,
    usefulnessResult,
    awardsResult,
    profilesResult
  ] = await Promise.all([
    supabase.from("likes").select("target_id").eq("target_type", "discussion_post").in("target_id", ids),
    supabase.from("discussion_comments").select("discussion_post_id").in("discussion_post_id", ids),
    supabase.from("discussion_engagement_counts").select("discussion_post_id,saves_count,follows_count").in("discussion_post_id", ids),
    supabase.from("useful_reactions").select("target_id,reaction_type").eq("target_type", "discussion_post").in("target_id", ids),
    supabase.from("post_awards").select("discussion_post_id,award_type").in("discussion_post_id", ids),
    supabase.from("profiles").select("id,name,username").in("id", userIds)
  ]);

  const likes = countBy(likesResult.data || [], "target_id");
  const comments = countBy(commentsResult.data || [], "discussion_post_id");
  const engagement = Object.fromEntries((engagementResult.data || []).map((row) => [row.discussion_post_id, row]));
  const usefulness = usefulnessCounts(usefulnessResult.data || []);
  const awards = awardCounts((awardsResult.data || []) as Array<{ discussion_post_id: string; award_type: AwardType }>);
  const profilesById = Object.fromEntries(((profilesResult.data || []) as DbProfileRef[]).map((profile) => [profile.id, profile]));

  return rows.map((row): DiscussionPost => {
    const localBook = localBookForDbBook(dbBooksById[row.book_id]) || getBook(row.book_id);
    const profile = profilesById[row.user_id];
    return {
      id: row.id,
      bookId: localBook?.id || row.book_id,
      userId: row.user_id,
      postType: row.post_type || postTypeByPerspectiveType[row.perspective_type || ""] || "Insight",
      perspectiveType: row.perspective_type || perspectiveTypeByPostType[row.post_type] || undefined,
      title: row.title,
      body: row.body,
      quoteReference: row.quote_reference || undefined,
      chapterId: row.chapter_id || undefined,
      conceptId: row.concept_id || undefined,
      connectedBookId: row.connected_book_id || undefined,
      contextType: row.context_type || undefined,
      actionTaken: row.action_taken || undefined,
      outcome: row.outcome || undefined,
      whatFailed: row.what_failed || undefined,
      wouldChange: row.would_change || undefined,
      status: row.status || "published",
      createdAt: row.created_at,
      updatedAt: row.updated_at || undefined,
      authorName: profile?.name,
      authorUsername: profile?.username,
      likes: likes[row.id] || 0,
      comments: comments[row.id] || 0,
      saves: Number(engagement[row.id]?.saves_count || 0),
      follows: Number(engagement[row.id]?.follows_count || 0),
      awards: awards[row.id] || [],
      usefulness: usefulness[row.id] || []
    };
  });
}

export async function getSupabaseContributionsForBook(book: Book) {
  if (!supabase) return [] as DiscussionPost[];
  const dbBook = await resolveDbBook(book);
  if (!dbBook) return [];
  const { data, error } = await supabase
    .from("discussion_posts")
    .select(contributionSelect)
    .eq("book_id", dbBook.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return hydrateContributions(data as DbContribution[], { [dbBook.id]: dbBook });
}

export async function getSupabaseFeedContributions(limit = 20) {
  if (!supabase) return [] as DiscussionPost[];
  const { data, error } = await supabase
    .from("discussion_posts")
    .select(contributionSelect)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];
  const bookIds = [...new Set((data as DbContribution[]).map((row) => row.book_id))];
  const { data: dbBooks } = await supabase.from("books").select("id,title,author").in("id", bookIds);
  const dbBooksById = Object.fromEntries(((dbBooks || []) as DbBookRef[]).map((book) => [book.id, book]));
  return hydrateContributions(data as DbContribution[], dbBooksById);
}

export async function createSupabaseContribution(input: {
  profileId: string;
  book: Book;
  postType: PostType;
  title: string;
  body: string;
  chapterId?: string;
  conceptId?: string;
  quoteReference?: string;
  connectedBookId?: string;
  contextType?: string;
  actionTaken?: string;
  outcome?: string;
  whatFailed?: string;
  wouldChange?: string;
}) {
  if (!supabase) return { post: null, error: "Supabase is not configured." };
  const dbBook = await resolveDbBook(input.book);
  if (!dbBook) return { post: null, error: "This book is not connected to the production database yet." };

  const { data, error } = await supabase
    .from("discussion_posts")
    .insert({
      user_id: input.profileId,
      book_id: dbBook.id,
      post_type: input.postType,
      perspective_type: perspectiveTypeByPostType[input.postType],
      title: input.title,
      body: input.body,
      chapter_id: input.chapterId || null,
      concept_id: input.conceptId || null,
      quote_reference: input.quoteReference || null,
      connected_book_id: input.connectedBookId || null,
      context_type: input.contextType || null,
      action_taken: input.actionTaken || null,
      outcome: input.outcome || null,
      what_failed: input.whatFailed || null,
      would_change: input.wouldChange || null,
      status: "published"
    })
    .select(contributionSelect)
    .single();

  if (error || !data) return { post: null, error: "We could not publish your perspective. Your draft has been preserved." };
  const [post] = await hydrateContributions([data as DbContribution], { [dbBook.id]: dbBook });
  return { post, error: null };
}

export async function getSupabaseContributionById(id: string) {
  if (!supabase) return { post: null, error: "Community results could not be loaded right now." };
  const { data, error } = await supabase
    .from("discussion_posts")
    .select(contributionSelect)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return { post: null, error: "Community results could not be loaded right now." };
  const bookIds = [(data as DbContribution).book_id];
  const { data: dbBooks } = await supabase.from("books").select("id,title,author").in("id", bookIds);
  const dbBooksById = Object.fromEntries(((dbBooks || []) as DbBookRef[]).map((book) => [book.id, book]));
  const [post] = await hydrateContributions([data as DbContribution], dbBooksById);
  return { post: post || null, error: null };
}

export async function getSupabaseContributionsByIds(ids: string[]) {
  if (!supabase || ids.length === 0) return [] as DiscussionPost[];
  const { data, error } = await supabase
    .from("discussion_posts")
    .select(contributionSelect)
    .eq("status", "published")
    .in("id", ids);
  if (error || !data?.length) return [];
  const bookIds = [...new Set((data as DbContribution[]).map((row) => row.book_id))];
  const { data: dbBooks } = await supabase.from("books").select("id,title,author").in("id", bookIds);
  const dbBooksById = Object.fromEntries(((dbBooks || []) as DbBookRef[]).map((book) => [book.id, book]));
  const hydrated = await hydrateContributions(data as DbContribution[], dbBooksById);
  return ids.map((id) => hydrated.find((post) => post.id === id)).filter((post): post is DiscussionPost => Boolean(post));
}

export async function updateSupabaseContribution(profileId: string, id: string, input: {
  postType: PostType;
  title: string;
  body: string;
  chapterId?: string;
  conceptId?: string;
  quoteReference?: string;
  connectedBookId?: string;
  contextType?: string;
  actionTaken?: string;
  outcome?: string;
  whatFailed?: string;
  wouldChange?: string;
}) {
  if (!supabase) return { post: null, error: "Community publishing is temporarily unavailable." };
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 8 || body.length < 80) {
    return { post: null, error: "Give this contribution a specific title and at least 80 characters of useful context." };
  }
  const { data, error } = await supabase
    .from("discussion_posts")
    .update({
      post_type: input.postType,
      perspective_type: perspectiveTypeByPostType[input.postType],
      title,
      body,
      chapter_id: input.chapterId || null,
      concept_id: input.conceptId || null,
      quote_reference: input.quoteReference || null,
      connected_book_id: input.connectedBookId || null,
      context_type: input.contextType || null,
      action_taken: input.actionTaken || null,
      outcome: input.outcome || null,
      what_failed: input.whatFailed || null,
      would_change: input.wouldChange || null
    })
    .eq("id", id)
    .eq("user_id", profileId)
    .select(contributionSelect)
    .maybeSingle();

  if (error) return { post: null, error: "We could not save your changes. Your edited text is still here." };
  if (!data) return { post: null, error: "You do not have permission to change this contribution." };
  const bookIds = [(data as DbContribution).book_id];
  const { data: dbBooks } = await supabase.from("books").select("id,title,author").in("id", bookIds);
  const dbBooksById = Object.fromEntries(((dbBooks || []) as DbBookRef[]).map((book) => [book.id, book]));
  const [post] = await hydrateContributions([data as DbContribution], dbBooksById);
  return { post: post || null, error: null };
}

export async function deleteSupabaseContribution(profileId: string, id: string) {
  if (!supabase) return { error: "Community publishing is temporarily unavailable." };
  const { data, error } = await supabase
    .from("discussion_posts")
    .update({ status: "removed" })
    .eq("id", id)
    .eq("user_id", profileId)
    .select("id")
    .maybeSingle();
  if (error) return { error: "We could not delete this contribution. Please try again." };
  if (!data) return { error: "You do not have permission to change this contribution." };
  return { error: null };
}

export async function getUserContributionState(profileId: string, targetId: string) {
  if (!supabase) return { liked: false, saved: false, following: false };
  const [likeResult, saveResult, followResult] = await Promise.all([
    supabase.from("likes").select("id").eq("user_id", profileId).eq("target_type", "discussion_post").eq("target_id", targetId).maybeSingle(),
    supabase.from("saved_insights").select("id").eq("user_id", profileId).eq("discussion_post_id", targetId).maybeSingle(),
    supabase.from("followed_discussions").select("id").eq("user_id", profileId).eq("discussion_post_id", targetId).maybeSingle()
  ]);
  return {
    liked: Boolean(likeResult.data?.id),
    saved: Boolean(saveResult.data?.id),
    following: Boolean(followResult.data?.id)
  };
}

async function toggleUniqueRow({
  table,
  adding,
  insert,
  match
}: {
  table: "likes" | "saved_insights" | "followed_discussions";
  adding: boolean;
  insert: Record<string, string>;
  match: Record<string, string>;
}) {
  if (!supabase) return { error: "Supabase is not configured." };
  if (adding) {
    const onConflict = table === "likes" ? "user_id,target_type,target_id" : "user_id,discussion_post_id";
    const { error } = await supabase.from(table).upsert(insert, { onConflict });
    return { error: error?.message || null };
  }
  let query = supabase.from(table).delete();
  Object.entries(match).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  const { error } = await query;
  return { error: error?.message || null };
}

export async function toggleSupabaseLike(profileId: string, targetId: string, adding: boolean) {
  return toggleUniqueRow({
    table: "likes",
    adding,
    insert: { user_id: profileId, target_type: "discussion_post", target_id: targetId },
    match: { user_id: profileId, target_type: "discussion_post", target_id: targetId }
  });
}

export async function toggleSupabaseSaveInsight(profileId: string, targetId: string, adding: boolean) {
  return toggleUniqueRow({
    table: "saved_insights",
    adding,
    insert: { user_id: profileId, discussion_post_id: targetId },
    match: { user_id: profileId, discussion_post_id: targetId }
  });
}

export async function toggleSupabaseFollowDiscussion(profileId: string, targetId: string, adding: boolean) {
  return toggleUniqueRow({
    table: "followed_discussions",
    adding,
    insert: { user_id: profileId, discussion_post_id: targetId },
    match: { user_id: profileId, discussion_post_id: targetId }
  });
}

export type ContributionComment = {
  id: string;
  userId: string;
  name: string;
  body: string;
  likes: number;
  createdAt: string;
  canDelete?: boolean;
  viewerLiked?: boolean;
};

export async function getSupabaseComments(postId: string, viewerProfileId?: string) {
  if (!supabase) return [] as ContributionComment[];
  const { data, error } = await supabase
    .from("discussion_comments")
    .select("id,user_id,body,created_at,profiles(name)")
    .eq("discussion_post_id", postId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  const commentIds = data.map((row) => row.id as string);
  const { data: likeRows } = commentIds.length
    ? await supabase.from("likes").select("target_id,user_id").eq("target_type", "discussion_comment").in("target_id", commentIds)
    : { data: [] as Array<{ target_id: string; user_id: string }> };
  const likeCounts = countBy((likeRows || []) as Array<{ target_id: string }>, "target_id");
  return data.map((row): ContributionComment => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      name: profile?.name || "Reader",
      body: row.body as string,
      likes: likeCounts[row.id as string] || 0,
      createdAt: row.created_at as string,
      canDelete: viewerProfileId === row.user_id,
      viewerLiked: Boolean(viewerProfileId && (likeRows || []).some((like) => like.target_id === row.id && like.user_id === viewerProfileId))
    };
  });
}

export async function createSupabaseComment(profileId: string, postId: string, body: string) {
  if (!supabase) return { comment: null, error: "Supabase is not configured." };
  const { data, error } = await supabase
    .from("discussion_comments")
    .insert({ user_id: profileId, discussion_post_id: postId, body })
    .select("id,user_id,body,created_at,profiles(name)")
    .single();
  if (error || !data) return { comment: null, error: "We could not post your comment. Your text is still here." };
  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  return {
    comment: {
      id: data.id as string,
      userId: data.user_id as string,
      name: profile?.name || "You",
      body: data.body as string,
      likes: 0,
      createdAt: data.created_at as string,
      canDelete: true
    } satisfies ContributionComment,
    error: null
  };
}

export async function deleteSupabaseComment(profileId: string, commentId: string) {
  if (!supabase) return { error: "Supabase is not configured." };
  const { error } = await supabase.from("discussion_comments").delete().eq("id", commentId).eq("user_id", profileId);
  return { error: error ? "We could not delete that comment. Please try again." : null };
}
