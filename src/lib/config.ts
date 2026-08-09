export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BookSphere";

export const APP_PROMISE =
  "Discover the best books. Read what thoughtful people learned from them. Share your own perspective.";

// Kept in step with top-nav.tsx and mobile-bottom-nav.tsx, which each hold their own copy.
// This one is currently imported by nothing - it is here as a stale third copy of the nav
// carrying the signed-out Profile bug that was fixed in the other two, which is exactly how
// that bug would come back.
export const navItems = [
  { href: "/explore", label: "Explore" },
  { href: "/genres", label: "Genres" },
  { href: "/feed", label: "Feed" },
  { href: "/search", label: "Search" },
  { href: "/login?next=%2Ffeed", label: "Profile" }
];
