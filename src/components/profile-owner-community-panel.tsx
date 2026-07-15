"use client";

import { useEffect, useState } from "react";
import { DiscussionCard } from "@/components/discussion-card";
import { requireProfile } from "@/lib/auth-client";
import { getSupabaseContributionsByIds } from "@/lib/contributions";
import { supabase } from "@/lib/supabase";
import type { DiscussionPost } from "@/lib/types";

export function ProfileOwnerCommunityPanel({ profileId }: { profileId: string }) {
  const [isOwner, setIsOwner] = useState(false);
  const [saved, setSaved] = useState<DiscussionPost[]>([]);
  const [followed, setFollowed] = useState<DiscussionPost[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let cancelled = false;
    async function loadOwnerData() {
      const auth = await requireProfile();
      if (!auth.ok || auth.profileId !== profileId) return;
      setIsOwner(true);
      const [savedResult, followedResult] = await Promise.all([
        client.from("saved_insights").select("discussion_post_id").eq("user_id", profileId).order("created_at", { ascending: false }).limit(6),
        client.from("followed_discussions").select("discussion_post_id").eq("user_id", profileId).order("created_at", { ascending: false }).limit(6)
      ]);
      if (cancelled) return;
      if (savedResult.error || followedResult.error) {
        setError("This reader's contributions could not be loaded.");
        return;
      }
      const savedIds = (savedResult.data || []).map((row) => row.discussion_post_id as string);
      const followedIds = (followedResult.data || []).map((row) => row.discussion_post_id as string);
      const [savedPosts, followedPosts] = await Promise.all([
        getSupabaseContributionsByIds(savedIds),
        getSupabaseContributionsByIds(followedIds)
      ]);
      if (cancelled) return;
      setSaved(savedPosts);
      setFollowed(followedPosts);
    }
    void loadOwnerData();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  if (!isOwner) return null;

  return (
    <section className="mt-10 rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
      <p className="caption">Private to you</p>
      <h2 className="title-2 mt-2">Your saved and followed knowledge</h2>
      <p className="body-copy mt-3 max-w-2xl text-[15px]">Only you can see these owner-only profile sections.</p>
      {error && <p className="mt-4 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="title-3 mb-4">Saved insights</h3>
          <div className="grid gap-4">
            {saved.length ? saved.map((post) => <DiscussionCard key={post.id} post={post} showBook compact />) : (
              <p className="body-copy text-[15px]">Saved insights will appear here after you save a contribution.</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="title-3 mb-4">Followed discussions</h3>
          <div className="grid gap-4">
            {followed.length ? followed.map((post) => <DiscussionCard key={post.id} post={post} showBook compact />) : (
              <p className="body-copy text-[15px]">Followed discussions will appear here after you follow a thread.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
