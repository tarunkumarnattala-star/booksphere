import { notFound } from "next/navigation";
import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { bookCoverData } from "@/lib/book-cover-data";
import { readingPaths, getPathBooks, getReadingPath } from "@/lib/data";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

// The catalog is the complete set of valid params, so anything else is genuinely not a
// page. Declaring that lets Next answer with a real 404 at the routing layer; calling
// notFound() from inside the page renders the right screen but still returns HTTP 200,
// which reads to a crawler as a valid page and gets indexed.
export const dynamicParams = false;

export function generateStaticParams() {
  return readingPaths.map((path) => ({ slug: path.slug }));
}

// These five URLs are in the sitemap and are the most shareable thing on the site after a
// book, and every one of them was serving the site-wide title and the site-wide social card.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = getReadingPath(slug);
  if (!path) return pageMetadata({ title: "Reading path not found", noIndex: true });
  return pageMetadata({
    title: `${path.title} reading path`,
    description: path.description,
    path: `/path/${path.slug}`
  });
}

export default async function ReadingPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = getReadingPath(slug);
  if (!path) notFound();
  const pathBooks = getPathBooks(path);

  return (
    <div className="editorial-page">
      <header>
        <p className="caption">Reading path</p>
        <h1 className="large-title mt-4 max-w-[16ch]">{path.title}</h1>
        <p className="body-copy measure mt-5">{path.description}</p>
        <p className="footnote mt-5">
          <span className="numeral">{pathBooks.length}</span> books, in this order
        </p>
      </header>

      {/* The order is the whole product of a reading path, so the step number is the docket
          and nothing else competes with it. The hero used to be five covers fanned out in a
          rounded white box, which said nothing about sequence at all. */}
      <ol className="records">
        {pathBooks.map((book, index) => (
          <li key={book.id} className="record">
            <p className="caption record-stamp numeral">{String(index + 1).padStart(2, "0")}</p>
            <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-5">
              <Link href={`/book/${book.id}`} className="block" tabIndex={-1} aria-hidden="true">
                <BookCover book={bookCoverData(book)} className="w-full" />
              </Link>
              <div className="min-w-0">
                <h2 className="record-title">
                  <Link href={`/book/${book.id}`} className="transition-colors hover:text-[color:var(--accent)]">{book.title}</Link>
                </h2>
                <p className="record-meta !mt-2">{book.author}</p>
                <p className="record-text">{path.notes[book.id] || book.whyMatters}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
