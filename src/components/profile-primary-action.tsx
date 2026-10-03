"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { getLocalProfile } from "@/lib/local-session";
import { supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

export function ProfilePrimaryAction({ profileId, profileUsername }: { profileId: string; profileUsername: string }) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const syncOwner = async () => {
      if (!supabase) {
        if (active) setIsOwner(canUseLocalCommunityFallback() && getLocalProfile()?.id === profileId);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (active) setIsOwner(false);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("id").eq("auth_user_id", data.user.id).maybeSingle();
      if (active) setIsOwner(profile?.id === profileId);
    };
    void syncOwner();
    window.addEventListener("booksphere-auth-change", syncOwner);
    const { data: authListener } = supabase?.auth.onAuthStateChange(() => void syncOwner()) || { data: null };
    return () => {
      active = false;
      window.removeEventListener("booksphere-auth-change", syncOwner);
      authListener?.subscription.unsubscribe();
    };
  }, [profileId]);

  if (isOwner === null) return <span className="block h-11" aria-hidden="true" />;

  if (isOwner) {
    return (
      <div className="control-row">
        {/* Nothing in the app linked to /saved. Every "Save book" and "Save insight" button
            on the site wrote to a page you could only reach by typing the URL. */}
        <Link href="/saved" className="control control-lead">Your saved shelf</Link>
        <Link href="/settings" className="control control-lead">Edit your profile</Link>
      </div>
    );
  }

  return <FollowButton profileUsername={profileUsername} />;
}
