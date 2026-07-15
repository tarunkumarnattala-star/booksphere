import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ReadingPath } from "@/lib/types";
import { getPathBooks } from "@/lib/data";
import { BookCover } from "./book-cover";
import { bookCoverData } from "@/lib/book-cover-data";

export function ReadingPathCard({ path }: { path: ReadingPath }) {
  const pathBooks = getPathBooks(path).slice(0, 4);

  return (
    <Link href={`/path/${path.slug}`} className="interactive-lift group w-[84vw] max-w-[480px] shrink-0 snap-start rounded-[30px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:w-[430px]">
      <div className="flex h-40 items-end gap-3 overflow-hidden rounded-[22px] bg-[#f5f1e9] px-5 pt-5">
        {pathBooks.map((book, index) => (
          <BookCover key={book.id} book={bookCoverData(book)} className={`${index === 0 ? "w-[88px]" : "w-[70px]"} ${index % 2 ? "mb-6" : ""}`} />
        ))}
      </div>
      <div className="mt-5">
        <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
          <BookOpen size={16} />
          <p className="caption text-[10px]">Official Path</p>
        </div>
        <h3 className="title-3 mt-2">{path.title}</h3>
        <p className="body-copy mt-2 line-clamp-2 text-[15px] leading-6">{path.description}</p>
        <p className="footnote mt-4">{pathBooks.length} curated books</p>
      </div>
    </Link>
  );
}
