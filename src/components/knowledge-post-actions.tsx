"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Pencil, Share2, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";
import {
  deleteSupabaseKnowledgePost,
  getKnowledgePostViewerState,
  knowledgePostTitleFromBody,
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
    if (cleanBody.length < 20) {
      setError("Add enough context for another person to understand the thought.");
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
    <div className="mt-8 border-t border-[color:var(--color-hairline)] pt-5">
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <button type="button" onClick={toggleLike} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black/[0.035] px-3 transition hover:bg-black/[0.06]" aria-pressed={liked}>
          <Heart size={16} className={liked ? "fill-[color:var(--color-rose)] text-[color:var(--color-rose)]" : ""} />
          {visibleLikes}
        </button>
        <button type="button" onClick={openComments} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black/[0.035] px-3 transition hover:bg-black/[0.06]">
          <MessageCircle size={16} /> {post.comments}
        </button>
        <button type="button" onClick={sharePost} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black/[0.035] px-3 transition hover:bg-black/[0.06]">
          <Share2 size={16} /> {copied ? "Copied" : "Share"}
        </button>
        {isOwner && (
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={() => setEditing((value) => !value)} className="grid size-10 place-items-center rounded-full transition hover:bg-black/[0.05]" aria-label="Edit your post"><Pencil size={16} /></button>
            <button type="button" disabled={saving} onClick={deletePost} className="grid size-10 place-items-center rounded-full text-[color:var(--color-rose)] transition hover:bg-[color:var(--color-rose)]/10" aria-label="Delete your post"><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-4 grid gap-3 rounded-[20px] bg-black/[0.025] p-4">
          <label className="text-sm font-medium">Edit post<textarea value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} maxLength={2000} rows={6} className="mt-2 w-full rounded-[16px] bg-white px-4 py-3 text-base leading-7 outline-none ring-1 ring-black/5 focus:ring-black/20" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} maxLength={80} placeholder="Topic (optional)" className="min-h-11 rounded-[14px] bg-white px-4 text-sm outline-none ring-1 ring-black/5 focus:ring-black/20" />
            <input value={draft.referenceTitle} onChange={(event) => setDraft({ ...draft, referenceTitle: event.target.value })} maxLength={200} placeholder="Book or source (optional)" className="min-h-11 rounded-[14px] bg-white px-4 text-sm outline-none ring-1 ring-black/5 focus:ring-black/20" />
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={saving} onClick={saveEdit} className="min-h-10 rounded-full bg-[color:var(--color-text-primary)] px-5 text-sm font-semibold !text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            <button type="button" onClick={() => setEditing(false)} className="min-h-10 rounded-full bg-white px-5 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="mt-3 rounded-[14px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
    </div>
  );
}
