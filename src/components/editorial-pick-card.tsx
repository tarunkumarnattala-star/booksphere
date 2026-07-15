import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DiscussionPost, EditorialPick } from "@/lib/types";
import { getBook } from "@/lib/data";
import { BookCover } from "./book-cover";
import { bookCoverData } from "@/lib/book-cover-data";

export function EditorialPickCard({ pick, post }: { pick: EditorialPick; post: DiscussionPost }) {
  const book = getBook(post.bookId);
  if (!book) return null;

  return (
    <Link href={`/book/${book.id}#discussions`} className="interactive-lift group grid w-[82vw] max-w-[420px] shrink-0 snap-start grid-cols-[76px_1fr] gap-4 rounded-[28px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:w-[390px]">
      <BookCover book={bookCoverData(book)} className="w-full rounded-[14px]" />
      <div className="min-w-0">
        <p className="caption text-[10px]">Worth Reading</p>
        <h3 className="headline mt-2 line-clamp-2 text-[color:var(--color-text-primary)]">{pick.title}</h3>
        <p className="footnote mt-2 line-clamp-3">{pick.description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[color:var(--color-text-primary)]">
          Open thread <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}
