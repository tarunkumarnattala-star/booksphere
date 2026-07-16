"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, CircleDollarSign, Lightbulb, MessageCircle, Rocket, Search, Target, X } from "lucide-react";
import { searchBooks } from "@/lib/search";
import { SearchResultsPanel } from "@/components/search-results-panel";
import type { Book } from "@/lib/types";

const quickQueries = [
  { label: "investment", icon: CircleDollarSign },
  { label: "psychology", icon: Brain },
  { label: "habits", icon: Target },
  { label: "startups", icon: Rocket },
  { label: "communication", icon: MessageCircle },
  { label: "finance", icon: Lightbulb }
];

export function HeroInlineSearch({ books }: { books: Book[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasQuery = query.trim().length > 0;
  const results = useMemo(
    () => searchBooks(query, { books, includeGlobalFallback: true, limit: 8, minQueryLength: 1 }),
    [books, query]
  );

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setSelectedIndex(0);
  }

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const syncFromDom = () => {
      const nextQuery = input.value;
      if (nextQuery !== query) {
        setQuery(nextQuery);
        setSelectedIndex(0);
      }
    };

    input.addEventListener("input", syncFromDom);
    input.addEventListener("keyup", syncFromDom);
    input.addEventListener("search", syncFromDom);
    const interval = window.setInterval(syncFromDom, 120);

    return () => {
      input.removeEventListener("input", syncFromDom);
      input.removeEventListener("keyup", syncFromDom);
      input.removeEventListener("search", syncFromDom);
      window.clearInterval(interval);
    };
  }, [query]);

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
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-[17px] font-medium tracking-[-0.02em] outline-none placeholder:text-[color:var(--color-text-muted)]"
          />
          {!hasQuery && <p className="mt-0.5 text-xs font-medium text-[color:var(--color-text-muted)]">Try investment, psychology, or habits</p>}
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

      {!hasQuery && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickQueries.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => updateQuery(label)}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-white/82 px-3.5 py-2 text-xs font-medium text-[color:var(--color-text-primary)] shadow-[0_8px_22px_rgba(0,0,0,0.045)] ring-1 ring-black/[0.025] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-text-primary)] hover:!text-white"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black/[0.045] text-[color:var(--color-accent)] transition group-hover:bg-white/14 group-hover:!text-white">
                <Icon size={13} strokeWidth={2} />
              </span>
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      )}

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
