"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpen, MessageCircle, Search } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { books, discussions, genres, knowledgePosts, readingPaths } from "@/lib/data";
import { searchKnowledge } from "@/lib/search";
import { KnowledgeBookResult, KnowledgeDiscussionResult, KnowledgeReadingPathResult, KnowledgeSearchResult } from "@/lib/search";
import { DiscussionPost } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

const intentCards = [
  "Build Better Habits",
  "Think More Clearly",
  "Become a Better Communicator",
  "Learn Negotiation",
  "Understand Investing",
  "Improve Decision-Making"
];

const trendingQuestions = [
  "Which book changed how you think about money?",
  "What is the best startup book you have ever read?",
  "Which psychology book actually changed your behavior?"
];

export function SearchClient({ initialQuery = "", persistedDiscussions = [] }: { initialQuery?: string; persistedDiscussions?: DiscussionPost[] }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggested, setSuggested] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const cleanQuery = query.trim();
  const hasQuery = cleanQuery.length > 0;
  const results = useMemo(() => {
    const mergedDiscussions = (isSupabaseConfigured ? persistedDiscussions : [...persistedDiscussions, ...discussions])
      .filter((post, index, all) => all.findIndex((item) => item.id === post.id) === index);
    return searchKnowledge(query, {
      books,
      genres,
      discussions: mergedDiscussions,
      knowledgePosts,
      readingPaths
    });
  }, [persistedDiscussions, query]);

  function openBestMatch() {
    if (results.bestMatch) router.push(results.bestMatch.destinationUrl);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    openBestMatch();
  }

  function updateQuery(nextQuery: string) {
    setSuggested(false);
    setQuery(nextQuery);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      openBestMatch();
    }
    if (event.key === "Escape") {
      setQuery("");
      setSuggested(false);
      inputRef.current?.blur();
    }
  }

  function runIntentSearch(value: string) {
    updateQuery(value);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="mt-7 md:mt-8">
      <form onSubmit={handleSubmit} className="max-w-[920px]">
        <label className="group flex items-center gap-4 rounded-[26px] bg-white px-4 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.055)] ring-1 ring-black/[0.055] transition focus-within:ring-[rgba(168,120,24,0.34)] md:px-6 md:py-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[color:var(--color-soft-fill)] text-[color:var(--color-text-primary)] md:size-14">
            <Search size={24} strokeWidth={1.8} />
          </span>
          <span className="sr-only">Search books, authors, ideas, or questions</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search books, authors, ideas, or questions..."
            className="min-w-0 flex-1 border-0 bg-transparent text-[18px] font-[400] tracking-[-0.02em] text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)] md:text-[22px]"
          />
        </label>
      </form>

      {!hasQuery ? <DefaultSearchState onSelect={runIntentSearch} /> : (
        <KnowledgeResults
          query={cleanQuery}
          results={results}
          suggested={suggested}
          onSuggest={() => setSuggested(true)}
          onSelectQuery={runIntentSearch}
        />
      )}
    </div>
  );
}

function DefaultSearchState({ onSelect }: { onSelect: (query: string) => void }) {
  return (
    <section className="mt-8 max-w-[1080px] border-t border-[color:var(--color-hairline)] pt-6 md:mt-10 md:pt-7">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="caption mb-2">Start with a goal</p>
          <h2 className="title-3">What do you want to understand?</h2>
        </div>
        <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">Books, ideas, and reader experience in one search.</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {intentCards.map((intent) => <IntentCard key={intent} title={intent} onClick={() => onSelect(intent)} />)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[color:var(--color-hairline)] pt-4">
        <span className="caption text-[10px]">Popular</span>
        {trendingQuestions.map((question) => (
          <button key={question} type="button" onClick={() => onSelect(question)} className="text-left text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}

function KnowledgeResults({
  query,
  results,
  suggested,
  onSuggest,
  onSelectQuery
}: {
  query: string;
  results: ReturnType<typeof searchKnowledge>;
  suggested: boolean;
  onSuggest: () => void;
  onSelectQuery: (query: string) => void;
}) {
  if (results.noResults) {
    return <NoResultsState query={query} suggested={suggested} onSuggest={onSuggest} onSelectQuery={onSelectQuery} />;
  }

  return (
    <div className="mt-16 space-y-20">
      {results.bestMatch && (
        <section>
          <SectionIntro eyebrow="Best match" title="Start here" subtitle="The strongest match across books, discussions, reading paths, and related ideas." />
          <div className="mt-8 max-w-[960px]">
            <BestMatchCard result={results.bestMatch} />
          </div>
        </section>
      )}

      <SearchResultGroup title="Recommended Books" subtitle="Ranked by title, author, topic relevance, reading-path fit, and editorial curation." isEmpty={!results.books.length}>
        <div className="grid gap-4 lg:grid-cols-2">
          {results.books.map((result) => <BookSearchResultCard key={result.id} result={result} />)}
        </div>
      </SearchResultGroup>

      <SearchResultGroup title="Perspectives" subtitle="Canonical community contributions that turn a book into a question, application, disagreement, or useful lesson." isEmpty={!results.discussions.length}>
        <div className="grid gap-4 lg:grid-cols-2">
          {results.discussions.map((result) => <DiscussionSearchResultCard key={result.id} result={result} />)}
        </div>
      </SearchResultGroup>

      <SearchResultGroup title="Reading Paths" subtitle="Sequences that help you move from one useful idea to the next." isEmpty={!results.readingPaths.length}>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {results.readingPaths.map((result) => <ReadingPathSearchResultCard key={result.id} result={result} />)}
        </div>
      </SearchResultGroup>

      {results.relatedIdeas.length > 0 && <RelatedIdeas ideas={results.relatedIdeas} onSelect={onSelectQuery} />}
      {results.readersAlsoContinuedWith.length > 0 && <ReadersAlsoContinuedWith books={results.readersAlsoContinuedWith} />}
      {results.relatedSearches.length > 0 && <RelatedSearches searches={results.relatedSearches} onSelect={onSelectQuery} />}
    </div>
  );
}

function SectionIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div>
      <p className="caption mb-3">{eyebrow}</p>
      <h2 className="title-1">{title}</h2>
      <p className="body-copy mt-3 max-w-[760px]">{subtitle}</p>
    </div>
  );
}

function IntentCard({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-h-14 rounded-[18px] bg-white px-4 py-3 text-left text-sm font-medium leading-5 text-[color:var(--color-text-primary)] shadow-[0_6px_20px_rgba(0,0,0,0.035)] ring-1 ring-black/[0.04] transition hover:bg-black/[0.025] sm:text-[15px]"
    >
      {title}
    </button>
  );
}

function BestMatchCard({ result }: { result: KnowledgeSearchResult }) {
  if (result.type === "book") return <BookSearchResultCard result={result} featured />;
  if (result.type === "discussion") return <DiscussionSearchResultCard result={result} featured />;
  return <ReadingPathSearchResultCard result={result} featured />;
}

function SearchResultGroup({ title, subtitle, isEmpty, children }: { title: string; subtitle: string; isEmpty: boolean; children: ReactNode }) {
  if (isEmpty) return null;
  return (
    <section>
      <SectionIntro eyebrow="Results" title={title} subtitle={subtitle} />
      <div className="mt-8">{children}</div>
    </section>
  );
}

function BookSearchResultCard({ result, featured = false }: { result: KnowledgeBookResult; featured?: boolean }) {
  return (
    <Link href={result.destinationUrl} className={`interactive-lift group grid min-w-0 gap-5 rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] ${featured ? "sm:grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] md:p-7" : "grid-cols-[76px_minmax(0,1fr)] sm:grid-cols-[92px_minmax(0,1fr)]"}`}>
      <BookCover book={result.book} className={featured ? "w-[130px] sm:w-[140px] md:w-[150px]" : "w-[76px] sm:w-[92px]"} />
      <div className="min-w-0 self-center">
        <p className="caption">{result.matchReason}</p>
        <h3 className={featured ? "title-2 mt-2" : "title-3 mt-2 line-clamp-2"}>{result.title}</h3>
        <p className="subheadline mt-1">{result.subtitle}</p>
        <p className="body-copy mt-3 line-clamp-2 text-[15px] leading-6">{result.description}</p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium">Open book <ArrowUpRight size={16} /></p>
      </div>
    </Link>
  );
}

function DiscussionSearchResultCard({ result, featured = false }: { result: KnowledgeDiscussionResult; featured?: boolean }) {
  return (
    <Link href={result.destinationUrl} className={`interactive-lift group rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] ${featured ? "md:p-7" : ""}`}>
      <div className="flex gap-4">
        {result.book && <BookCover book={result.book} className="w-[74px] shrink-0 rounded-[16px]" />}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[color:var(--color-soft-fill)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-secondary)]">{result.matchReason}</span>
            <span className="caption">{result.discussion.postType}</span>
          </div>
          <h3 className={featured ? "title-2 mt-3" : "title-3 mt-3 line-clamp-2"}>{result.title}</h3>
          <p className="subheadline mt-1">{result.subtitle}</p>
        </div>
      </div>
      <p className="body-copy mt-5 line-clamp-3 text-[15px] leading-6">{result.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1"><MessageCircle size={16} /> {result.discussion.comments} comments</span>
        <span>{result.discussion.likes} likes</span>
        <span>{result.discussion.saves} saves</span>
        <span className="text-[color:var(--color-text-primary)]">Open thread <ArrowUpRight className="inline" size={15} /></span>
      </div>
    </Link>
  );
}

function ReadingPathSearchResultCard({ result, featured = false }: { result: KnowledgeReadingPathResult; featured?: boolean }) {
  return (
    <Link href={result.destinationUrl} className={`interactive-lift group rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] ${featured ? "md:p-7" : ""}`}>
      <div className="flex h-32 items-end gap-3 overflow-hidden rounded-[24px] bg-[#f4f1eb] px-5 pt-5">
        {result.books.slice(0, 4).map((book, index) => <BookCover key={book.id} book={book} className={`${index === 0 ? "w-[74px]" : "w-[56px]"} ${index % 2 ? "mb-4" : ""}`} />)}
      </div>
      <p className="caption mt-5">{result.matchReason}</p>
      <h3 className={featured ? "title-2 mt-2" : "title-3 mt-2"}>{result.title}</h3>
      <p className="body-copy mt-2 line-clamp-2 text-[15px] leading-6">{result.description}</p>
      <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium">Open path <ArrowUpRight size={16} /></p>
    </Link>
  );
}

function RelatedIdeas({ ideas, onSelect }: { ideas: string[]; onSelect: (query: string) => void }) {
  return (
    <section>
      <SectionIntro eyebrow="Related ideas" title="Ideas connected to this search" subtitle="Tap one to keep moving through the knowledge graph." />
      <div className="mt-6 flex flex-wrap gap-3">
        {ideas.map((idea) => (
          <button key={idea} type="button" onClick={() => onSelect(idea)} className="rounded-full bg-white px-5 py-3 text-sm font-medium shadow-[0_8px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5">
            {idea}
          </button>
        ))}
      </div>
    </section>
  );
}

function ReadersAlsoContinuedWith({ books: continuedBooks }: { books: KnowledgeBookResult[] }) {
  return (
    <section>
      <SectionIntro eyebrow="Learning journey" title="Readers also continued with..." subtitle="Not similar books. More like the next useful step in the same learning path." />
      <div className="shelf-scroll mt-8 flex gap-5 overflow-x-auto pb-4">
        {continuedBooks.map((result) => (
          <Link key={result.id} href={result.destinationUrl} className="interactive-lift w-[190px] shrink-0 snap-start">
            <BookCover book={result.book} className="w-full" />
            <p className="caption mt-4">{result.matchReason}</p>
            <h3 className="headline mt-1 line-clamp-2 tracking-[-0.02em]">{result.title}</h3>
            <p className="footnote mt-1">{result.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RelatedSearches({ searches, onSelect }: { searches: string[]; onSelect: (query: string) => void }) {
  return (
    <section>
      <SectionIntro eyebrow="Related searches" title="Try another doorway" subtitle="Useful searches that often lead to stronger books, paths, and discussions." />
      <div className="mt-6 flex flex-wrap gap-3">
        {searches.map((search) => (
          <button key={search} type="button" onClick={() => onSelect(search)} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[color:var(--color-text-secondary)] shadow-[0_8px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition hover:text-[color:var(--color-text-primary)]">
            {search}
          </button>
        ))}
      </div>
    </section>
  );
}

function NoResultsState({ query, suggested, onSuggest, onSelectQuery }: { query: string; suggested: boolean; onSuggest: () => void; onSelectQuery: (query: string) => void }) {
  return (
    <section className="mt-16 max-w-[820px] rounded-[36px] bg-white p-8 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] md:p-10">
      <div className="mb-6 grid size-14 place-items-center rounded-full bg-[#f7f1e5] text-[color:var(--color-accent)]">
        <BookOpen size={24} strokeWidth={1.8} />
      </div>
      <p className="caption mb-3">No result</p>
      <h2 className="title-1">We do not have this yet.</h2>
      <p className="body-copy mt-4 max-w-[660px]">BookSphere is starting with a focused knowledge library. We are working hard to bring more books, discussions, and reading paths into the app.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onSuggest} className="rounded-full bg-[color:var(--color-text-primary)] px-6 py-3 text-sm font-medium !text-white transition hover:opacity-90">
          {suggested ? "Suggestion saved" : "Suggest this book or idea"}
        </button>
        {[
          "habits",
          "money",
          "communication"
        ].map((fallback) => (
          <button key={fallback} type="button" onClick={() => onSelectQuery(fallback)} className="rounded-full bg-[color:var(--color-soft-fill)] px-6 py-3 text-sm font-medium">
            Try {fallback}
          </button>
        ))}
      </div>
      <p className="footnote mt-5">You searched for &quot;{query}&quot;.</p>
    </section>
  );
}
