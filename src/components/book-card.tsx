import Link from "next/link";
import { Book, DiscoverySignal } from "@/lib/types";
import { getBookActivityLine, getBookShelfBadge } from "@/lib/data";
import { BookCover } from "./book-cover";
import { bookCoverData } from "@/lib/book-cover-data";

export function BookCard({
  book,
  compact = false,
  priority = false,
  badge,
  signal = "discussions"
}: {
  book: Book;
  compact?: boolean;
  priority?: boolean;
  badge?: string;
  signal?: DiscoverySignal;
}) {
  return (
    <Link
      href={`/book/${book.id}`}
      className={compact ? "group block w-[138px] shrink-0 snap-start md:w-[164px]" : "group block w-[168px] shrink-0 snap-start md:w-[214px]"}
    >
      <BookCover
        book={bookCoverData(book)}
        priority={priority}
        className="interactive-lift w-full group-hover:shadow-[0_22px_46px_rgba(0,0,0,0.16)]"
      />
      <div className="mt-3">
        <p className="caption line-clamp-1 text-[10px]">{badge || getBookShelfBadge(book)}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-[1.18] tracking-[-0.03em] text-[color:var(--color-text-primary)] md:text-[17px]">
          {book.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-[13px] font-medium text-[color:var(--color-text-secondary)] md:text-sm">{book.author}</p>
        {!compact && (
          <p className="mt-2 line-clamp-2 text-[12px] font-normal leading-5 text-[color:var(--color-text-secondary)]">
            {book.whyMatters}
          </p>
        )}
        <p className="mt-2 line-clamp-1 text-[12px] font-medium text-[color:var(--color-text-muted)]">{getBookActivityLine(book, signal)}</p>
      </div>
    </Link>
  );
}
