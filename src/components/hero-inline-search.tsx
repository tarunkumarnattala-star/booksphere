"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchBooks } from "@/lib/search";
import { SearchResultsPanel } from "@/components/search-results-panel";
import type { Book } from "@/lib/types";

export function HeroInlineSearch({ books, initialQuery = "" }: { books: Book[]; initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSyncedRef = useRef(initialQuery);
  const hasQuery = query.trim().length > 0;
  const results = useMemo(
    () => searchBooks(query, { books, includeGlobalFallback: true, limit: 8, minQueryLength: 1 }),
    [books, query]
  );

  function updateQuery(nextQuery: string) {
    lastSyncedRef.current = nextQuery;
    setQuery(nextQuery);
    setSelectedIndex(0);
    const url = new URL(window.location.href);
    if (nextQuery.trim()) {
      url.searchParams.set("q", nextQuery);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }

  // The poll stays: it is what catches an autofill or password-manager write that fires no
  // input event, and a synthetic value change that React never sees has already produced one
  // false alarm on this project. What it should not do is depend on `query` - that tore down
  // and rebuilt three listeners and a timer on every keystroke - or wake eight times a
  // second on the first screen after login, which is measurable battery on a phone. The last
  // value lives in a ref instead, so the effect runs once, and the interval is a backstop for
  // the events above rather than the primary path.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const syncFromDom = () => {
      const nextQuery = input.value;
      if (nextQuery !== lastSyncedRef.current) {
        lastSyncedRef.current = nextQuery;
        setQuery(nextQuery);
        setSelectedIndex(0);
      }
    };

    input.addEventListener("input", syncFromDom);
    input.addEventListener("keyup", syncFromDom);
    input.addEventListener("search", syncFromDom);
    const interval = window.setInterval(syncFromDom, 500);

    return () => {
      input.removeEventListener("input", syncFromDom);
      input.removeEventListener("keyup", syncFromDom);
      input.removeEventListener("search", syncFromDom);
      window.clearInterval(interval);
    };
  }, []);

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
    <div className="relative z-[80] mt-7 max-w-2xl">
      <div className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] transition focus-within:ring-black/20">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black/[0.055]">
          <Search size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onInput={(event) => updateQuery(event.currentTarget.value)}
            onKeyUp={(event) => updateQuery(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search books, authors, genres, ideas"
            // A placeholder is not an accessible name - it vanishes on focus, and a screen
            // reader announced this as an unnamed edit field (WCAG 2.2 AA 4.1.2).
            aria-label="Search books, authors, genres, and ideas"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-[17px] font-medium tracking-[-0.02em] outline-none placeholder:text-[color:var(--color-text-muted)]"
          />
        </div>
        {hasQuery && (
          <button
            type="button"
            onClick={() => updateQuery("")}
            className="grid size-8 place-items-center rounded-full bg-black/[0.055] text-[color:var(--color-text-secondary)] transition hover:bg-black hover:!text-white"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <SearchResultsPanel
        query={query}
        results={results}
        isOpen={hasQuery}
        selectedIndex={selectedIndex}
        onSelectBook={openBook}
      />
    </div>
  );
}
