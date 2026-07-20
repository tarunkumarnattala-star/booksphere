"use client";

import { useEffect, useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";
import { getUserContributionState, toggleSupabaseLike, toggleSupabaseSaveInsight } from "@/lib/contributions";
import { getKnowledgePostViewerState, toggleSupabaseKnowledgePostLike, toggleSupabaseKnowledgePostSave } from "@/lib/knowledge-posts";
import { hasLocalItem, toggleLocalItem } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import { LoginRequiredNotice } from "./login-required-notice";

export function SearchPreviewActions({
  kind,
  targetId,
  likes,
  saves = 0
}: {
  kind: "discussion" | "knowledge";
  targetId: string;
  likes: number;
  saves?: number;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [persistedLiked, setPersistedLiked] = useState(false);
  const [persistedSaved, setPersistedSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      const auth = await requireProfile();
      if (!auth.ok || cancelled) return;
      if (!supabase && canUseLocalCommunityFallback()) {
        const likeKey = kind === "knowledge" ? "booksphere.likedKnowledgePosts" : "booksphere.likedPosts";
        const saveKey = kind === "knowledge" ? "booksphere.savedKnowledgePosts" : "booksphere.savedInsights";
        const localLiked = hasLocalItem(likeKey, targetId);
        const localSaved = hasLocalItem(saveKey, targetId);
        setLiked(localLiked);
        setSaved(localSaved);
        setPersistedLiked(localLiked);
        setPersistedSaved(localSaved);
        return;
      }
      if (!supabase) return;
      const state = kind === "knowledge"
        ? await getKnowledgePostViewerState(auth.profileId, targetId)
        : await getUserContributionState(auth.profileId, targetId);
      if (cancelled) return;
      setLiked(state.liked);
      setSaved(state.saved);
      setPersistedLiked(state.liked);
      setPersistedSaved(state.saved);
    }
    void loadState();
    return () => { cancelled = true; };
  }, [kind, targetId]);

  async function toggle(action: "like" | "save") {
    if (syncing) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const current = action === "like" ? liked : saved;
    const next = !current;
    const setter = action === "like" ? setLiked : setSaved;
    setter(next);
    setSyncing(true);
    setError("");

    if (!supabase) {
      if (!canUseLocalCommunityFallback()) {
        setter(current);
        setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      } else {
        const key = action === "like"
          ? kind === "knowledge" ? "booksphere.likedKnowledgePosts" : "booksphere.likedPosts"
          : kind === "knowledge" ? "booksphere.savedKnowledgePosts" : "booksphere.savedInsights";
        setter(toggleLocalItem(key, targetId));
      }
      setSyncing(false);
      return;
    }

    const result = action === "like"
      ? kind === "knowledge"
        ? await toggleSupabaseKnowledgePostLike(auth.profileId, targetId, next)
        : await toggleSupabaseLike(auth.profileId, targetId, next)
      : kind === "knowledge"
        ? await toggleSupabaseKnowledgePostSave(auth.profileId, targetId, next)
        : await toggleSupabaseSaveInsight(auth.profileId, targetId, next);
    if (result.error) {
      setter(current);
      setError(action === "like" ? "That like could not be saved." : "That post could not be saved.");
    }
    setSyncing(false);
  }

  const visibleLikes = Math.max(0, likes + (liked === persistedLiked ? 0 : liked ? 1 : -1));
  const visibleSaves = Math.max(0, saves + (saved === persistedSaved ? 0 : saved ? 1 : -1));

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => toggle("like")} disabled={syncing} aria-pressed={liked} aria-label={liked ? "Remove like" : "Like this post"} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/[0.035] px-3 text-xs font-medium text-[color:var(--color-text-secondary)] transition hover:bg-black/[0.065] disabled:opacity-60">
          <Heart size={15} className={liked ? "fill-[color:var(--color-rose)] text-[color:var(--color-rose)]" : ""} />
          {visibleLikes}
        </button>
        <button type="button" onClick={() => toggle("save")} disabled={syncing} aria-pressed={saved} aria-label={saved ? "Remove from saved posts" : "Save this post"} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/[0.035] px-3 text-xs font-medium text-[color:var(--color-text-secondary)] transition hover:bg-black/[0.065] disabled:opacity-60">
          <Bookmark size={15} className={saved ? "fill-current text-[color:var(--color-accent)]" : ""} />
          {saved ? "Saved" : "Save"}{kind === "discussion" && visibleSaves > 0 ? ` ${visibleSaves}` : ""}
        </button>
      </div>
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="mt-2 text-xs font-medium text-[color:var(--color-rose)]">{error}</p>}
    </div>
  );
}
