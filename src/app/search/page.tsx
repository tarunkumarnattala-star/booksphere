import Link from "next/link";
import { SearchClient } from "@/components/search-client";
import { getSupabaseFeedContributions } from "@/lib/contributions";

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; intent?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const adding = params?.intent === "add";
  const persistedDiscussions = await getSupabaseFeedContributions(100);

  return (
    <div className="editorial-page max-w-[1440px]">
      <p className="caption mb-4">Search</p>
      <h1 className="large-title max-w-[1080px]">{adding ? "Choose the book behind your insight." : "Start with the problem, not the shelf."}</h1>
      <p className="body-copy mt-6 max-w-[760px] text-[19px] leading-8">
        {adding
          ? "BookSphere works best when every insight has context. Find the book first, then add the idea, application, question, or disagreement that helps another reader."
          : "Search for a book, decision, question, or goal. BookSphere connects it to useful ideas, real reader applications, disagreements, and the books behind them."}
      </p>
      {adding && (
        <div className="mt-6 rounded-[24px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
          <p className="text-sm font-medium leading-6 text-[color:var(--color-text-secondary)]">
            Open a book result and use <span className="font-semibold text-[color:var(--color-text-primary)]">Share Insight</span> to publish a structured knowledge pill.
          </p>
          <Link href="/genres" className="mt-3 inline-flex text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">
            Browse by genre instead
          </Link>
        </div>
      )}
      <SearchClient initialQuery={params?.q || ""} persistedDiscussions={persistedDiscussions} />
    </div>
  );
}
