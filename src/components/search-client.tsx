"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, CircleAlert, Lightbulb, MessageCircle, Search, Sparkles } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { FeedComposer } from "@/components/feed-composer";
import { SearchPreviewActions } from "@/components/search-preview-actions";
import { featuredKnowledgeConcepts } from "@/lib/concepts";
import { books, discussions, genres, knowledgePosts, readingPaths } from "@/lib/data";
import { searchKnowledge } from "@/lib/search";
import { KnowledgeBookResult, KnowledgeConceptResult, KnowledgeDiscussionResult, KnowledgePostResult, KnowledgeReadingPathResult, KnowledgeSearchResult } from "@/lib/search";
import { DiscussionPost, KnowledgePost } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

const intentCards = [
  "Build Better Habits",
  "Think More Clearly",
  "Become a Better Communicator",
  "Learn Negotiation",
  "Understand Investing",
  "Improve Decision-Making"
];

export function SearchClient({
  initialQuery = "",
  persistedDiscussions = [],
  persistedKnowledgePosts = []
}: {
  initialQuery?: string;
  persistedDiscussions?: DiscussionPost[];
  persistedKnowledgePosts?: KnowledgePost[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const cleanQuery = query.trim();
  const hasQuery = cleanQuery.length > 0;
  const results = useMemo(() => {
    const mergedDiscussions = (isSupabaseConfigured ? persistedDiscussions : [...persistedDiscussions, ...discussions])
      .filter((post, index, all) => all.findIndex((item) => item.id === post.id) === index);
    const mergedKnowledgePosts = (isSupabaseConfigured ? persistedKnowledgePosts : [...persistedKnowledgePosts, ...knowledgePosts])
      .filter((post, index, all) => all.findIndex((item) => item.id === post.id) === index);
    return searchKnowledge(query, {
      books,
      genres,
      discussions: mergedDiscussions,
      knowledgePosts: mergedKnowledgePosts,
      readingPaths
    });
  }, [persistedDiscussions, persistedKnowledgePosts, query]);
  const focusedConcept = Boolean(initialQuery && results.concept);

  function openConceptQuery(nextQuery: string) {
    const cleanNextQuery = nextQuery.trim();
    updateQuery(cleanNextQuery);
    const currentQuery = new URLSearchParams(window.location.search).get("q") || "";
    if (currentQuery !== cleanNextQuery) {
      router.push(`/search?q=${encodeURIComponent(cleanNextQuery)}`);
    }
  }

  function submitSearch() {
    if (!cleanQuery) return;
    inputRef.current?.blur();
    openConceptQuery(cleanQuery);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitSearch();
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
    if (event.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  }

  function runIntentSearch(value: string) {
    openConceptQuery(value);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className={focusedConcept ? "" : "mt-7 md:mt-8"}>
      {focusedConcept ? (
        <Link href="/search" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">
          <ArrowLeft size={17} /> Trending ideas
        </Link>
      ) : <form data-onboarding="search" onSubmit={handleSubmit} className="max-w-[920px] rounded-[26px]">
        <label className="group flex items-center gap-4 rounded-[26px] bg-white px-4 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.055)] ring-1 ring-black/[0.055] transition focus-within:ring-[rgba(168,120,24,0.34)] md:px-6 md:py-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[color:var(--color-soft-fill)] text-[color:var(--color-text-primary)] md:size-14">
            <Search size={24} strokeWidth={1.8} />
          </span>
          <span className="sr-only">Search books, concepts, questions, or goals</span>
          <input
            ref={inputRef}
            data-onboarding-search-input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search books, concepts, questions, or goals..."
            className="min-w-0 flex-1 border-0 bg-transparent text-[18px] font-[400] tracking-[-0.02em] text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)] md:text-[22px]"
          />
        </label>
      </form>}

      {!hasQuery ? <DefaultSearchState onSelect={runIntentSearch} /> : (
        <KnowledgeResults
          query={cleanQuery}
          results={results}
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
      <div className="mt-5 border-t border-[color:var(--color-hairline)] pt-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="caption text-[10px]">Trending ideas, explained</span>
          <span className="hidden text-xs text-[color:var(--color-text-muted)] sm:inline">Clear context beyond the trend</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {featuredKnowledgeConcepts.map((concept) => (
            <button
              key={concept.id}
              type="button"
              onClick={() => onSelect(concept.name)}
              className="group flex min-h-[72px] min-w-0 items-start gap-2.5 rounded-[16px] bg-white px-3 py-3 text-left shadow-[0_6px_20px_rgba(0,0,0,0.035)] ring-1 ring-black/[0.04] transition hover:bg-black/[0.025]"
            >
              <Sparkles size={16} className="mt-0.5 shrink-0 text-[color:var(--color-accent)]" strokeWidth={1.8} />
              <span className="min-w-0">
                <span className="line-clamp-2 block text-[13px] font-medium leading-[18px] text-[color:var(--color-text-primary)] sm:text-sm">{concept.question}</span>
                <span className="mt-1 block truncate text-[11px] text-[color:var(--color-text-muted)] sm:text-xs">{concept.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function KnowledgeResults({
  query,
  results,
  onSelectQuery
}: {
  query: string;
  results: ReturnType<typeof searchKnowledge>;
  onSelectQuery: (query: string) => void;
}) {
  if (results.noResults) {
    return <NoResultsState query={query} onSelectQuery={onSelectQuery} />;
  }

  return (
    <div className={results.concept ? "space-y-10" : "mt-16 space-y-20"}>
      {!results.concept && results.interpretedIntent && (
        <div className="flex max-w-[920px] flex-wrap items-center gap-2 border-b border-[color:var(--color-hairline)] pb-4">
          <span className="caption text-[10px]">Understood as</span>
          <span className="text-sm font-medium text-[color:var(--color-text-primary)]">{results.interpretedIntent}</span>
        </div>
      )}
      {results.bestMatch && (
        <section id={results.bestMatch.type === "concept" ? "concept-result" : undefined}>
          {results.bestMatch.type !== "concept" && <SectionIntro eyebrow="Best match" title="Start here" subtitle="The strongest match across books, discussions, reading paths, and related ideas." />}
          <div className={`${results.bestMatch.type === "concept" ? "" : "mt-8"} max-w-[960px]`}>
            <BestMatchCard result={results.bestMatch} />
          </div>
        </section>
      )}

      {results.concept && (
        <ConceptConversation
          conceptName={results.concept.concept.name}
          discussions={results.discussions}
          knowledgePosts={results.knowledgePosts}
        />
      )}

      <SearchResultGroup
        title={results.concept ? "Books that explain it" : "Recommended Books"}
        subtitle={results.concept ? "Go deeper with the strongest books already connected to this idea." : "Ranked by title, author, topic relevance, reading-path fit, and editorial curation."}
        isEmpty={!results.books.length}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {results.books.map((result) => <BookSearchResultCard key={result.id} result={result} />)}
        </div>
      </SearchResultGroup>

      {!results.concept && (
        <SearchResultGroup
          title="Ideas and perspectives"
          subtitle="Reader experiences and book discussions connected to what you searched."
          isEmpty={!results.discussions.length && !results.knowledgePosts.length}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {results.knowledgePosts.filter((result) => result.id !== results.bestMatch?.id).map((result) => <KnowledgePostSearchResultCard key={result.id} result={result} />)}
            {results.discussions.filter((result) => result.id !== results.bestMatch?.id).map((result) => <DiscussionSearchResultCard key={result.id} result={result} />)}
          </div>
        </SearchResultGroup>
      )}

      {!results.concept && (
        <SearchResultGroup title="Reading Paths" subtitle="Sequences that help you move from one useful idea to the next." isEmpty={!results.readingPaths.length}>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {results.readingPaths.map((result) => <ReadingPathSearchResultCard key={result.id} result={result} />)}
          </div>
        </SearchResultGroup>
      )}

      {results.relatedIdeas.length > 0 && <RelatedIdeas ideas={results.relatedIdeas} onSelect={onSelectQuery} />}
      {!results.concept && results.readersAlsoContinuedWith.length > 0 && <ReadersAlsoContinuedWith books={results.readersAlsoContinuedWith} />}
      {!results.concept && results.relatedSearches.length > 0 && <RelatedSearches searches={results.relatedSearches} onSelect={onSelectQuery} />}
    </div>
  );
}

function ConceptConversation({
  conceptName,
  discussions,
  knowledgePosts: conceptPosts
}: {
  conceptName: string;
  discussions: KnowledgeDiscussionResult[];
  knowledgePosts: KnowledgePostResult[];
}) {
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const visiblePosts = conceptPosts.slice(0, 2);
  const visibleDiscussions = discussions.slice(0, Math.max(0, 2 - visiblePosts.length));
  const hasConversation = visiblePosts.length + visibleDiscussions.length > 0;
  return (
    <section id="concept-conversation">
      <SectionIntro
        eyebrow="Conversation"
        title="What are people noticing?"
        subtitle={`Compare how readers are applying, questioning, or challenging ${conceptName}.`}
      />
      {hasConversation && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {visiblePosts.map((result) => <KnowledgePostSearchResultCard key={result.id} result={result} />)}
          {visibleDiscussions.map((result) => <DiscussionSearchResultCard key={result.id} result={result} />)}
        </div>
      )}
      <div className="mt-5 flex flex-col items-start gap-2 border-t border-[color:var(--color-hairline)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">
          {hasConversation ? "Add what happened when you tried it." : "No one has shared an experience with this idea yet."}
        </p>
        <button type="button" onClick={() => setSharing((value) => !value)} aria-expanded={sharing} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-5 text-sm font-medium !text-white transition hover:opacity-85">
          <MessageCircle size={16} /> Share your experience
        </button>
      </div>
      {sharing && (
        <div className="mt-4 max-w-[820px]">
          <FeedComposer
            initialTopic={conceptName}
            compact
            onPublished={() => {
              router.refresh();
              window.setTimeout(() => setSharing(false), 900);
            }}
          />
        </div>
      )}
    </section>
  );
}

function KnowledgePostSearchResultCard({ result }: { result: KnowledgePostResult }) {
  return (
    <article className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <span className="caption">{result.post.topic}</span>
        <span className="text-xs text-[color:var(--color-text-muted)]">{result.post.authorName || "Reader"}</span>
      </div>
      <Link href={result.destinationUrl} className="group block">
        <h3 className="title-3 mt-3 line-clamp-2 transition group-hover:opacity-75">{result.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{result.description}</p>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[color:var(--color-text-secondary)]">
        <SearchPreviewActions kind="knowledge" targetId={result.post.id} likes={result.post.likes} />
        <span className="px-1">{result.post.comments} comments</span>
        <Link href={result.destinationUrl} className="ml-auto inline-flex min-h-10 items-center gap-1 px-1 text-[color:var(--color-text-primary)]">Open post <ArrowUpRight size={14} /></Link>
      </div>
    </article>
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
  if (result.type === "concept") return <ConceptSearchResultCard result={result} />;
  if (result.type === "book") return <BookSearchResultCard result={result} featured />;
  if (result.type === "discussion") return <DiscussionSearchResultCard result={result} featured />;
  if (result.type === "knowledge_post") return <KnowledgePostSearchResultCard result={result} />;
  return <ReadingPathSearchResultCard result={result} featured />;
}

function ConceptSearchResultCard({ result }: { result: KnowledgeConceptResult }) {
  const { concept } = result;
  return (
    <article className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] md:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-hairline)] pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="caption">{concept.category}</span>
            <span className="rounded-full bg-[#f7f1e5] px-3 py-1 text-xs font-medium text-[color:var(--color-accent)]">Source-aware</span>
          </div>
          <h3 className="title-2 mt-3">{concept.name}</h3>
          <p className="mt-2 text-base font-medium text-[color:var(--color-text-secondary)]">{concept.question}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[color:var(--color-soft-fill)] text-[color:var(--color-accent)]">
          <Lightbulb size={21} strokeWidth={1.8} />
        </span>
      </div>

      <div className="grid gap-5 py-5 md:grid-cols-2 md:gap-8">
        <div>
          <p className="caption text-[10px]">In simple terms</p>
          <p className="mt-2 text-[17px] leading-7 text-[color:var(--color-text-primary)]">{concept.definition}</p>
        </div>
        <div>
          <p className="caption text-[10px]">Why it is useful</p>
          <p className="mt-2 text-[15px] leading-6 text-[color:var(--color-text-secondary)]">{concept.whyItMatters}</p>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-hairline)]">
        <details className="group border-b border-[color:var(--color-hairline)] py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
            See a real-life example <span className="text-lg text-[color:var(--color-text-muted)] group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-[760px] text-sm leading-6 text-[color:var(--color-text-secondary)]">{concept.practicalExample}</p>
        </details>
        <details className="group border-b border-[color:var(--color-hairline)] py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
            <span className="inline-flex items-center gap-2"><CircleAlert size={16} /> What people often get wrong</span>
            <span className="text-lg text-[color:var(--color-text-muted)] group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-[760px] text-sm leading-6 text-[color:var(--color-text-secondary)]">{concept.misconception}</p>
        </details>
      </div>

      <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[color:var(--color-text-primary)]">Continue with books and reader perspectives below.</p>
        <a href={concept.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">
          Check the source <ArrowUpRight size={15} />
        </a>
      </div>
    </article>
  );
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
    <article className={`rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] ${featured ? "md:p-7" : ""}`}>
      <Link href={result.destinationUrl} className="group block">
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
      </Link>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <SearchPreviewActions kind="discussion" targetId={result.discussion.id} likes={result.discussion.likes} saves={result.discussion.saves} />
        <span className="inline-flex items-center gap-1"><MessageCircle size={16} /> {result.discussion.comments} comments</span>
        <Link href={result.destinationUrl} className="inline-flex min-h-10 items-center gap-1 px-1 text-[color:var(--color-text-primary)]">Open thread <ArrowUpRight size={15} /></Link>
      </div>
    </article>
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

function NoResultsState({ query, onSelectQuery }: { query: string; onSelectQuery: (query: string) => void }) {
  return (
    <section className="mt-16 max-w-[820px] rounded-[36px] bg-white p-8 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] md:p-10">
      <div className="mb-6 grid size-14 place-items-center rounded-full bg-[#f7f1e5] text-[color:var(--color-accent)]">
        <BookOpen size={24} strokeWidth={1.8} />
      </div>
      <p className="caption mb-3">No strong match yet</p>
      <h2 className="title-1">This part of the library is still growing.</h2>
      <p className="body-copy mt-4 max-w-[660px]">We could not confidently connect this search to a book, concept, or reader experience. BookSphere would rather say that clearly than recommend something unrelated.</p>
      <div className="mt-8 flex flex-wrap gap-3">
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
