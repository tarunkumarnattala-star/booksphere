"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Pencil, Reply, Trash2 } from "lucide-react";
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

export function CommentThread({ postId, targetType = "discussion_post", onCountChange }: { postId: string; targetType?: CommentTargetType; onCountChange?: (change: number) => void }) {
  const [sort, setSort] = useState<"top" | "new">("top");
  const [body, setBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const fallbackComments = useMemo(
    () => targetType === "discussion_post" ? starterComments(postId) : [],
    [postId, targetType]
  );
  const [comments, setComments] = useState<ContributionComment[]>(fallbackComments);
  const [loading, setLoading] = useState(false);

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
        setError(result.error || "We could not post your comment. Your text is still here.");
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
    if (supabase) {
      const result = alreadyLiked
        ? await supabase.from("likes").delete().eq("user_id", auth.profileId).eq("target_type", "discussion_comment").eq("target_id", commentId)
        : await supabase.from("likes").upsert({ user_id: auth.profileId, target_type: "discussion_comment", target_id: commentId }, { onConflict: "user_id,target_type,target_id" });
      if (result.error) {
        setLikedCommentIds((current) => alreadyLiked ? [...current, commentId] : current.filter((id) => id !== commentId));
        setError("We could not save your like. Please try again.");
      }
      return;
    }
    if (!canUseLocalCommunityFallback()) {
      setLikedCommentIds((current) => alreadyLiked ? [...current, commentId] : current.filter((id) => id !== commentId));
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    const liked = toggleLocalItem("booksphere.likedComments", commentId);
    setLikedCommentIds((current) => liked ? [...current, commentId] : current.filter((id) => id !== commentId));
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
    <section id="comments" className="scroll-mt-24 rounded-[28px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="title-3">Comments</h3>
        <div className="rounded-full bg-black/[0.035] p-1 text-xs font-medium">
          <button type="button" aria-pressed={sort === "top"} onClick={() => setSort("top")} className={`min-h-11 rounded-full px-3 py-1.5 ${sort === "top" ? "bg-[color:var(--color-text-primary)] !text-white" : "text-[color:var(--color-text-secondary)]"}`}>Top</button>
          <button type="button" aria-pressed={sort === "new"} onClick={() => setSort("new")} className={`min-h-11 rounded-full px-3 py-1.5 ${sort === "new" ? "bg-[color:var(--color-text-primary)] !text-white" : "text-[color:var(--color-text-secondary)]"}`}>New</button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input maxLength={4000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a useful response..." aria-label="Write a comment" className="min-h-11 min-w-0 flex-1 rounded-full bg-black/[0.035] px-4 py-3 text-base font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
        <button type="button" onClick={submitTopLevel} className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-4 py-3 text-sm font-medium !text-white">Post</button>
      </div>
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="mt-3 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
      <div className="mt-5 space-y-3">
        {loading && <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">Loading comments...</p>}
        {!loading && comments.length === 0 && <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">No comments yet. Add a specific response to make the thread more useful.</p>}
        {threadRows.map(({ comment, depth }) => (
          <article
            key={comment.id}
            className={`border-t border-[color:var(--color-hairline)] pt-3 ${depth ? "border-l-2 pl-3" : ""}`}
            style={{ marginLeft: `${Math.min(depth, 3) * 12}px` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{comment.name}</p>
                <p className="mt-0.5 text-[11px] text-[color:var(--color-text-muted)]">
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt ? "Edited" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" onClick={() => toggleCommentLike(comment.id)} aria-label="Like this comment" className="flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-full text-xs font-medium text-[color:var(--color-text-secondary)] hover:bg-black/[0.035]">
                  <Heart size={14} className={likedCommentIds.includes(comment.id) ? "fill-[color:var(--color-rose)] text-[color:var(--color-rose)]" : ""} />
                  {visibleLikeCount(comment)}
                </button>
                {comment.canEdit && (
                  <button type="button" onClick={() => { setEditingId(comment.id); setEditBody(comment.body); setReplyingTo(null); }} className="grid size-9 place-items-center rounded-full text-[color:var(--color-text-secondary)] hover:bg-black/[0.035]" aria-label="Edit your comment"><Pencil size={14} /></button>
                )}
                {comment.canDelete && (
                  <button type="button" onClick={() => deleteComment(comment.id)} className="grid size-9 place-items-center rounded-full text-[color:var(--color-rose)] hover:bg-[color:var(--color-rose)]/10" aria-label="Delete your comment"><Trash2 size={14} /></button>
                )}
              </div>
            </div>

            {editingId === comment.id ? (
              <div className="mt-2 grid gap-2">
                <textarea maxLength={4000} rows={3} value={editBody} onChange={(event) => setEditBody(event.target.value)} aria-label="Edit comment" className="w-full rounded-[14px] bg-black/[0.035] px-3 py-2 text-sm leading-6 outline-none ring-1 ring-transparent focus:ring-black/20" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => saveEdit(comment.id)} className="min-h-9 rounded-full bg-[color:var(--color-text-primary)] px-4 text-xs font-medium !text-white">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="min-h-9 rounded-full bg-black/[0.035] px-4 text-xs font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-secondary)]">{comment.body}</p>
            )}

            <button type="button" onClick={() => { setReplyingTo((current) => current === comment.id ? null : comment.id); setReplyBody(""); setEditingId(null); }} className="mt-1.5 inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-[color:var(--color-text-secondary)] hover:bg-black/[0.035]" aria-expanded={replyingTo === comment.id}>
              <Reply size={13} /> Reply
            </button>
            {replyingTo === comment.id && (
              <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input autoFocus maxLength={4000} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder={`Reply to ${comment.name}`} aria-label={`Reply to ${comment.name}`} className="min-h-10 min-w-0 rounded-full bg-black/[0.035] px-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
                <button type="button" onClick={() => submitReply(comment.id)} className="min-h-10 rounded-full bg-[color:var(--color-text-primary)] px-4 text-xs font-medium !text-white">Reply</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
