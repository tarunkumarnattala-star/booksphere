import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { SearchClient } from "@/components/search-client";
import { findKnowledgeConcept } from "@/lib/concepts";
import { genres, readingPaths } from "@/lib/data";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { getSupabaseKnowledgePosts } from "@/lib/knowledge-posts";

export const metadata: Metadata = pageMetadata({
  title: "Search",
  description: "Search books, concepts, questions, or goals.",
  path: "/search"
});


export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; intent?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const adding = params?.intent === "add";
  const focusedConcept = findKnowledgeConcept(params?.q || "");
  // With no query SearchClient renders the default state and reads neither of these, yet 100
  // discussions and 100 feed posts - full bodies, up to 10,000 characters each - were fetched
  // and serialised into the RSC payload on every load, plus twelve .in(...) fan-out queries
  // behind them. /search is a top-level nav item and a signed-out entry point.
  const hasQuery = Boolean((params?.q || "").trim());
  const [persistedDiscussions, persistedKnowledgePosts] = hasQuery
    ? await Promise.all([
        getSupabaseFeedContributions(100),
        getSupabaseKnowledgePosts(100)
      ])
    : [[], []];

  return (
    <div className={`editorial-page max-w-[1440px] ${focusedConcept ? "pt-6 md:pt-9" : ""}`}>
      {!focusedConcept && (
        <h1 className="large-title mb-4 max-w-[1080px]">
          {adding ? "Choose the book behind your insight." : "Find a book, or the idea inside it."}
        </h1>
      )}
      {adding && !focusedConcept && (
        <div className="mt-6 rounded-[24px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
          <p className="text-sm font-medium leading-6 text-[color:var(--color-text-secondary)]">
            Open a book result and use <span className="font-semibold text-[color:var(--color-text-primary)]">Share a perspective</span> to publish it with context.
          </p>
          <Link href="/genres" className="mt-3 inline-flex text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">
            Browse by genre instead
          </Link>
        </div>
      )}
      <SearchClient
        key={params?.q || "search-default"}
        initialQuery={params?.q || ""}
        persistedDiscussions={persistedDiscussions}
        persistedKnowledgePosts={persistedKnowledgePosts}
        /* Genres and paths are ways of browsing books, so they sit directly under the box
           that finds one, instead of above it where they pushed the box off the screen.
           Passed in rather than rendered inside SearchClient so this page still owns what
           browsing looks like. They belong to the default state: once you type, the
           results take the page. */
        browse={
          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/genre/${genre.slug}`}
                  className="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] transition hover:text-[color:var(--color-text-primary)]"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
            {readingPaths.length > 0 && (
              <div className="mt-6">
                <p className="caption mb-2.5">Reading paths</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {readingPaths.map((path) => (
                    <Link
                      key={path.slug}
                      href={`/path/${path.slug}`}
                      className="rounded-[20px] bg-white p-3.5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] transition hover:bg-black/[0.015]"
                    >
                      <p className="text-[15px] font-medium leading-snug tracking-[-0.02em] text-[color:var(--color-text-primary)]">{path.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-[1.45] text-[color:var(--color-text-secondary)]">{path.description}</p>
                      <p className="mt-1.5 text-[12px] text-[color:var(--color-text-muted)]">{path.bookIds.length} books in order</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
