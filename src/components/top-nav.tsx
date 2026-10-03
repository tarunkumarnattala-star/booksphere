"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { AuthNavButton } from "./auth-nav-button";
import { useEffect, useState } from "react";
import { getLocalProfile } from "@/lib/local-session";
import { supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

// Signed out, "Profile" pointed at the editorial account. That was fixed in the mobile
// bottom nav on August 6 and missed here, so on any viewport at lg and above a stranger
// tapping the tab that should be theirs still landed on BookSphere's own profile, Follow
// button and all, with the tab lit as though it were them. Same bug, same day, one surface.
const navItems = [
  { href: "/explore", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/search", label: "Books" },
  { href: "/login?next=%2Fexplore", label: "You" }
];

const SIGNED_OUT_PROFILE_HREF = "/login?next=%2Fexplore";

export function TopNav() {
  const pathname = usePathname();
  const [profileHref, setProfileHref] = useState(SIGNED_OUT_PROFILE_HREF);

  useEffect(() => {
    let active = true;
    async function refreshProfileHref() {
      if (!supabase) {
        const local = canUseLocalCommunityFallback() ? getLocalProfile() : null;
        if (active) setProfileHref(local ? "/profile/local-reader" : SIGNED_OUT_PROFILE_HREF);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // Both of these still pointed at the editorial account after the array and the
        // initial state were fixed, so the server sent the right href and hydration set it
        // straight back. curl showed a fixed nav; the running page was still broken. The
        // only check that caught it was reading the live DOM.
        if (active) setProfileHref(SIGNED_OUT_PROFILE_HREF);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("username").eq("auth_user_id", data.user.id).maybeSingle();
      if (active && profile?.username) setProfileHref(`/profile/${profile.username}`);
    }
    void refreshProfileHref();
    window.addEventListener("booksphere-auth-change", refreshProfileHref);
    const { data: listener } = supabase?.auth.onAuthStateChange(() => void refreshProfileHref()) || { data: null };
    return () => {
      active = false;
      window.removeEventListener("booksphere-auth-change", refreshProfileHref);
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="glass-nav sticky top-0 z-50">
      <nav className="container-page flex h-14 items-center justify-between gap-5 md:h-16">
        {/* The masthead of a printed page: the title, set in the page's own type. The open
            book in a rounded square is the most generic mark a reading product can carry. */}
        <Link href="/explore" className="text-[16px] font-semibold tracking-[-0.01em] text-[color:var(--ink)] md:text-[17px]">
          {APP_NAME}
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const href = item.label === "You" ? profileHref : item.href;
            const active = item.href === "/genres"
              ? pathname === "/genres" || pathname.startsWith("/genre/")
              : item.label === "You"
                ? pathname.startsWith("/profile/")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "caption caption-muted border-b-2 border-transparent py-1 transition-colors duration-200 hover:text-[color:var(--ink)]",
                  active && "border-[color:var(--ink)] text-[color:var(--ink)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center">
          <AuthNavButton />
        </div>
      </nav>
    </header>
  );
}
