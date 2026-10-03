"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { hasLocalItem, toggleLocalItem } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import { LoginRequiredNotice } from "./login-required-notice";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

export function FollowButton({ initial = false, profileUsername, compact = false }: { initial?: boolean; profileUsername?: string; compact?: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initial);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  // `disabled={syncing}` only takes effect after requireProfile() resolves, which is two
  // network calls away. Two taps inside that window both passed, both computed the same
  // next value, and the later response could leave the button reading "Follow" while the
  // row existed. A ref latches synchronously; state cannot.
  const inFlight = useRef(false);

  useEffect(() => {
    if (!profileUsername) return;
    if (!supabase) {
      if (canUseLocalCommunityFallback()) queueMicrotask(() => setFollowing(hasLocalItem("booksphere.followedProfiles", profileUsername)));
      return;
    }
    let active = true;
    async function loadFollowing() {
      const auth = await requireProfile();
      if (!auth.ok) return;
      const { data: target } = await supabase!.from("profiles").select("id").eq("username", profileUsername).maybeSingle();
      if (!target?.id) return;
      if (target.id === auth.profileId) {
        if (active) setIsSelf(true);
        return;
      }
      const { data } = await supabase!.from("follows").select("id").eq("follower_id", auth.profileId).eq("following_id", target.id).maybeSingle();
      if (active) setFollowing(Boolean(data?.id));
    }
    void loadFollowing();
    return () => { active = false; };
  }, [profileUsername]);

  async function toggleFollow() {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await runToggleFollow();
    } finally {
      inFlight.current = false;
    }
  }

  async function runToggleFollow() {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }

    if (!supabase || !profileUsername) {
      if (profileUsername) setFollowing(toggleLocalItem("booksphere.followedProfiles", profileUsername));
      else setFollowing((value) => !value);
      return;
    }

    setError("");
    setSyncing(true);
    const nextFollowing = !following;
    setFollowing(nextFollowing);

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", profileUsername)
      .maybeSingle();

    if (!targetProfile?.id) {
      setFollowing(!nextFollowing);
      setError("We could not find this contributor in the database yet.");
      setSyncing(false);
      return;
    }
    if (targetProfile.id === auth.profileId) {
      setIsSelf(true);
      setSyncing(false);
      return;
    }

    const { error: followError } = nextFollowing
      ? await supabase.from("follows").upsert({ follower_id: auth.profileId, following_id: targetProfile.id }, { onConflict: "follower_id,following_id" })
      : await supabase.from("follows").delete().eq("follower_id", auth.profileId).eq("following_id", targetProfile.id);

    if (followError) {
      setFollowing(!nextFollowing);
      setError("We could not update your following list. Please try again.");
      setSyncing(false);
      return;
    }
    setSyncing(false);
    // Both surfaces that show a follower number are server-rendered and force-dynamic, and
    // nothing here told them anything had changed: pressing Follow flipped the button and
    // left "Followers 12" reading 12, on the same screen, indefinitely.
    router.refresh();
  }

  if (isSelf) return null;

  return (
    <div>
      <button
        type="button"
        onClick={toggleFollow}
        disabled={syncing}
        aria-label={following ? "Unfollow this contributor" : "Follow this contributor"}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] font-medium !text-white transition duration-200 hover:opacity-85 disabled:opacity-55 ${
          compact ? "min-h-9 px-3 py-1.5 text-xs" : "min-h-11 px-4 py-2 text-sm"
        }`}
      >
        {following ? <UserCheck size={compact ? 14 : 17} /> : <UserPlus size={compact ? 14 : 17} />}
        {following ? "Following" : "Follow"}
      </button>
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="mt-3 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
    </div>
  );
}
