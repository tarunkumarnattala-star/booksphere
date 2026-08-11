"use client";

import { supabase } from "./supabase";

// Replies are derived from existing tables rather than stored in a notifications
// table, so this needs no migration and no backfill: anything already written is
// visible immediately. "Seen" state is per-device in localStorage, which is the
// right trade for a badge - it never needs to survive a device change, and it
// keeps the read path a single round trip.
const LAST_SEEN_KEY = "booksphere.notifications.lastSeen";

export type ReplyNotification = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  href: string;
  context: string;
  kind: "reply_to_post" | "reply_to_comment";
};

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  discussion_post_id: string | null;
  knowledge_post_id: string | null;
  parent_comment_id: string | null;
  user_id: string;
  author: { name: string; username: string } | { name: string; username: string }[] | null;
};

function firstAuthor(author: CommentRow["author"]) {
  if (!author) return null;
  return Array.isArray(author) ? author[0] || null : author;
}

export function getLastSeenAt() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_SEEN_KEY);
}

export function markNotificationsSeen(at = new Date().toISOString()) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SEEN_KEY, at);
  window.dispatchEvent(new Event("booksphere-notifications-seen"));
}

export function countUnseen(notifications: ReplyNotification[]) {
  const lastSeen = getLastSeenAt();
  if (!lastSeen) return notifications.length;
  return notifications.filter((item) => item.createdAt > lastSeen).length;
}

export type ReplyNotificationsResult =
  | { ok: true; notifications: ReplyNotification[] }
  | { ok: false; notifications: never[] };

export async function getReplyNotifications(profileId: string, limit = 40): Promise<ReplyNotificationsResult> {
  if (!supabase) return { ok: false, notifications: [] };

  // Bounded deliberately. These ids are fed straight into .in(...) below, which PostgREST
  // receives as a query string - a prolific writer would otherwise build a URL long enough
  // to be rejected by a proxy, and the rejection used to be indistinguishable from an empty
  // inbox because no .error was ever read.
  const OWN_ROW_LIMIT = 200;
  const [myPosts, myKnowledgePosts, myComments] = await Promise.all([
    supabase.from("discussion_posts").select("id,title").eq("user_id", profileId).order("created_at", { ascending: false }).limit(OWN_ROW_LIMIT),
    supabase.from("knowledge_posts").select("id,title").eq("user_id", profileId).order("created_at", { ascending: false }).limit(OWN_ROW_LIMIT),
    supabase.from("discussion_comments").select("id").eq("user_id", profileId).order("created_at", { ascending: false }).limit(OWN_ROW_LIMIT)
  ]);

  // A failed read must not read as "nobody replied to you". The caller marks the inbox seen
  // on success, and that write is not reversible: it hides every reply that already existed
  // from the unread badge, on that device, permanently.
  if (myPosts.error || myKnowledgePosts.error || myComments.error) return { ok: false, notifications: [] };

  const postTitles = new Map<string, string>();
  (myPosts.data || []).forEach((row) => postTitles.set(row.id as string, row.title as string));
  const knowledgeTitles = new Map<string, string>();
  (myKnowledgePosts.data || []).forEach((row) => knowledgeTitles.set(row.id as string, row.title as string));

  const postIds = [...postTitles.keys()];
  const knowledgeIds = [...knowledgeTitles.keys()];
  const commentIds = (myComments.data || []).map((row) => row.id as string);

  const select = "id,body,created_at,discussion_post_id,knowledge_post_id,parent_comment_id,user_id,author:profiles(name,username)";
  const queries = [];

  if (postIds.length) {
    queries.push(supabase.from("discussion_comments").select(select).in("discussion_post_id", postIds).neq("user_id", profileId).order("created_at", { ascending: false }).limit(limit));
  }
  if (knowledgeIds.length) {
    queries.push(supabase.from("discussion_comments").select(select).in("knowledge_post_id", knowledgeIds).neq("user_id", profileId).order("created_at", { ascending: false }).limit(limit));
  }
  if (commentIds.length) {
    queries.push(supabase.from("discussion_comments").select(select).in("parent_comment_id", commentIds).neq("user_id", profileId).order("created_at", { ascending: false }).limit(limit));
  }

  if (!queries.length) return { ok: true, notifications: [] };

  const results = await Promise.all(queries);
  if (results.some((result) => result.error)) return { ok: false, notifications: [] };
  const seen = new Set<string>();
  const notifications: ReplyNotification[] = [];

  results.forEach((result) => {
    (result.data as CommentRow[] | null)?.forEach((row) => {
      if (seen.has(row.id)) return;
      seen.add(row.id);
      const author = firstAuthor(row.author);
      const isKnowledge = Boolean(row.knowledge_post_id);
      const title = row.discussion_post_id
        ? postTitles.get(row.discussion_post_id)
        : row.knowledge_post_id
          ? knowledgeTitles.get(row.knowledge_post_id)
          : undefined;
      // postTitles and knowledgeTitles only hold the reader's OWN writing, so a reply to a
      // comment they left on someone else's post had no title and fell through to "your
      // perspective" - crediting a stranger's post to the reader on their own inbox.
      const isReplyToOwnComment = Boolean(row.parent_comment_id && commentIds.includes(row.parent_comment_id));
      const fallbackContext = isReplyToOwnComment
        ? "a discussion you commented on"
        : isKnowledge ? "your feed post" : "your perspective";

      notifications.push({
        id: row.id,
        body: row.body,
        createdAt: row.created_at,
        authorName: author?.name || "A reader",
        authorUsername: author?.username || "",
        // /post/<id> is the knowledge-post route. Sending a discussion_post id there
        // renders "We could not find this knowledge note" - verified on production - so
        // every reply to a perspective, which is the product's only return path, led to a
        // dead end. A perspective lives at /discussion/<id>.
        href: row.discussion_post_id
          ? `/discussion/${row.discussion_post_id}#comments`
          : row.knowledge_post_id
            ? `/post/${row.knowledge_post_id}#comments`
            : "/feed",
        context: title || fallbackContext,
        kind: isReplyToOwnComment ? "reply_to_comment" : "reply_to_post"
      });
    });
  });

  return { ok: true, notifications: notifications.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit) };
}
