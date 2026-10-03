"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";
import {
  deleteSupabaseKnowledgePost,
  getKnowledgePostViewerState,
  knowledgePostTitleFromBody,
  MIN_KNOWLEDGE_POST_LENGTH,
  toggleSupabaseKnowledgePostLike,
  updateSupabaseKnowledgePost
} from "@/lib/knowledge-posts";
import { hasLocalItem, toggleLocalItem } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import type { KnowledgePost } from "@/lib/types";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { LoginRequiredNotice } from "./login-required-notice";

function updateStoredPost(post: KnowledgePost | null, postId: string) {
  let stored: KnowledgePost[] = [];
  try {
    stored = JSON.parse(window.localStorage.getItem(LOCAL_KNOWLEDGE_POSTS_KEY) || "[]") as KnowledgePost[];
  } catch {
    stored = [];
  }
  const next = post ? [post, ...stored.filter((item) => item.id !== postId)] : stored.filter((item) => item.id !== postId);
  window.localStorage.setItem(LOCAL_KNOWLEDGE_POSTS_KEY, JSON.stringify(next));
}

export function KnowledgePostActions({ post, onUpdated, onDeleted }: {
  post: KnowledgePost;
  onUpdated: (post: KnowledgePost) => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [liked, setLiked] = useState(false);
  const [persistedLiked, setPersistedLiked] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ body: post.body, topic: post.topic, referenceTitle: post.referenceTitle || "" });

  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      const auth = await requireProfile();
      if (!auth.ok || cancelled) return;
      setIsOwner(auth.profileId === post.userId);
      if (supabase) {
        const state = await getKnowledgePostViewerState(auth.profileId, post.id);
        if (!cancelled) {
          setLiked(state.liked);
          setPersistedLiked(state.liked);
        }
      } else if (canUseLocalCommunityFallback()) {
        const localLiked = hasLocalItem("booksphere.likedKnowledgePosts", post.id);
        setLiked(localLiked);
        setPersistedLiked(localLiked);
      }
    }
    void loadState();
    return () => { cancelled = true; };
  }, [post.id, post.userId]);

  async function toggleLike() {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const previous = liked;
    const next = !previous;
    setLiked(next);
    setError("");
    if (supabase) {
      const result = await toggleSupabaseKnowledgePostLike(auth.profileId, post.id, next);
      if (result.error) {
        setLiked(previous);
        setError(result.error);
      }
      return;
    }
    if (canUseLocalCommunityFallback()) {
      setLiked(toggleLocalItem("booksphere.likedKnowledgePosts", post.id));
      return;
    }
    setLiked(previous);
    setError(COMMUNITY_UNAVAILABLE_MESSAGE);
  }

  async function saveEdit() {
    const cleanBody = draft.body.trim();
    // The composer and the database both accept 4 characters (20260715061000). Demanding 20
    // here made every feed post between those bounds permanently uneditable - the same bug
    // that was fixed for discussion posts in 9fdb42b and missed on this path.
    if (cleanBody.length < MIN_KNOWLEDGE_POST_LENGTH) {
      setError(`Write at least ${MIN_KNOWLEDGE_POST_LENGTH} characters.`);
      return;
    }
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    if (auth.profileId !== post.userId) {
      setError("Only the author can edit this post.");
      return;
    }
    setSaving(true);
    setError("");
    if (supabase) {
      const result = await updateSupabaseKnowledgePost(auth.profileId, post.id, draft);
      setSaving(false);
      if (!result.post) {
        setError(result.error || "We could not save your edit.");
        return;
      }
      onUpdated(result.post);
      window.dispatchEvent(new CustomEvent("booksphere:knowledge-post-updated", { detail: result.post }));
      setEditing(false);
      return;
    }
    if (!canUseLocalCommunityFallback()) {
      setSaving(false);
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    const updated = {
      ...post,
      title: knowledgePostTitleFromBody(cleanBody),
      body: cleanBody,
      topic: draft.topic.trim() || "Reflection",
      referenceTitle: draft.referenceTitle.trim() || undefined
    };
    updateStoredPost(updated, post.id);
    onUpdated(updated);
    window.dispatchEvent(new CustomEvent("booksphere:knowledge-post-updated", { detail: updated }));
    setSaving(false);
    setEditing(false);
  }

  async function deletePost() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    if (auth.profileId !== post.userId) {
      setError("Only the author can delete this post.");
      return;
    }
    setSaving(true);
    if (supabase) {
      const result = await deleteSupabaseKnowledgePost(auth.profileId, post.id);
      if (result.error) {
        setSaving(false);
        setError(result.error);
        return;
      }
    } else if (canUseLocalCommunityFallback()) {
      updateStoredPost(null, post.id);
    } else {
      setSaving(false);
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    onDeleted();
    window.dispatchEvent(new CustomEvent("booksphere:knowledge-post-deleted", { detail: post.id }));
    router.push("/feed");
    router.refresh();
  }

  async function sharePost() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }
    } catch {
      setError("We could not open sharing here.");
    }
  }

  function openComments() {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const likeDelta = liked === persistedLiked ? 0 : liked ? 1 : -1;
  const visibleLikes = Math.max(0, post.likes + likeDelta);

  return (
    <div className="mt-8 border-t border-[color:var(--rule)] pt-4">
      <div className="control-row">
        <button type="button" onClick={openComments} className="control control-lead" aria-label={`View ${post.comments} ${post.comments === 1 ? "reply" : "replies"}`}>
          Reply{post.comments > 0 ? <span className="numeral">{post.comments}</span> : null}
        </button>
        <button type="button" onClick={toggleLike} className="control control-lead" aria-label={liked ? "Remove like from this post" : "Like this post"} aria-pressed={liked}>
          {liked ? "Liked" : "Like"}
          {visibleLikes > 0 ? <span className="numeral">{visibleLikes}</span> : null}
        </button>
        <button type="button" onClick={sharePost} className="control control-lead">
          {copied ? "Link copied" : "Share"}
        </button>
        {isOwner && (
          <>
            <button type="button" onClick={() => setEditing((value) => !value)} aria-expanded={editing} className="control" aria-label="Edit your post">Edit</button>
            <button type="button" disabled={saving} onClick={deletePost} className="control text-[color:var(--color-rose)] hover:!text-[color:var(--color-rose)]" aria-label="Delete your post">Delete</button>
          </>
        )}
      </div>

      {editing && (
        <div className="mt-5 grid gap-5 border-l-2 border-[color:var(--ink)] pl-5">
          <label className="field-label">
            <span className="caption caption-muted">Edit the note</span>
            <textarea value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} maxLength={2000} rows={8} className="field" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <input value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} maxLength={80} placeholder="Topic" aria-label="Topic" className="field" />
            <input value={draft.referenceTitle} onChange={(event) => setDraft({ ...draft, referenceTitle: event.target.value })} maxLength={200} placeholder="Book or source" aria-label="Book or source" className="field" />
          </div>
          <div className="control-row">
            <button type="button" disabled={saving} onClick={saveEdit} className="btn-ink btn-sm">{saving ? "Saving" : "Save changes"}</button>
            <button type="button" onClick={() => setEditing(false)} className="control">Cancel</button>
          </div>
        </div>
      )}
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="footnote mt-4 border-l-2 border-[color:var(--color-rose)] pl-4 text-[color:var(--color-rose)]">{error}</p>}
    </div>
  );
}
