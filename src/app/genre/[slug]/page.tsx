import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DiscussionCard } from "@/components/discussion-card";
import { GenreBookSearch } from "@/components/genre-book-search";
import { BookCover } from "@/components/book-cover";
import { discussions, genres, getBooksForGenre, getGenre, getReadingPathsForGenre, getBookShelfBadge, sortDiscussions } from "@/lib/data";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { isSupabaseConfigured } from "@/lib/supabase";
import { bookCoverData } from "@/lib/book-cover-data";

const genreSubtitles: Record<string, string> = {
  "Personal Growth": "Books that help people build better habits, discipline, confidence, and direction.",
  Business: "Strategy, management, and decision-making books for people building useful things.",
  Finance: "Money books that help readers think clearly about tradeoffs, risk, and independence.",
  Investing: "Timeless investing books discussed through patience, risk, and judgment.",
  Communication: "Books for better conversations, persuasion, writing, and disagreement.",
  Psychology: "Books that help people understand behavior, motivation, bias, and emotion.",
  Startups: "Founder, product, growth, and early-company books with practical reader perspectives.",
  Productivity: "Books about focus, time, systems, and doing meaningful work.",
  Health: "Books for energy, longevity, sleep, movement, and mental resilience.",
  Philosophy: "Books that help readers examine values, meaning, ethics, and attention.",
  Biography: "Lives worth studying through the decisions and patterns behind them.",
  History: "Books that make the present easier to understand through the past.",
  Relationships: "Books for attachment, communication, trust, and repair.",
  Leadership: "Books about responsibility, trust, judgment, and team culture."
};

export const dynamic = "force-dynamic";

// The catalog is the complete set of valid params, so anything else is genuinely not a
// page. Declaring that lets Next answer with a real 404 at the routing layer; calling
// notFound() from inside the page renders the right screen but still returns HTTP 200,
// which reads to a crawler as a valid page and gets indexed.
export const dynamicParams = false;

export function generateStaticParams() {
  return genres.map((genre) => ({ slug: genre.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const genre = genres.find((item) => item.slug === slug);
  if (!genre) return pageMetadata({ title: "Genre not found", noIndex: true });
  return pageMetadata({
    title: `${genre.name} books`,
    description: `Books in ${genre.name}, read through what people applied, questioned, and learned.`,
    path: `/genre/${genre.slug}`
  });
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = getGenre(slug);
  if (!genre) notFound();
  const shelf = getBooksForGenre(genre.name);
  const genreBookIds = new Set(shelf.map((book) => book.id));
  const persistedPosts = await getSupabaseFeedContributions(100);
  const communityPosts = isSupabaseConfigured ? persistedPosts : discussions;
  const insightPosts = sortDiscussions(communityPosts.filter((post) => genreBookIds.has(post.bookId)), "hot");
  const paths = getReadingPathsForGenre(genre.name);

  // Six shelves used to sit here - Editor's Picks, Core Books, Beginner Essentials, Hidden
  // Gems, Recently Added, Most Discussed - all drawn through `withFallback`, which pads any
  // short shelf with the same editor's picks and then with every other book in the genre.
  // On Personal Growth that printed Atomic Habits five times under five different labels.
  // The editorial flags are real, so they are read directly, with no padding.
  const picks = shelf.filter((book) => book.isEditorsPick).slice(0, 3);
  const pickIds = new Set(picks.map((book) => book.id));
  const rest = shelf.filter((book) => !pickIds.has(book.id));

  return (
    <div className="editorial-page">
      <header>
        <p className="caption">Genre</p>
        <h1 className="large-title mt-4">{genre.name}</h1>
        <p className="body-copy measure mt-5">
          {genreSubtitles[genre.name] || `Books and perspectives for readers exploring ${genre.name.toLowerCase()}.`}
        </p>
      </header>

      <GenreBookSearch genreName={genre.name} />

      {picks.length > 0 && (
        <section className="section-rule">
          <p className="caption">Start here</p>
          <ol className="records records-tight">
            {picks.map((book) => (
              <li key={book.id} className="record record-media">
                <Link href={`/book/${book.id}`} className="block w-full md:w-[96px]" tabIndex={-1} aria-hidden="true">
                  <BookCover book={bookCoverData(book)} className="w-full" />
                </Link>
                <div className="min-w-0">
                  <h2 className="record-title">
                    <Link href={`/book/${book.id}`} className="transition-colors hover:text-[color:var(--accent)]">{book.title}</Link>
                  </h2>
                  <p className="record-meta !mt-2">{book.author}</p>
                  <p className="record-text">{book.whyMatters}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {paths.length > 0 && (
        <section className="section-rule">
          <p className="caption">Reading paths in {genre.name}</p>
          <ol className="records records-tight">
            {paths.map((path) => (
              <li key={path.id} className="record">
                <p className="caption record-stamp numeral">{path.bookIds.length} books</p>
                <div className="min-w-0">
                  <h2 className="record-title">
                    <Link href={`/path/${path.slug}`} className="transition-colors hover:text-[color:var(--accent)]">{path.title}</Link>
                  </h2>
                  <p className="record-text">{path.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="section-rule">
        <p className="caption">Perspectives in {genre.name}</p>
        {insightPosts.length ? (
          <ol className="records records-tight">
            {insightPosts.slice(0, 10).map((post) => <DiscussionCard key={post.id} post={post} showBook />)}
          </ol>
        ) : (
          <p className="body-copy measure mt-5">
            Nothing has been written about a {genre.name.toLowerCase()} book yet. Open any book above and
            answer one of its questions.
          </p>
        )}
      </section>
      {/* The whole shelf, printed as an index: every book in the genre, once, with any real
          editorial flag beside it. A reader can see the size and shape of the shelf without
          scrolling through six carousels of the same six covers. */}
      <section className="section-rule">
        <p className="caption">
          All <span className="numeral">{shelf.length}</span> books in {genre.name}
        </p>
        <ul className="mt-5 grid gap-x-8 border-t border-[color:var(--rule-strong)] sm:grid-cols-2">
          {rest.map((book) => {
            const badge = getBookShelfBadge(book, "");
            return (
              <li key={book.id} className="border-b border-[color:var(--rule)]">
                <Link href={`/book/${book.id}`} className="block py-2.5 transition-colors hover:bg-[color:var(--band)]">
                  <span className="block text-[15px] leading-snug text-[color:var(--ink)]">{book.title}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-[color:var(--ink-50)]">
                    {book.author}
                    {badge ? <span className="caption caption-muted ml-3">{badge}</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

    </div>
  );
}
