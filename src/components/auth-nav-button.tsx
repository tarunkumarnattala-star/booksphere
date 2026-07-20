"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearLocalProfile, getLocalProfile } from "@/lib/local-session";
import { supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

export function AuthNavButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [label, setLabel] = useState("Log in");
  const [profileHref, setProfileHref] = useState("/profile/booksphere-team");

  useEffect(() => {
    let mounted = true;
    async function refresh() {
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setSignedIn(Boolean(data.user));
        setLabel(data.user?.email?.split("@")[0] || "Profile");
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("username,name").eq("auth_user_id", data.user.id).maybeSingle();
          if (!mounted) return;
          if (profile?.username) setProfileHref(`/profile/${profile.username}`);
          if (profile?.name) setLabel(profile.name);
        }
        return;
      }
      const local = canUseLocalCommunityFallback() ? getLocalProfile() : null;
      setSignedIn(Boolean(local));
      setLabel(local?.name || "Log in");
      setProfileHref(local ? "/profile/local-reader" : "/profile/booksphere-team");
    }
    void refresh();
    window.addEventListener("booksphere-auth-change", refresh);
    const { data: authListener } = supabase?.auth.onAuthStateChange(() => void refresh()) || { data: null };
    return () => {
      mounted = false;
      window.removeEventListener("booksphere-auth-change", refresh);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    clearLocalProfile();
    setSignedIn(false);
    setLabel("Log in");
    setProfileHref("/profile/booksphere-team");
    router.replace("/explore");
    router.refresh();
  }

  if (!signedIn) {
    const loginHref = pathname === "/login" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
    return (
      <Link href={loginHref} className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--color-text-primary)] px-4 py-2 text-sm font-medium !text-white transition duration-200 hover:opacity-85">
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={profileHref} className="hidden max-w-[140px] truncate rounded-full bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)] ring-1 ring-black/[0.04] lg:block">
        {label}
      </Link>
      <button type="button" onClick={signOut} className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--color-text-primary)] px-4 py-2 text-sm font-medium !text-white transition duration-200 hover:opacity-85">
        Log out
      </button>
    </div>
  );
}
