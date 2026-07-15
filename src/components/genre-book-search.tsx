"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { SearchResultsPanel } from "@/components/search-results-panel";
import { BookSearchResult, searchBooks } from "@/lib/search";
import { books as catalogBooks } from "@/lib/data";

export function GenreBookSearch({ genreName }: { genreName: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const books = useMemo(() => catalogBooks.filter((book) => book.genres.includes(genreName)), [genreName]);
  const hasQuery = query.trim().length > 0;
  const results = useMemo(
    () => searchBooks(query, {
      books: catalogBooks,
      genreName,
      includeGlobalFallback: true,
      limit: 8,
      minQueryLength: 1
    }),
    [genreName, query]
  );
  const previewBooks = books.slice(0, 4).map((book) => ({
    book,
    score: 0,
    matchReason: "Book match" as const,
    inCurrentGenre: true,
    isGlobalFallback: false
  }));

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setSelectedIndex(0);
  }

  function openBook(bookId: string) {
    router.push(`/book/${bookId}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      updateQuery("");
      return;
    }

    if (!hasQuery) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && results[0]) {
      event.preventDefault();
      openBook(results[selectedIndex]?.book.id || results[0].book.id);
    }
  }

  return (
    <section className="container-page py-6 md:py-8">
      <div className="rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] md:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div className="relative z-[80]">
            <p className="caption mb-2">Find in {genreName}</p>
            <h2 className="title-2">Is the book you want here?</h2>
            <p className="subheadline mt-2">Search within {genreName}. If the book lives elsewhere in BookSphere, we will show that too.</p>
            <div className="relative mt-5 flex items-center gap-3 rounded-[22px] bg-black/[0.035] px-4 py-3 ring-1 ring-transparent transition focus-within:ring-black/20">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[color:var(--color-text-muted)]">
                <Search size={20} />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search within ${genreName}`}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-[17px] font-medium tracking-[-0.02em] outline-none placeholder:text-[color:var(--color-text-muted)]"
              />
              {hasQuery && (
                <button
                  type="button"
                  onClick={() => updateQuery("")}
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[color:var(--color-text-secondary)] transition hover:bg-black hover:!text-white"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {hasQuery && (
              <p className="footnote mt-3">
                {results.length ? `${results.length} ${results.length === 1 ? "book" : "books"} ready to open.` : "No match yet. You can suggest it."}
              </p>
            )}
            <SearchResultsPanel
              query={query}
              results={results}
              isOpen={hasQuery}
              selectedIndex={selectedIndex}
              contextGenre={genreName}
              onSelectBook={openBook}
            />
          </div>

          {!hasQuery && (
            <div className="grid gap-3 md:grid-cols-2">
              {previewBooks.map((result) => (
                <GenreSearchPreviewCard key={result.book.id} result={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GenreSearchPreviewCard({ result }: { result: BookSearchResult }) {
  const { book } = result;

  return (
    <Link
      href={`/book/${book.id}`}
      className="interactive-lift group grid min-w-0 grid-cols-[58px_1fr_auto] gap-3 rounded-[22px] p-3 transition hover:bg-black/[0.025]"
    >
      <BookCover book={book} className="w-full rounded-[12px] shadow-[0_10px_24px_rgba(0,0,0,0.10)]" />
      <div className="min-w-0">
        <p className="caption line-clamp-1 text-[10px]">{book.genres[0]}</p>
        <h3 className="mt-1 line-clamp-2 text-[16px] font-medium leading-[1.18] tracking-[-0.025em] text-[color:var(--color-text-primary)]">{book.title}</h3>
        <p className="mt-1 truncate text-sm text-[color:var(--color-text-secondary)]">{book.author}</p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[color:var(--color-text-secondary)]">{book.whyMatters}</p>
      </div>
      <ArrowUpRight className="mt-2 text-[color:var(--color-text-muted)] opacity-0 transition group-hover:opacity-100" size={17} />
    </Link>
  );
}
