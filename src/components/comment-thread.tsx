"use client";

import { useEffect, useMemo, useState } from "react";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";
import {
  ContributionComment,
  CommentTargetType,
  createSupabaseComment,
  deleteSupabaseComment,
  getSupabaseComments,
  updateSupabaseComment
} from "@/lib/contributions";
import { hasLocalItem, toggleLocalItem } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import { LoginRequiredNotice } from "./login-required-notice";

type ThreadRow = { comment: ContributionComment; depth: number };

// Kept for the offline preview, which has no database to read. These are NOT content: their
// ids are `<postId>-1`, which is not a uuid, so replying to one sends parent_comment_id
// `<postId>-1` into a uuid column and the insert fails with 22P02 every time. They are a
// prototype placeholder from before there was a database.
function starterComments(postId: string): ContributionComment[] {
  return [
    { id: `${postId}-1`, userId: "team", name: "BookSphere Team", body: "What is the smallest real-life example that would prove this idea useful?", likes: 12, createdAt: "2026-06-25" },
    { id: `${postId}-2`, userId: "starter", parentId: `${postId}-1`, name: "Community Starter", body: "A specific scene, decision, or habit is more useful than agreement alone.", likes: 8, createdAt: "2026-06-26" }
  ];
}

function sortComments(comments: ContributionComment[], sort: "top" | "new") {
  return [...comments].sort((a, b) => sort === "top"
    ? b.likes - a.likes || +new Date(a.createdAt) - +new Date(b.createdAt)
    : +new Date(b.createdAt) - +new Date(a.createdAt));
}

function flattenThread(comments: ContributionComment[], sort: "top" | "new") {
  const ids = new Set(comments.map((comment) => comment.id));
  const children = new Map<string, ContributionComment[]>();
  const roots: ContributionComment[] = [];

  comments.forEach((comment) => {
    if (!comment.parentId || !ids.has(comment.parentId)) {
      roots.push(comment);
      return;
    }
    children.set(comment.parentId, [...(children.get(comment.parentId) || []), comment]);
  });

  const rows: ThreadRow[] = [];
  const walk = (comment: ContributionComment, depth: number) => {
    rows.push({ comment, depth });
    sortComments(children.get(comment.id) || [], "new").reverse().forEach((reply) => walk(reply, depth + 1));
  };
  sortComments(roots, sort).forEach((comment) => walk(comment, 0));
  return rows;
}

export function CommentThread({
  postId,
  targetType = "discussion_post",
  mode = "comments",
  onCountChange
}: {
  postId: string;
  targetType?: CommentTargetType;
  mode?: "comments" | "answers";
  onCountChange?: (change: number) => void;
}) {
  const [sort, setSort] = useState<"top" | "new">("top");
  const [body, setBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  // These were the INITIAL state in every mode, including production. Measured on a direct
  // load of a perspective permalink, signed out: the thread showed "BookSphere Team · 12"
  // and "Community Starter · 8" - two comments that do not exist in the database, with like
  // counts that correspond to nothing - for more than twenty seconds before the real (empty)
  // result replaced them, while the card directly above read 0 comments. That is fabricated
  // engagement on the product's core artifact, a contradiction on one screen, and it is what
  // anyone opening a shared link sees for most of their visit. A thread that has not loaded
  // yet should say so.
  const fallbackComments = useMemo(
    () => !supabase && targetType === "discussion_post" ? starterComments(postId) : [],
    [postId, targetType]
  );
  const [comments, setComments] = useState<ContributionComment[]>(fallbackComments);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (supabase) {
        setLoading(true);
        const auth = await requireProfile();
        const remote = await getSupabaseComments(postId, auth.ok ? auth.profileId : undefined, targetType);
        if (!cancelled) {
          setComments(remote);
          setLoading(false);
        }
        return;
      }
      if (!canUseLocalCommunityFallback()) {
        setComments([]);
        return;
      }
      queueMicrotask(() => {
        try {
          const stored = JSON.parse(window.localStorage.getItem(`booksphere.comments.${targetType}.${postId}`) || "[]") as ContributionComment[];
          setComments([...stored, ...fallbackComments]);
        } catch {
          setComments(fallbackComments);
        }
      });
    }
    void refresh();
    return () => { cancelled = true; };
  }, [fallbackComments, postId, targetType]);

  const threadRows = useMemo(() => flattenThread(comments, sort), [comments, sort]);

  function persistLocal(next: ContributionComment[]) {
    const owned = next.filter((comment) => comment.canEdit || comment.canDelete);
    window.localStorage.setItem(`booksphere.comments.${targetType}.${postId}`, JSON.stringify(owned));
  }

  async function submitComment(text: string, parentId?: string) {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return false;
    }
    if (text.trim().length < 3) {
      setError("Write at least three characters.");
      return false;
    }
    setError("");
    const optimistic: ContributionComment = {
      id: crypto.randomUUID(),
      userId: auth.profileId,
      parentId,
      name: "You",
      body: text.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
      canEdit: true,
      canDelete: true
    };
    setComments((current) => [optimistic, ...current]);

    if (supabase) {
      const result = await createSupabaseComment(auth.profileId, postId, text.trim(), parentId, targetType);
      if (result.error || !result.comment) {
        setComments((current) => current.filter((comment) => comment.id !== optimistic.id));
        setError(result.error || "We could not save your reply. Your text is still here.");
        return false;
      }
      setComments((current) => [result.comment!, ...current.filter((comment) => comment.id !== optimistic.id)]);
    } else if (canUseLocalCommunityFallback()) {
      setComments((current) => {
        persistLocal(current);
        return current;
      });
    } else {
      setComments((current) => current.filter((comment) => comment.id !== optimistic.id));
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return false;
    }
    trackEvent(parentId ? "comment_replied" : "contribution_commented", { postId, parentId });
    onCountChange?.(1);
    return true;
  }

  async function submitTopLevel() {
    if (await submitComment(body)) setBody("");
  }

  async function submitReply(parentId: string) {
    if (await submitComment(replyBody, parentId)) {
      setReplyBody("");
      setReplyingTo(null);
    }
  }

  async function saveEdit(commentId: string) {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    if (editBody.trim().length < 3) {
      setError("Write at least three characters.");
      return;
    }
    const previous = comments;
    const updatedAt = new Date().toISOString();
    const next = comments.map((comment) => comment.id === commentId ? { ...comment, body: editBody.trim(), updatedAt } : comment);
    setComments(next);

    if (supabase) {
      const result = await updateSupabaseComment(auth.profileId, commentId, editBody.trim());
      if (result.error || !result.comment) {
        setComments(previous);
        setError(result.error || "We could not save your edit. Please try again.");
        return;
      }
    } else if (canUseLocalCommunityFallback()) {
      persistLocal(next);
    } else {
      setComments(previous);
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    setEditingId(null);
    setEditBody("");
  }

  async function deleteComment(commentId: string) {
    if (!window.confirm("Delete this reply? This cannot be undone.")) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const previous = comments;
    const next = comments
      .filter((comment) => comment.id !== commentId)
      .map((comment) => comment.parentId === commentId ? { ...comment, parentId: undefined } : comment);
    setComments(next);
    if (supabase) {
      const result = await deleteSupabaseComment(auth.profileId, commentId);
      if (result.error) {
        setComments(previous);
        setError(result.error);
        return;
      }
    } else if (canUseLocalCommunityFallback()) {
      persistLocal(next);
    } else {
      setComments(previous);
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    onCountChange?.(-1);
  }

  async function toggleCommentLike(commentId: string) {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const alreadyLiked = likedCommentIds.includes(commentId);
    setLikedCommentIds((current) => alreadyLiked ? current.filter((id) => id !== commentId) : [...current, commentId]);
    // The effect below rebuilds likedCommentIds from comment.viewerLiked every time
    // `comments` changes, and posting, editing or deleting any comment changes it. Without
    // writing the new value onto the row, a like made in this session was silently undone -
    // the heart emptied and the count dropped back - while the row stayed in the database.
    markCommentLiked(commentId, !alreadyLiked);
    if (supabase) {
      const result = alreadyLiked
        ? await supabase.from("likes").delete().eq("user_id", auth.profileId).eq("target_type", "discussion_comment").eq("target_id", commentId)
        : await supabase.from("likes").upsert({ user_id: auth.profileId, target_type: "discussion_comment", target_id: commentId }, { onConflict: "user_id,target_type,target_id" });
      if (result.error) {
        setLikedCommentIds((current) => alreadyLiked ? [...current, commentId] : current.filter((id) => id !== commentId));
        markCommentLiked(commentId, alreadyLiked);
        setError("We could not save your like. Please try again.");
      }
      return;
    }
    if (!canUseLocalCommunityFallback()) {
      setLikedCommentIds((current) => alreadyLiked ? [...current, commentId] : current.filter((id) => id !== commentId));
      markCommentLiked(commentId, alreadyLiked);
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    const liked = toggleLocalItem("booksphere.likedComments", commentId);
    setLikedCommentIds((current) => liked ? [...current, commentId] : current.filter((id) => id !== commentId));
    markCommentLiked(commentId, liked);
  }

  function markCommentLiked(commentId: string, liked: boolean) {
    setComments((current) => current.map((comment) => {
      if (comment.id !== commentId || Boolean(comment.viewerLiked) === liked) return comment;
      return { ...comment, viewerLiked: liked, likes: Math.max(0, comment.likes + (liked ? 1 : -1)) };
    }));
  }

  useEffect(() => {
    queueMicrotask(() => {
      setLikedCommentIds(comments.filter((comment) => supabase ? comment.viewerLiked : canUseLocalCommunityFallback() && hasLocalItem("booksphere.likedComments", comment.id)).map((comment) => comment.id));
    });
  }, [comments]);

  function visibleLikeCount(comment: ContributionComment) {
    const selected = likedCommentIds.includes(comment.id);
    if (selected === Boolean(comment.viewerLiked)) return comment.likes;
    return Math.max(0, comment.likes + (selected ? 1 : -1));
  }

  return (
    <section id="comments" className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="caption">{mode === "answers" ? "Answers" : "Replies"}</h3>
        {/* The Top / New pair only exists once there is more than one thing to order. */}
        {comments.length > 1 && (
          <div className="control-row">
            <button type="button" aria-pressed={sort === "top"} onClick={() => setSort("top")} className="control">Top</button>
            <button type="button" aria-pressed={sort === "new"} onClick={() => setSort("new")} className="control">New</button>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 border-t border-[color:var(--rule-strong)] pt-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          maxLength={4000}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={mode === "answers" ? "Write a clear answer" : "Add something specific"}
          aria-label={mode === "answers" ? "Write an answer" : "Write a reply"}
          className="field"
        />
        <button type="button" disabled={body.trim().length < 3} onClick={submitTopLevel} className="btn-ink btn-sm">
          {mode === "answers" ? "Answer" : "Reply"}
        </button>
      </div>
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="footnote mt-4 border-l-2 border-[color:var(--color-rose)] pl-4 text-[color:var(--color-rose)]">{error}</p>}

      <div className="mt-5">
        {loading && <p className="footnote">Loading replies</p>}
        {!loading && comments.length === 0 && (
          <p className="body-copy measure">
            {mode === "answers"
              ? "No answers yet. An explanation, an example or a source would be the first."
              : "No replies yet. Say what you would add, or where you think this is wrong."}
          </p>
        )}
        {threadRows.map(({ comment, depth }) => (
          <article
            key={comment.id}
            className={`border-t border-[color:var(--rule)] py-4 ${depth ? "border-l border-l-[color:var(--rule-strong)] pl-5" : ""}`}
            style={{ marginLeft: `${Math.min(depth, 3) * 20}px` }}
          >
            {/* A person's name keeps its own capitals. Tracked caps are for labels, and a
                name is not a label. */}
            <p className="footnote text-[color:var(--ink)]">
              {comment.name}
              {comment.updatedAt && comment.updatedAt !== comment.createdAt ? " \u00b7 Edited" : ""}
            </p>

            {editingId === comment.id ? (
              <div className="mt-3 grid gap-3">
                <textarea maxLength={4000} rows={3} value={editBody} onChange={(event) => setEditBody(event.target.value)} aria-label="Edit reply" className="field" />
                <div className="control-row">
                  <button type="button" disabled={editBody.trim().length < 3} onClick={() => saveEdit(comment.id)} className="btn-ink btn-sm">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="control">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="body-copy measure mt-2 text-[color:var(--ink)]">{comment.body}</p>
            )}

            <div className="control-row mt-1">
              <button
                type="button"
                onClick={() => toggleCommentLike(comment.id)}
                aria-label="Like this reply"
                aria-pressed={likedCommentIds.includes(comment.id)}
                className="control"
              >
                {likedCommentIds.includes(comment.id) ? "Liked" : "Like"}
                {visibleLikeCount(comment) > 0 ? <span className="numeral">{visibleLikeCount(comment)}</span> : null}
              </button>
              <button
                type="button"
                onClick={() => { setReplyingTo((current) => current === comment.id ? null : comment.id); setReplyBody(""); setEditingId(null); }}
                className="control"
                aria-expanded={replyingTo === comment.id}
              >
                Reply
              </button>
              {comment.canEdit && (
                <button type="button" onClick={() => { setEditingId(comment.id); setEditBody(comment.body); setReplyingTo(null); }} className="control" aria-label="Edit your reply">Edit</button>
              )}
              {comment.canDelete && (
                <button type="button" onClick={() => deleteComment(comment.id)} className="control text-[color:var(--color-rose)] hover:!text-[color:var(--color-rose)]" aria-label="Delete your reply">Delete</button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  autoFocus
                  maxLength={4000}
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  placeholder={`Reply to ${comment.name}`}
                  aria-label={`Reply to ${comment.name}`}
                  className="field"
                />
                <button type="button" disabled={replyBody.trim().length < 3} onClick={() => submitReply(comment.id)} className="btn-ink btn-sm">Reply</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
