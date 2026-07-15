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

  useEffect(() => {
    if (fallbackUrl || failed) return;

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
        if (resolved) setCoverUrl(resolved);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [book.author, book.isbn, book.title, failed, fallbackUrl]);

  if (coverUrl && !failed) {
    return (
      <div className={`relative aspect-[2/3] overflow-hidden rounded-[18px] bg-white shadow-[var(--shadow-cover)] ring-1 ring-black/[0.04] ${className}`}>
        <Image
          src={coverUrl}
          alt={`${book.title} cover`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 42vw, 220px"
          className="object-cover transition duration-200 ease-out group-hover:scale-[1.018]"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex aspect-[2/3] overflow-hidden rounded-[18px] bg-white shadow-[var(--shadow-cover)] ring-1 ring-black/[0.04] ${className}`}>
      <div className={`absolute inset-0 bg-[linear-gradient(115deg,#ece8df,#f8f6f1_45%,#e8e1d6)] ${failed ? "" : "animate-pulse"}`} />
      <div className="relative z-10 m-auto flex h-[72%] w-[72%] items-center justify-center rounded-[14px] border border-black/[0.06] bg-white/65 p-3 text-center text-xs font-medium leading-4 text-[color:var(--color-text-secondary)]">
        {failed ? book.title : <span className="sr-only">Loading cover</span>}
      </div>
    </div>
  );
}
