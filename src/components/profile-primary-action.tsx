"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, Settings } from "lucide-react";
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

  if (isOwner === null) return <span className="h-10 w-24 shrink-0" aria-hidden="true" />;

  if (isOwner) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        {/* Nothing in the app linked to /saved. Every "Save book" and "Save insight" button
            on the site wrote to a page you could only reach by typing the URL. */}
        <Link href="/saved" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition hover:bg-black/[0.035]">
          <Bookmark size={16} />
          Saved
        </Link>
        <Link href="/settings" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-4 py-2 text-sm font-medium !text-white transition hover:opacity-85">
          <Settings size={16} />
          Edit profile
        </Link>
      </div>
    );
  }

  return <FollowButton profileUsername={profileUsername} />;
}
