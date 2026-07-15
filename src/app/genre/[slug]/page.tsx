import { notFound } from "next/navigation";
import { DiscussionCard } from "@/components/discussion-card";
import { EmptyState } from "@/components/empty-state";
import { GenreBookSearch } from "@/components/genre-book-search";
import { ReadingPathCard } from "@/components/reading-path-card";
import { SectionShelf } from "@/components/section-shelf";
import { BookCover } from "@/components/book-cover";
import { discussions, genres, getBooksForGenre, getGenre, getGenreDiscoveryShelves, getReadingPathsForGenre, sortDiscussions } from "@/lib/data";
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
  Startups: "Founder, product, growth, and early-company books with practical reader insight.",
  Productivity: "Books about focus, time, systems, and doing meaningful work.",
  Health: "Books for energy, longevity, sleep, movement, and mental resilience.",
  Philosophy: "Books that help readers examine values, meaning, ethics, and attention.",
  Biography: "Lives worth studying through the decisions and patterns behind them.",
  History: "Books that make the present easier to understand through the past.",
  Relationships: "Books for attachment, communication, trust, and repair.",
  Leadership: "Books about responsibility, trust, judgment, and team culture."
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return genres.map((genre) => ({ slug: genre.slug }));
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
  const shelves = getGenreDiscoveryShelves(genre.name);
  const paths = getReadingPathsForGenre(genre.name);

  return (
    <div className="mx-auto max-w-[1560px]">
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_0.9fr] lg:items-end">
          <div>
            <p className="caption mb-4">Genre</p>
            <h1 className="large-title">{genre.name}</h1>
            <p className="body-copy mt-5 max-w-2xl">
              {genreSubtitles[genre.name] || `Books and discussions for readers exploring ${genre.name.toLowerCase()}.`}
            </p>
          </div>
          <div className="flex h-[220px] items-end gap-3 overflow-hidden rounded-[30px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] sm:h-[260px] sm:gap-4 sm:p-6 md:h-[300px] lg:h-[320px]">
            {shelf.slice(0, 5).map((book, index) => (
              <BookCover key={book.id} book={bookCoverData(book)} priority={index < 2} className={`${index === 0 ? "w-[120px] sm:w-[150px] md:w-[170px] lg:w-[190px]" : "w-[80px] sm:w-[104px] md:w-[116px] lg:w-[132px]"} ${index % 2 ? "mb-5 sm:mb-8" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      <GenreBookSearch genreName={genre.name} />

      <section className="py-8 md:py-10">
        <div className="mb-5 px-4 md:px-6 lg:px-8">
          <p className="caption mb-2">Start Here</p>
          <h2 className="title-2">Reading paths for {genre.name}</h2>
          <p className="subheadline mt-2">Curated sequences that help readers know what to read next.</p>
        </div>
        <div className="shelf-scroll flex gap-5 overflow-x-auto px-4 pb-4 md:px-6 lg:px-8">
          {paths.map((path) => <ReadingPathCard key={path.id} path={path} />)}
        </div>
      </section>

      {shelves.map((shelfItem) => (
        <SectionShelf
          key={shelfItem.key}
          title={shelfItem.title}
          subtitle={shelfItem.subtitle}
          books={shelfItem.books}
          badge={shelfItem.badge}
          signal={shelfItem.signal}
        />
      ))}

      <section className="py-8 md:py-12">
        <div className="mb-5 px-4 md:px-6 lg:px-8">
          <p className="caption mb-2">Reader Notes</p>
          <h2 className="title-2">Questions readers are opening in {genre.name}</h2>
          <p className="subheadline mt-2">Threads where readers apply, challenge, and explain the ideas behind these books.</p>
        </div>
        <div className="shelf-scroll flex gap-5 overflow-x-auto px-4 pb-4 md:px-6 lg:px-8">
          {insightPosts.length ? insightPosts.slice(0, 10).map((post) => (
            <div key={post.id} className="w-[86vw] max-w-[330px] shrink-0 snap-start md:w-[430px] md:max-w-none">
              <DiscussionCard post={post} showBook compact />
            </div>
          )) : (
            <div className="w-full">
              <EmptyState title="No genre discussions yet" body={`The ${genre.name} shelf is ready. Starter discussions will appear here as readers share useful perspectives.`} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
