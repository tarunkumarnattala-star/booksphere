"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { BookCoverData } from "@/lib/book-cover-data";

function getOpenLibraryCoverUrl(isbn?: string) {
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg?default=false`;
}

export function BookCover({ book, priority = false, className = "" }: { book: BookCoverData; priority?: boolean; className?: string }) {
  const fallbackUrl = useMemo(() => book.coverUrl || null, [book.coverUrl]);
  const [coverUrl, setCoverUrl] = useState<string | null>(fallbackUrl);
  const [failed, setFailed] = useState(false);
  const [lookupFailed, setLookupFailed] = useState(false);

  useEffect(() => {
    // `fallbackUrl || failed` meant a stored cover that 404s never reached the API fallback:
    // onError set `failed`, and this effect then refused to look anything up. Retry once the
    // stored URL is known bad, and stop only when the lookup itself has already failed.
    if ((coverUrl && !failed) || lookupFailed) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      title: book.title,
      author: book.author
    });
    if (book.isbn) params.set("isbn", book.isbn);

    fetch(`/api/book-cover?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const resolved = data?.coverUrl || getOpenLibraryCoverUrl(book.isbn);
        // Nothing set `failed` when the API answered {coverUrl: null} or the fetch threw, so
        // the animate-pulse placeholder and its sr-only "Loading cover" ran for the life of
        // the page for any book both providers miss. A cover we cannot find is a finished
        // state, not a loading one: show the title.
        if (resolved) {
          setCoverUrl(resolved);
          setFailed(false);
        } else {
          setLookupFailed(true);
          setFailed(true);
        }
      })
      .catch((cause) => {
        if (cause?.name === "AbortError") return;
        setLookupFailed(true);
        setFailed(true);
      });

    return () => controller.abort();
  }, [book.author, book.isbn, book.title, coverUrl, failed, lookupFailed]);

  if (coverUrl && !failed) {
    return (
      <div className={`relative aspect-[2/3] overflow-hidden bg-[color:var(--band)] ring-1 ring-[color:var(--rule)] ${className}`}>
        <Image
          src={coverUrl}
          alt={`${book.title} cover`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 42vw, 220px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    // A cover we cannot find is set as a title page instead: the book's own title, ranged
    // left on the band, with a rule under it. No shimmer, no placeholder graphic.
    <div className={`relative flex aspect-[2/3] overflow-hidden bg-[color:var(--band)] ring-1 ring-[color:var(--rule)] ${className}`}>
      <div className="flex h-full w-full flex-col justify-end p-[8%]">
        <span className="h-px w-8 bg-[color:var(--rule-strong)]" aria-hidden="true" />
        {/* The title prints whether the cover has failed or has simply not arrived yet. A
            cover lookup can take a second or two per book, and an empty rectangle for that
            long reads as a broken image; a title page does not. */}
        <span className="mt-[6%] line-clamp-4 text-[11px] font-normal leading-[1.25] text-[color:var(--ink-70)]">
          {book.title}
        </span>
      </div>
    </div>
  );
}
