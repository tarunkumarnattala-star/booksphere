import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { SearchClient } from "@/components/search-client";
import { findKnowledgeConcept } from "@/lib/concepts";
import { books } from "@/lib/data";
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
    <div className="editorial-page">
      {!focusedConcept && (
        <header>
          <p className="caption">Books</p>
          <h1 className="large-title mt-4 max-w-[16ch]">
            {adding ? "Choose the book behind your perspective" : <>All <span className="numeral">{books.length}</span> books</>}
          </h1>
          <p className="body-copy measure mt-5">
            {adding
              ? "Every perspective is attached to a book. Find the book first, then write what you made of it."
              : "Type a title, an author, an idea or a question. Or browse by genre or reading path underneath."}
          </p>
        </header>
      )}

      {adding && !focusedConcept && (
        <p className="footnote mt-5 border-l-2 border-[color:var(--ink)] pl-4">
          Open a book and use <span className="text-[color:var(--ink)]">Share a perspective</span> to publish it with its context.
        </p>
      )}

      <SearchClient
        key={params?.q || "search-default"}
        initialQuery={params?.q || ""}
        persistedDiscussions={persistedDiscussions}
        persistedKnowledgePosts={persistedKnowledgePosts}
      />
    </div>
  );
}
