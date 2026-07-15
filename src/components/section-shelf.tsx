import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Book, DiscoverySignal } from "@/lib/types";
import { BookCard } from "./book-card";

export function SectionShelf({
  title,
  subtitle,
  books,
  href,
  compact = false,
  badge,
  signal = "discussions",
  maxItems = 6
}: {
  title: string;
  subtitle?: string;
  books: Book[];
  href?: string;
  compact?: boolean;
  badge?: string;
  signal?: DiscoverySignal;
  maxItems?: number;
}) {
  if (!books.length) return null;

  return (
    <section className="py-8 md:py-10">
      <div className="mb-5 flex items-end justify-between gap-6 px-4 md:px-6 lg:px-8">
        <div>
          <h2 className="title-2">{title}</h2>
          {subtitle && <p className="subheadline mt-2 max-w-2xl">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="hidden items-center gap-1 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)] md:flex">
            See All <ChevronRight size={15} />
          </Link>
        )}
      </div>
      <div className="shelf-scroll flex gap-5 overflow-x-auto px-4 pb-4 md:gap-6 md:px-6 lg:px-8">
        {books.slice(0, maxItems).map((book, index) => (
          <BookCard key={`${title}-${book.id}`} book={book} compact={compact} priority={index < 4} badge={badge} signal={signal} />
        ))}
      </div>
    </section>
  );
}
