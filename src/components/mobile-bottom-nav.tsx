"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Compass, LibraryBig, Search, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getLocalProfile } from "@/lib/local-session";
import { supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

const baseMobileItems = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/genres", label: "Genres", icon: LibraryBig },
  { href: "/feed", label: "Feed", icon: UsersRound },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile/booksphere-team", label: "Profile", icon: UserRound }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profileHref, setProfileHref] = useState("/profile/booksphere-team");

  useEffect(() => {
    const item = baseMobileItems.find(({ href }) => pathname === href);
    if (!item || item.label === "Profile") return;
    const query = searchParams.toString();
    const currentHref = `${pathname}${query ? `?${query}` : ""}`;
    const storageKey = `booksphere:last:${item.label.toLowerCase()}`;
    window.sessionStorage.setItem(storageKey, currentHref);
  }, [pathname, searchParams]);

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

  const mobileItems = baseMobileItems.map((item) => {
    if (item.label === "Profile") return { ...item, href: profileHref };
    return item;
  });

  return (
    <nav aria-label="Primary mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--color-hairline)] bg-[#f5f5f7]/90 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === "Genres"
            ? pathname === "/genres" || pathname.startsWith("/genre/")
            : item.label === "Profile"
              ? pathname.startsWith("/profile/")
              : pathname === item.href.split("?")[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (item.label === "Profile") return;
                const rememberedHref = window.sessionStorage.getItem(`booksphere:last:${item.label.toLowerCase()}`);
                if (!rememberedHref || rememberedHref === item.href) return;
                event.preventDefault();
                router.push(rememberedHref);
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[18px] px-1 py-1.5 text-[11px] font-medium text-[color:var(--color-text-muted)] transition duration-200 sm:px-2",
                active && "bg-white text-[color:var(--color-text-primary)] shadow-[0_8px_22px_rgba(0,0,0,0.055)]"
              )}
            >
              <Icon size={18} strokeWidth={2.1} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
