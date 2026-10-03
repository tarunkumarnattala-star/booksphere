"use client";

import type { BookSearchResult } from "@/lib/search";
import { BookCover } from "@/components/book-cover";

type SearchResultsPanelProps = {
  query: string;
  results: BookSearchResult[];
  isOpen: boolean;
  onSelectBook: (bookId: string) => void;
  contextGenre?: string;
  selectedIndex?: number;
};

export function SearchResultsPanel({
  query,
  results,
  isOpen,
  onSelectBook,
  contextGenre,
  selectedIndex = 0
}: SearchResultsPanelProps) {
  const trimmedQuery = query.trim();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const suggestHref = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent("Book suggestion for BookSphere")}&body=${encodeURIComponent(`Please add: ${trimmedQuery}`)}`
    : null;

  if (!isOpen || !trimmedQuery) return null;

  const selectedBookId = results[selectedIndex]?.book.id;
  const insideResults = contextGenre ? results.filter((result) => result.inCurrentGenre) : results;
  const outsideResults = contextGenre ? results.filter((result) => !result.inCurrentGenre) : [];

  // Both groups were rendered with a fresh local index compared against one shared
  // selectedIndex, so with an "outside this genre" group present, index 0 highlighted the
  // first row of BOTH groups, and any arrow-key position past the inside group highlighted a
  // row that was not the one Enter opens. An index offset would only be right if `results`
  // happened to be ordered inside-group-first, which nothing guarantees - the caller indexes
  // the unpartitioned array. Match on identity instead, which is correct under any ordering.
  function renderResults(items: BookSearchResult[]) {
    return (
      <ol className="records records-tight">
        {items.map((result) => {
          const { book } = result;
          const label = result.isGlobalFallback
            ? `Found outside ${contextGenre || "this genre"}`
            : result.matchReason;

          return (
            <li key={book.id} className={`record record-media ${book.id === selectedBookId ? "bg-[color:var(--band)]" : ""}`}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelectBook(book.id)}
                className="block w-full text-left md:w-[96px]"
                tabIndex={-1}
                aria-hidden="true"
              >
                <BookCover book={book} />
              </button>
              <div className="min-w-0">
                <h3 className="record-title">
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onSelectBook(book.id)} className="text-left transition-colors hover:text-[color:var(--accent)]">
                    {book.title}
                  </button>
                </h3>
                <p className="record-meta !mt-2">{book.author}</p>
                <p className="record-text line-clamp-2">{book.description || book.whyMatters}</p>
                <p className="record-writer">{label}</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div aria-live="polite" className="mt-8">
      {results.length > 0 ? (
        <>
          <p className="caption caption-muted">
            <span className="numeral">{results.length}</span> {results.length === 1 ? "book" : "books"}
          </p>
          {insideResults.length > 0 && renderResults(insideResults)}
          {outsideResults.length > 0 && (
            <div className="mt-8">
              <p className="caption caption-muted">Found outside {contextGenre}</p>
              {renderResults(outsideResults)}
            </div>
          )}
        </>
      ) : (
        <div className="border-t border-[color:var(--rule-strong)] pt-5">
          <p className="caption">Not here yet</p>
          <h3 className="title-1 mt-4 max-w-[20ch]">We do not have this one.</h3>
          <p className="body-copy measure mt-5">
            BookSphere is starting with a focused library. Tell us what is missing and it goes on the list.
          </p>
          {/* This was a <button> with no onClick, no form and no handler - the only control
              in the one state where a reader has told us what is missing, and pressing it
              did nothing. It now actually sends the suggestion, carrying what they typed. */}
          {suggestHref && (
            <a href={suggestHref} className="btn-ink btn-sm mt-5">
              Suggest this book
            </a>
          )}
        </div>
      )}
    </div>
  );
}
