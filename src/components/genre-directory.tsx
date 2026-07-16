import Link from "next/link";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { Genre, Book } from "@/lib/types";
import { BookCover } from "./book-cover";
import { bookCoverData } from "@/lib/book-cover-data";

const genreDescriptions: Record<string, string> = {
  Business: "Strategy, management, and operating ideas for useful companies.",
  Finance: "Clear thinking around money, risk, freedom, and tradeoffs.",
  Investing: "Markets, patience, judgment, and long-term wealth-building.",
  "Personal Growth": "Habits, discipline, confidence, and direction.",
  Communication: "Writing, speaking, persuasion, and better conversations.",
  Psychology: "Behavior, motivation, bias, emotion, and decision-making.",
  Startups: "Founder stories, product thinking, traction, and growth.",
  Productivity: "Focus, systems, time, and meaningful output.",
  Health: "Energy, longevity, sleep, training, and resilience.",
  Philosophy: "Meaning, ethics, attention, and how to live.",
  Biography: "Lives worth studying through decisions and patterns.",
  History: "The past as a lens for understanding the present.",
  Relationships: "Attachment, trust, repair, and communication.",
  Leadership: "Responsibility, culture, judgment, and team trust."
};

export function GenreDirectory({
  genres,
  booksByGenre,
  heading = "Genres",
  subtitle = "Explore the shelves readers return to most."
}: {
  genres: Genre[];
  booksByGenre: (genreName: string) => Book[];
  heading?: string;
  subtitle?: string;
}) {
  return (
    <section id="genres" className="py-8 md:py-12">
      <div data-onboarding="genres" className="container-page rounded-[24px]">
        <p className="caption mb-3">Reading Rooms</p>
        <h2 className="title-1 max-w-4xl">{heading}</h2>
        <p className="body-copy mt-4 max-w-2xl">{subtitle}</p>
      </div>
      <div className="container-page mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {genres.map((genre) => {
          const shelf = booksByGenre(genre.name);
          const verifiedPreviews = shelf.filter((book) => book.editorialStatus === "verified").length;
          return (
            <Link
              key={genre.id}
              href={`/genre/${genre.slug}`}
              className="interactive-lift group overflow-hidden rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="caption">{shelf.length} books</p>
                  <h3 className="title-3 mt-2">{genre.name}</h3>
                </div>
                <span className="grid size-9 place-items-center rounded-full bg-black/[0.035] text-[color:var(--color-text-secondary)] transition group-hover:bg-[color:var(--color-text-primary)] group-hover:!text-white">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <div className="mt-6 flex h-32 items-end gap-2 overflow-hidden">
                {shelf.slice(0, 3).map((book, index) => (
                  <BookCover key={book.id} book={bookCoverData(book)} className={`${index === 0 ? "w-20" : "w-16"} rounded-[12px]`} />
                ))}
              </div>
              <p className="body-copy mt-5 text-[15px] leading-6">{genreDescriptions[genre.name] || "A focused shelf for thoughtful book discussions."}</p>
              <p className="footnote mt-5">{verifiedPreviews} source-reviewed {verifiedPreviews === 1 ? "preview" : "previews"}</p>
            </Link>
          );
        })}
        <Link
          href="/search"
          className="interactive-lift group flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]"
        >
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-full bg-black/[0.04] text-[color:var(--color-accent)]">
                <Search size={18} />
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-black/[0.035] text-[color:var(--color-text-secondary)] transition group-hover:bg-[color:var(--color-text-primary)] group-hover:!text-white">
                <ArrowUpRight size={16} />
              </span>
            </div>
            <p className="caption">Knowledge Search</p>
            <h3 className="title-3 mt-3">Search by the idea you want to understand.</h3>
            <p className="body-copy mt-4 text-[15px] leading-6">
              Move from a problem to books, discussions, reading paths, and useful reader insights.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-[22px] bg-black/[0.035] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)]">
              <Sparkles size={15} className="text-[color:var(--color-accent)]" />
              Open knowledge search
            </span>
            <ArrowUpRight size={16} className="text-[color:var(--color-text-secondary)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>
      </div>
    </section>
  );
}
