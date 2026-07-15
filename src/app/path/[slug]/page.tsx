import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { bookCoverData } from "@/lib/book-cover-data";
import { GenrePill } from "@/components/genre-pill";
import { readingPaths, getPathBooks, getReadingPath } from "@/lib/data";

export function generateStaticParams() {
  return readingPaths.map((path) => ({ slug: path.slug }));
}

export default async function ReadingPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = getReadingPath(slug);
  if (!path) notFound();
  const pathBooks = getPathBooks(path);

  return (
    <div className="editorial-page max-w-[1240px]">
      <section className="grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-end">
        <div>
          <p className="caption mb-4">Official Reading Path</p>
          <h1 className="large-title">{path.title}</h1>
          <p className="body-copy mt-5 max-w-2xl">{path.description}</p>
        </div>
        <div className="flex h-[250px] items-end gap-3 overflow-hidden rounded-[30px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] sm:h-[300px] sm:gap-4 sm:p-6 lg:h-[340px]">
          {pathBooks.slice(0, 5).map((book, index) => (
            <BookCover key={book.id} book={bookCoverData(book)} priority={index < 2} className={`${index === 0 ? "w-[120px] sm:w-[160px] lg:w-[190px]" : "w-[78px] sm:w-[112px] lg:w-[138px]"} ${index % 2 ? "mb-6 sm:mb-10" : ""}`} />
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-5">
        <div>
          <p className="caption mb-2">Sequence</p>
          <h2 className="title-2">Read in this order</h2>
        </div>
        {pathBooks.map((book, index) => (
          <Link key={book.id} href={`/book/${book.id}`} className="interactive-lift grid gap-5 rounded-[30px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:grid-cols-[96px_1fr_auto] md:items-center">
            <BookCover book={bookCoverData(book)} className="w-[82px] rounded-[14px] md:w-[96px]" />
            <div>
              <p className="caption text-[10px]">Step {index + 1}</p>
              <h3 className="title-3 mt-1">{book.title}</h3>
              <p className="subheadline mt-1">{book.author}</p>
              <p className="body-copy mt-3 text-[15px] leading-6">{path.notes[book.id] || book.whyMatters}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {book.genres.slice(0, 3).map((genre) => <GenrePill key={genre} name={genre} />)}
              </div>
            </div>
            <span className="hidden items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)] md:flex">
              Open book <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
