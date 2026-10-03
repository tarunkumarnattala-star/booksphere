"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getLocalProfile } from "@/lib/local-session";
import { supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

// Signed out, "Profile" pointed at the editorial account. A stranger tapping the tab that
// should be theirs landed on BookSphere's own profile, complete with a Follow button, and
// the tab highlighted as though it were them. Send them to the door instead - /login knows
// how to return them here afterwards.
const baseMobileItems = [
  { href: "/explore", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/search", label: "Books" },
  { href: "/login?next=%2Fexplore", label: "You" }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profileHref, setProfileHref] = useState("/login?next=%2Fexplore");

  useEffect(() => {
    const item = baseMobileItems.find(({ href }) => pathname === href);
    if (!item || item.label === "You") return;
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
        if (active) setProfileHref(local ? "/profile/local-reader" : "/login?next=%2Fexplore");
        return;
      }
      // getSession reads the locally stored session; getUser makes a network call that can
      // come back empty for a moment - during a router.refresh(), a token refresh, or a
      // flaky connection. Trusting it downgraded a signed-in reader's Profile tab to a login
      // link, so tapping the tab that should be theirs took them to a sign-in page while
      // they were signed in. Explore kept working because it is a static href, which is
      // exactly how it presented: "some tabs work, Profile does not, a refresh fixes it".
      //
      // A transient failure now leaves the existing link alone. Only a definitive absence of
      // a session sends anyone to the door.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setProfileHref("/login?next=%2Fexplore");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
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
    if (item.label === "You") return { ...item, href: profileHref };
    return item;
  });

  return (
    // Four words on paper under a hairline, with the current one marked by a rule above it -
    // the way a printed index marks the section you are in. The compass, the two-people
    // glyph, the stack of books and the head-and-shoulders said nothing the words did not.
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--rule)] bg-[color:var(--paper)] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="grid grid-cols-4">
        {mobileItems.map((item) => {
          const active = item.label === "Books"
            ? pathname === "/search" || pathname === "/genres" || pathname.startsWith("/genre/")
            : item.label === "You"
              ? pathname.startsWith("/profile/")
              : pathname === item.href.split("?")[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (item.label === "You") return;
                const rememberedHref = window.sessionStorage.getItem(`booksphere:last:${item.label.toLowerCase()}`);
                if (!rememberedHref || rememberedHref === item.href) return;
                event.preventDefault();
                router.push(rememberedHref);
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "caption caption-muted -mt-px flex min-h-12 items-center justify-center border-t-2 border-transparent transition-colors duration-200",
                active && "border-[color:var(--ink)] text-[color:var(--ink)]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
