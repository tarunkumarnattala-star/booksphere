"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";
import { ContributionComment, createSupabaseComment, deleteSupabaseComment, getSupabaseComments } from "@/lib/contributions";
import { hasLocalItem, toggleLocalItem } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import { LoginRequiredNotice } from "./login-required-notice";

function starterComments(postId: string): ContributionComment[] {
  return [
    { id: `${postId}-1`, userId: "team", name: "BookSphere Team", body: "What is the smallest real-life example that would prove this idea useful?", likes: 12, createdAt: "2026-06-25" },
    { id: `${postId}-2`, userId: "starter", name: "Community Starter", body: "I like when replies include a specific scene, decision, or habit instead of only agreement.", likes: 8, createdAt: "2026-06-26" }
  ];
}

export function CommentThread({ postId }: { postId: string }) {
  const [sort, setSort] = useState<"top" | "new">("top");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [comments, setComments] = useState<ContributionComment[]>(starterComments(postId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (supabase) {
        setLoading(true);
        const auth = await requireProfile();
        const remote = await getSupabaseComments(postId, auth.ok ? auth.profileId : undefined);
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
          const stored = JSON.parse(window.localStorage.getItem(`booksphere.comments.${postId}`) || "[]") as ContributionComment[];
          setComments([...stored, ...starterComments(postId)]);
        } catch {
          setComments(starterComments(postId));
        }
      });
    }
    void refresh();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const sorted = useMemo(() => {
    return [...comments].sort((a, b) => (sort === "top" ? b.likes - a.likes : +new Date(b.createdAt) - +new Date(a.createdAt)));
  }, [comments, sort]);

  async function submit() {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    if (body.trim().length < 8) {
      setError("Write a specific response so the thread becomes more useful.");
      return;
    }
    setError("");
    const newComment = { id: crypto.randomUUID(), userId: auth.profileId, name: "You", body: body.trim(), likes: 0, createdAt: new Date().toISOString(), canDelete: true };
    setComments((current) => [newComment, ...current]);
    if (supabase) {
      const result = await createSupabaseComment(auth.profileId, postId, body.trim());
      if (result.error || !result.comment) {
        setComments((current) => current.filter((comment) => comment.id !== newComment.id));
        setError(result.error || "We could not post your comment. Your text is still here.");
        return;
      }
      setComments((current) => [result.comment!, ...current.filter((comment) => comment.id !== newComment.id)]);
    } else if (canUseLocalCommunityFallback()) {
      try {
        const stored = JSON.parse(window.localStorage.getItem(`booksphere.comments.${postId}`) || "[]") as ContributionComment[];
        window.localStorage.setItem(`booksphere.comments.${postId}`, JSON.stringify([newComment, ...stored]));
      } catch {
        window.localStorage.setItem(`booksphere.comments.${postId}`, JSON.stringify([newComment]));
      }
    } else {
      setComments((current) => current.filter((comment) => comment.id !== newComment.id));
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    trackEvent("contribution_commented", { postId });
    setBody("");
  }

  async function deleteComment(commentId: string) {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const previous = comments;
    setComments((current) => current.filter((comment) => comment.id !== commentId));
    if (supabase) {
      const result = await deleteSupabaseComment(auth.profileId, commentId);
      if (result.error) {
        setComments(previous);
        setError(result.error);
      }
    } else if (canUseLocalCommunityFallback()) {
      const stored = previous.filter((comment) => comment.id !== commentId && comment.canDelete);
      window.localStorage.setItem(`booksphere.comments.${postId}`, JSON.stringify(stored));
    } else {
      setComments(previous);
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
    }
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
        : await supabase.from("likes").upsert({
            user_id: auth.profileId,
            target_type: "discussion_comment",
            target_id: commentId
          }, { onConflict: "user_id,target_type,target_id" });
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
    <section id="comments" className="scroll-mt-24 rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="title-3">Comments</h3>
        <div className="rounded-full bg-black/[0.035] p-1 text-xs font-medium">
          <button type="button" aria-pressed={sort === "top"} onClick={() => setSort("top")} className={`min-h-11 rounded-full px-3 py-1.5 ${sort === "top" ? "bg-[color:var(--color-text-primary)] !text-white" : "text-[color:var(--color-text-secondary)]"}`}>Top</button>
          <button type="button" aria-pressed={sort === "new"} onClick={() => setSort("new")} className={`min-h-11 rounded-full px-3 py-1.5 ${sort === "new" ? "bg-[color:var(--color-text-primary)] !text-white" : "text-[color:var(--color-text-secondary)]"}`}>New</button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          maxLength={4000}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a specific, useful response..."
          aria-label="Write a comment"
          className="min-h-11 min-w-0 flex-1 rounded-full bg-black/[0.035] px-4 py-3 text-base font-medium outline-none ring-1 ring-transparent focus:ring-black/20"
        />
        <button type="button" onClick={submit} className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-4 py-3 text-sm font-medium !text-white">Post</button>
      </div>
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="mt-3 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
      <div className="mt-5 space-y-4">
        {loading && <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">Loading comments...</p>}
        {!loading && comments.length === 0 && <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">No comments yet. Add a specific response to make the thread more useful.</p>}
        {sorted.map((comment) => (
          <div key={comment.id} className="border-t border-[color:var(--color-hairline)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{comment.name}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleCommentLike(comment.id)}
                  aria-label="Like this comment"
                  className="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full text-xs font-medium text-[color:var(--color-text-secondary)] hover:bg-black/[0.035]"
                >
                  <Heart size={14} className={likedCommentIds.includes(comment.id) ? "fill-[color:var(--color-rose)] text-[color:var(--color-rose)]" : ""} />
                  {visibleLikeCount(comment)}
                </button>
                {comment.canDelete && (
                  <button type="button" onClick={() => deleteComment(comment.id)} className="grid size-11 place-items-center rounded-full text-xs font-medium text-[color:var(--color-rose)] hover:bg-[color:var(--color-rose)]/10" aria-label="Delete your comment">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{comment.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
