"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { AuthNavButton } from "./auth-nav-button";
import { useEffect, useState } from "react";
import { getLocalProfile } from "@/lib/local-session";
import { supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

const navItems = [
  { href: "/explore", label: "Explore" },
  { href: "/genres", label: "Genres" },
  { href: "/feed", label: "Feed" },
  { href: "/search", label: "Search" },
  { href: "/profile/booksphere-team", label: "Profile" }
];

export function TopNav() {
  const pathname = usePathname();
  const [profileHref, setProfileHref] = useState("/profile/booksphere-team");

  useEffect(() => {
    let active = true;
    async function refreshProfileHref() {
      if (!supabase) {
        const local = canUseLocalCommunityFallback() ? getLocalProfile() : null;
        if (active) setProfileHref(local ? "/profile/local-reader" : "/profile/booksphere-team");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (active) setProfileHref("/profile/booksphere-team");
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
      <nav className="mx-auto flex h-14 max-w-[1560px] items-center justify-between px-4 md:h-16 md:px-6">
        <Link href="/explore" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-[color:var(--color-text-primary)] !text-white md:size-9">
            <BookOpen size={17} strokeWidth={2.1} />
          </span>
          <span className="text-[19px] font-semibold tracking-[-0.04em] md:text-[21px]">{APP_NAME}</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const href = item.label === "Profile" ? profileHref : item.href;
            const active = item.href === "/genres"
              ? pathname === "/genres" || pathname.startsWith("/genre/")
              : item.label === "Profile"
                ? pathname.startsWith("/profile/")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm font-medium text-[color:var(--color-text-secondary)] transition duration-200 hover:text-[color:var(--color-text-primary)]",
                  active && "text-[color:var(--color-text-primary)]"
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
