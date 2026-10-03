"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchResultsPanel } from "@/components/search-results-panel";
import { searchBooks } from "@/lib/search";
import { books as catalogBooks } from "@/lib/data";

export function GenreBookSearch({ genreName }: { genreName: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
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
    <section className="section-rule">
      <label className="field-label">
        <span className="caption">Find a book in {genreName}</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search within ${genreName}`}
          autoComplete="off"
          spellCheck={false}
          className="field"
        />
      </label>
      {hasQuery && (
        <button type="button" onClick={() => updateQuery("")} className="control mt-2">
          Clear
        </button>
      )}
      <SearchResultsPanel
        query={query}
        results={results}
        isOpen={hasQuery}
        selectedIndex={selectedIndex}
        contextGenre={genreName}
        onSelectBook={openBook}
      />
    </section>
  );
}
