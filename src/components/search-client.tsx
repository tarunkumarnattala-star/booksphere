"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCover } from "@/components/book-cover";
import { FeedComposer } from "@/components/feed-composer";
import { SearchPreviewActions } from "@/components/search-preview-actions";
import { featuredKnowledgeConcepts } from "@/lib/concepts";
import { books, discussions, genres, knowledgePosts, readingPaths } from "@/lib/data";
import { searchKnowledge } from "@/lib/search";
import { KnowledgeBookResult, KnowledgeConceptResult, KnowledgeDiscussionResult, KnowledgePostResult, KnowledgeReadingPathResult, KnowledgeSearchResult } from "@/lib/search";
import { DiscussionPost, KnowledgePost } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

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
    <div>
      {focusedConcept ? (
        <Link href="/search" className="caption caption-muted inline-flex min-h-11 items-center transition-colors hover:text-[color:var(--ink)]">
          Back to all books
        </Link>
      ) : (
        // The field is the page. It used to sit 900px down, under eighteen genre pills and
        // five reading-path cards, on the one screen whose job is finding one of 394 books.
        <form data-onboarding="search" onSubmit={handleSubmit} className="mt-8">
          <label>
            <span className="sr-only">Search books, concepts, questions, or goals</span>
            <input
              ref={inputRef}
              data-onboarding-search-input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="A title, an author, an idea, a question"
              className="field !min-h-[64px] !text-[18px]"
            />
          </label>
        </form>
      )}

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
    <>
      {/* Three ways to reach a book, in the order they are useful: type it, pick a shelf,
          or follow a sequence. The six "Start with a goal" buttons that used to sit here
          were canned searches for things the genres and the paths already cover. */}
      <section className="section-rule">
        <p className="caption">Browse by genre</p>
        <p className="mt-5 text-[15px] leading-[1.9]">
          {genres.map((genre, index) => (
            <span key={genre.slug}>
              {index > 0 && <span className="text-[color:var(--ink-50)]">{"  \u00b7  "}</span>}
              <Link href={`/genre/${genre.slug}`} prefetch={false} className="underline decoration-[color:var(--rule)] decoration-1 underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">
                {genre.name}
              </Link>
            </span>
          ))}
        </p>
      </section>

      {readingPaths.length > 0 && (
        <section className="section-rule">
          <p className="caption">Or follow a reading path</p>
          <ol className="records records-tight">
            {readingPaths.map((path) => (
              <li key={path.slug} className="record">
                <p className="caption record-stamp numeral">
                  {path.bookIds.length} books
                </p>
                <div className="min-w-0">
                  <h2 className="record-title">
                    <Link href={`/path/${path.slug}`} className="transition-colors hover:text-[color:var(--accent)]">{path.title}</Link>
                  </h2>
                  <p className="record-text">{path.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="section-rule">
        <p className="caption">Or start from an idea</p>
        <ol className="records records-tight">
          {featuredKnowledgeConcepts.map((concept) => (
            <li key={concept.id} className="record">
              <p className="caption record-stamp">{concept.name}</p>
              <div className="min-w-0">
                <button type="button" onClick={() => onSelect(concept.name)} className="record-title block text-left transition-colors hover:text-[color:var(--accent)]">
                  {concept.question}
                </button>
                <p className="record-text">{concept.definition}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
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
    <div>
      {!results.concept && results.interpretedIntent && (
        <p className="mt-5 flex flex-wrap items-baseline gap-x-3 border-t border-[color:var(--rule)] pt-4">
          <span className="caption caption-muted">Understood as</span>
          <span className="text-[15px]">{results.interpretedIntent}</span>
        </p>
      )}

      {results.bestMatch && (
        <section className="section-rule" id={results.bestMatch.type === "concept" ? "concept-result" : undefined}>
          {/* A concept entry prints its own category label, so an outer "The idea" label
              above it put two mono labels on consecutive lines saying nearly the same thing. */}
          {results.bestMatch.type !== "concept" && <p className="caption">Closest match</p>}
          <div className={results.bestMatch.type === "concept" ? "" : "mt-5"}>
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
        title={results.concept ? "Books that explain it" : "Books"}
        isEmpty={!results.books.length}
      >
        <ol className="records records-tight">
          {results.books.map((result) => <BookSearchResultCard key={result.id} result={result} />)}
        </ol>
      </SearchResultGroup>

      {!results.concept && (
        <SearchResultGroup
          title="Perspectives and notes"
          isEmpty={!results.discussions.length && !results.knowledgePosts.length}
        >
          <ol className="records records-tight">
            {results.knowledgePosts.filter((result) => result.id !== results.bestMatch?.id).map((result) => <KnowledgePostSearchResultCard key={result.id} result={result} />)}
            {results.discussions.filter((result) => result.id !== results.bestMatch?.id).map((result) => <DiscussionSearchResultCard key={result.id} result={result} />)}
          </ol>
        </SearchResultGroup>
      )}

      {!results.concept && (
        <SearchResultGroup title="Reading paths" isEmpty={!results.readingPaths.length}>
          <ol className="records records-tight">
            {results.readingPaths.map((result) => <ReadingPathSearchResultCard key={result.id} result={result} />)}
          </ol>
        </SearchResultGroup>
      )}

      {results.relatedIdeas.length > 0 && <TermRow label="Related ideas" terms={results.relatedIdeas} onSelect={onSelectQuery} />}
      {!results.concept && results.readersAlsoContinuedWith.length > 0 && <ContinuedWith books={results.readersAlsoContinuedWith} />}
      {!results.concept && results.relatedSearches.length > 0 && <TermRow label="Other ways to ask" terms={results.relatedSearches} onSelect={onSelectQuery} />}
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
    <section className="section-rule" id="concept-conversation">
      <p className="caption">What people made of it</p>
      {hasConversation ? (
        <ol className="records records-tight">
          {visiblePosts.map((result) => <KnowledgePostSearchResultCard key={result.id} result={result} />)}
          {visibleDiscussions.map((result) => <DiscussionSearchResultCard key={result.id} result={result} />)}
        </ol>
      ) : (
        <p className="body-copy measure mt-5">Nobody has written about {conceptName} yet.</p>
      )}
      <div className="control-row mt-5">
        <button type="button" onClick={() => setSharing((value) => !value)} aria-expanded={sharing} className="btn-quiet btn-sm">
          Write what happened when you tried it
        </button>
      </div>
      {sharing && (
        <div className="mt-5">
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
    <li className="record">
      <p className="caption record-stamp">{result.post.topic || "Note"}</p>
      <div className="min-w-0">
        <h3 className="record-title">
          <Link href={result.destinationUrl} className="transition-colors hover:text-[color:var(--accent)]">{result.title}</Link>
        </h3>
        <p className="record-text line-clamp-3">{result.description}</p>
        <p className="record-writer !mt-5">Written by {result.post.authorName || "a reader"}</p>
        <div className="control-row mt-2">
          <SearchPreviewActions kind="knowledge" targetId={result.post.id} likes={result.post.likes} />
        </div>
      </div>
    </li>
  );
}

function BestMatchCard({ result }: { result: KnowledgeSearchResult }) {
  if (result.type === "concept") return <ConceptSearchResultCard result={result} />;
  if (result.type === "book") return <ol className="records records-tight"><BookSearchResultCard result={result} /></ol>;
  if (result.type === "discussion") return <ol className="records records-tight"><DiscussionSearchResultCard result={result} /></ol>;
  if (result.type === "knowledge_post") return <ol className="records records-tight"><KnowledgePostSearchResultCard result={result} /></ol>;
  return <ol className="records records-tight"><ReadingPathSearchResultCard result={result} /></ol>;
}

// The one editorial explainer in the product. It is set as a short entry in a reference
// work: the term, the question it answers, what it means, what it is good for, an example,
// the common misreading, and the source - all printed, none of it behind a disclosure
// triangle, because every one of those paragraphs is two sentences long.
function ConceptSearchResultCard({ result }: { result: KnowledgeConceptResult }) {
  const { concept } = result;
  return (
    <div>
      <p className="caption caption-muted">{concept.category}</p>
      <h2 className="large-title mt-4 max-w-[16ch]">{concept.name}</h2>
      <p className="lead mt-4">{concept.question}</p>

      <dl className="mt-8 grid gap-8 border-t border-[color:var(--rule-strong)] pt-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-x-5 md:gap-y-5">
        <dt className="caption caption-muted">In simple terms</dt>
        <dd className="prose-perspective m-0">{concept.definition}</dd>
        <dt className="caption caption-muted border-t border-[color:var(--rule)] pt-5 md:col-start-1">Why it is useful</dt>
        <dd className="body-copy measure m-0 border-t-0 md:border-t md:border-[color:var(--rule)] md:pt-5">{concept.whyItMatters}</dd>
        <dt className="caption caption-muted border-t border-[color:var(--rule)] pt-5 md:col-start-1">In real life</dt>
        <dd className="body-copy measure m-0 md:border-t md:border-[color:var(--rule)] md:pt-5">{concept.practicalExample}</dd>
        <dt className="caption caption-muted border-t border-[color:var(--rule)] pt-5 md:col-start-1">Often got wrong</dt>
        <dd className="body-copy measure m-0 md:border-t md:border-[color:var(--rule)] md:pt-5">{concept.misconception}</dd>
      </dl>

      <p className="mt-5 flex flex-wrap items-baseline gap-x-5 border-t border-[color:var(--rule)] pt-4">
        <span className="caption caption-muted">Source</span>
        <a href={concept.source.url} target="_blank" rel="noreferrer" className="footnote text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] decoration-1 underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">
          {concept.source.label}
        </a>
      </p>
    </div>
  );
}

function SearchResultGroup({ title, isEmpty, children }: { title: string; isEmpty: boolean; children: ReactNode }) {
  if (isEmpty) return null;
  return (
    <section className="section-rule">
      <p className="caption">{title}</p>
      {children}
    </section>
  );
}

function BookSearchResultCard({ result }: { result: KnowledgeBookResult; featured?: boolean }) {
  return (
    <li className="record record-media">
      <Link href={result.destinationUrl} className="block w-full md:w-[96px]" tabIndex={-1} aria-hidden="true">
        <BookCover book={result.book} className="w-full" />
      </Link>
      <div className="min-w-0">
        <h3 className="record-title">
          <Link href={result.destinationUrl} className="transition-colors hover:text-[color:var(--accent)]">{result.title}</Link>
        </h3>
        <p className="record-meta !mt-2">{result.subtitle}</p>
        <p className="record-text line-clamp-2">{result.description}</p>
        <p className="record-writer">{result.matchReason}</p>
      </div>
    </li>
  );
}

function DiscussionSearchResultCard({ result }: { result: KnowledgeDiscussionResult; featured?: boolean }) {
  return (
    <li className="record">
      <p className="caption record-stamp">{result.discussion.postType}</p>
      <div className="min-w-0">
        <h3 className="record-title">
          <Link href={result.destinationUrl} className="transition-colors hover:text-[color:var(--accent)]">{result.title}</Link>
        </h3>
        <p className="record-text line-clamp-3">{result.description}</p>
        <p className="record-meta">{result.subtitle}</p>
        <p className="record-writer">{result.matchReason}</p>
        <div className="control-row mt-2">
          <SearchPreviewActions kind="discussion" targetId={result.discussion.id} likes={result.discussion.likes} saves={result.discussion.saves} />
        </div>
      </div>
    </li>
  );
}

function ReadingPathSearchResultCard({ result }: { result: KnowledgeReadingPathResult; featured?: boolean }) {
  return (
    <li className="record">
      <p className="caption record-stamp numeral">{result.books.length} books</p>
      <div className="min-w-0">
        <h3 className="record-title">
          <Link href={result.destinationUrl} className="transition-colors hover:text-[color:var(--accent)]">{result.title}</Link>
        </h3>
        <p className="record-text line-clamp-2">{result.description}</p>
        <p className="record-writer">{result.matchReason}</p>
      </div>
    </li>
  );
}

function TermRow({ label, terms, onSelect }: { label: string; terms: string[]; onSelect: (query: string) => void }) {
  return (
    <section className="mt-8 border-t border-[color:var(--rule)] pt-4">
      <div className="control-row">
        <span className="caption caption-muted">{label}</span>
        {terms.map((term) => (
          <button key={term} type="button" onClick={() => onSelect(term)} className="control control-lead">
            {term}
          </button>
        ))}
      </div>
    </section>
  );
}

// Was "Readers also continued with...", which describes reader behaviour this product does
// not record. The list is computed from the book graph, so it says so.
function ContinuedWith({ books: continuedBooks }: { books: KnowledgeBookResult[] }) {
  return (
    <section className="section-rule">
      <p className="caption">Next in the same direction</p>
      <p className="body-copy measure mt-4">Chosen from how the books relate to each other, not from what anyone read.</p>
      <ol className="records records-tight">
        {continuedBooks.map((result) => (
          <li key={result.id} className="record record-media">
            <Link href={result.destinationUrl} className="block w-full md:w-[96px]" tabIndex={-1} aria-hidden="true">
              <BookCover book={result.book} className="w-full" />
            </Link>
            <div className="min-w-0">
              <h3 className="record-title">
                <Link href={result.destinationUrl} className="transition-colors hover:text-[color:var(--accent)]">{result.title}</Link>
              </h3>
              <p className="record-meta !mt-2">{result.subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function NoResultsState({ query, onSelectQuery }: { query: string; onSelectQuery: (query: string) => void }) {
  return (
    <section className="section-rule">
      <p className="caption">No strong match</p>
      <h2 className="title-1 mt-4 max-w-[20ch]">This part of the library is still growing.</h2>
      <p className="body-copy measure mt-5">
        Nothing here connects confidently to &ldquo;{query}&rdquo;. BookSphere would rather say that
        than put an unrelated book in front of you.
      </p>
      <div className="control-row mt-5">
        <span className="caption caption-muted">Try</span>
        {["habits", "money", "communication"].map((fallback) => (
          <button key={fallback} type="button" onClick={() => onSelectQuery(fallback)} className="control control-lead">
            {fallback}
          </button>
        ))}
      </div>
    </section>
  );
}
