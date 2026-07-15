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

  if (!isOpen || !trimmedQuery) return null;

  const insideResults = contextGenre ? results.filter((result) => result.inCurrentGenre) : results;
  const outsideResults = contextGenre ? results.filter((result) => !result.inCurrentGenre) : [];

  function renderResults(items: BookSearchResult[]) {
    return (
      <div className="space-y-2">
        {items.map((result, index) => {
          const { book } = result;
          const label = result.isGlobalFallback
            ? `Found outside ${contextGenre || "this genre"}`
            : result.matchReason;

          return (
            <button
              key={book.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelectBook(book.id)}
              className={`group grid w-full min-h-11 grid-cols-[52px_1fr] gap-3 rounded-[18px] p-2 text-left transition sm:grid-cols-[58px_1fr_auto] ${
                index === selectedIndex ? "bg-black/[0.055]" : "hover:bg-black/[0.035]"
              }`}
            >
              <BookCover book={book} className="!rounded-[12px]" />
              <span className="min-w-0 py-0.5">
                <span className="caption block text-[10px]">{label}</span>
                <span className="mt-1 block line-clamp-1 text-[15px] font-medium leading-tight tracking-[-0.02em] text-[color:var(--color-text-primary)]">
                  {book.title}
                </span>
                <span className="mt-0.5 block truncate text-sm text-[color:var(--color-text-secondary)]">{book.author}</span>
                <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-[color:var(--color-text-secondary)]">
                  {book.description || book.whyMatters}
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {book.genres.slice(0, 2).map((genre) => (
                    <span key={genre} className="rounded-full bg-black/[0.045] px-2 py-1 text-[11px] font-medium text-[color:var(--color-text-secondary)]">
                      {genre}
                    </span>
                  ))}
                </span>
              </span>
              <span className="hidden self-center rounded-full bg-black/[0.045] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)] transition group-hover:bg-black group-hover:!text-white sm:inline-flex">
                Open
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="relative z-10 mt-4 overflow-hidden rounded-[24px] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.07]"
    >
      <div className="p-3 sm:p-4">
        {results.length > 0 ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="caption text-[10px]">Instant results</p>
              <p className="text-xs font-medium text-[color:var(--color-text-muted)]">
                {results.length} {results.length === 1 ? "book" : "books"}
              </p>
            </div>
            {insideResults.length > 0 && renderResults(insideResults)}
            {outsideResults.length > 0 && (
              <div className="mt-5 border-t border-[color:var(--color-hairline)] pt-4">
                <p className="caption mb-3 text-[10px]">Found outside {contextGenre}</p>
                {renderResults(outsideResults)}
              </div>
            )}
          </>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="grid size-12 place-items-center rounded-full bg-black/[0.055] text-[color:var(--color-text-secondary)]">
              <span className="text-lg" aria-hidden="true">?</span>
            </div>
            <p className="mt-4 text-base font-medium tracking-[-0.02em] text-[color:var(--color-text-primary)]">We do not have this yet.</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--color-text-secondary)]">
              BookSphere is starting with a focused knowledge library. We are working hard to bring more books, perspectives, and reading paths into the app.
            </p>
            <button
              type="button"
              className="mt-4 rounded-full bg-[color:var(--color-text-primary)] px-4 py-2.5 text-sm font-medium !text-white transition hover:opacity-85"
            >
              Suggest this book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
