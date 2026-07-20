import Link from "next/link";
import { SearchClient } from "@/components/search-client";
import { findKnowledgeConcept } from "@/lib/concepts";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { getSupabaseKnowledgePosts } from "@/lib/knowledge-posts";

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; intent?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const adding = params?.intent === "add";
  const focusedConcept = findKnowledgeConcept(params?.q || "");
  const [persistedDiscussions, persistedKnowledgePosts] = await Promise.all([
    getSupabaseFeedContributions(100),
    getSupabaseKnowledgePosts(100)
  ]);

  return (
    <div className={`editorial-page max-w-[1440px] ${focusedConcept ? "pt-6 md:pt-9" : ""}`}>
      {!focusedConcept && <>
        <p className="caption mb-3">Search</p>
        <h1 className="large-title max-w-[1080px]">{adding ? "Choose the book behind your insight." : "Turn curiosity into knowledge."}</h1>
        <p className="body-copy mt-4 max-w-[760px] text-[17px] leading-7 md:text-[18px]">
          {adding
            ? "BookSphere works best when every insight has context. Find the book first, then add the idea, application, question, or disagreement that helps another reader."
            : "Search a book, concept, question, or goal. Understand the idea, check the context, and see the books and real perspectives behind it."}
        </p>
      </>}
      {adding && !focusedConcept && (
        <div className="mt-6 rounded-[24px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
          <p className="text-sm font-medium leading-6 text-[color:var(--color-text-secondary)]">
            Open a book result and use <span className="font-semibold text-[color:var(--color-text-primary)]">Share Insight</span> to publish a structured knowledge pill.
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
      />
    </div>
  );
}
