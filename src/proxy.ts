import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { books, genres } from "@/lib/data";

// Book and genre pages await Supabase, which makes them dynamic. A dynamic route runs
// even when its param is not in generateStaticParams, and notFound() from inside a
// running page renders the right screen but still answers HTTP 200 - a soft 404 that a
// crawler indexes as real content. dynamicParams = false only gates prerendered routes,
// which is why the reading-path route was fixed by it and these were not.
//
// Checking the slug here happens before the page runs, so the answer is a real 404
// regardless of how the route renders. The sets are derived from the catalog rather
// than duplicated, so they cannot drift out of step with it.
const bookSlugs = new Set(books.map((book) => book.id));
const genreSlugs = new Set(genres.map((genre) => genre.slug));

export const config = {
  matcher: ["/book/:path*", "/genre/:path*"]
};

export default function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const [section, slug] = segments;

  if (!slug) return NextResponse.next();
  if (section === "book" && !bookSlugs.has(slug)) return notFound(request);
  if (section === "genre" && !genreSlugs.has(slug)) return notFound(request);

  return NextResponse.next();
}

function notFound(request: NextRequest) {
  // Rewrite rather than redirect: the reader keeps the URL they typed, sees the app's
  // own not-found screen, and the response carries a genuine 404.
  return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
}
