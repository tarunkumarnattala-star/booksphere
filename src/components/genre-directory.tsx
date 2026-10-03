import Link from "next/link";
import { Genre, Book } from "@/lib/types";

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
  Leadership: "Responsibility, culture, judgment, and team trust.",
  "Technology & AI": "Intelligent systems, automation, ethics, and human impact.",
  Science: "Evidence, discovery, uncertainty, and how the world works.",
  Economics: "Incentives, markets, institutions, inequality, and tradeoffs.",
  Creativity: "Originality, craft, taste, and turning ideas into work.",
  Career: "Direction, strengths, opportunity, and meaningful work.",
  "Society & Culture": "Identity, institutions, power, media, and collective life."
};

// The shelf list, printed as an index: how many books are on the shelf, its name, and what
// it holds. What used to be here was twenty-one cards at 32px radius, each with three
// cover thumbnails, an arrow in a circle, and a "source-reviewed previews" count - plus a
// twenty-second card advertising the search that has its own tab.
export function GenreDirectory({
  genres,
  booksByGenre
}: {
  genres: Genre[];
  booksByGenre: (genreName: string) => Book[];
  heading?: string;
  subtitle?: string;
}) {
  return (
    <section id="genres" data-onboarding="genres" className="section-rule">
      <p className="caption">Every shelf</p>
      <ol className="records records-tight">
        {genres.map((genre) => {
          const shelf = booksByGenre(genre.name);
          return (
            <li key={genre.id} className="record">
              <p className="caption record-stamp numeral">{shelf.length} books</p>
              <div className="min-w-0">
                <h2 className="record-title">
                  <Link href={`/genre/${genre.slug}`} className="transition-colors hover:text-[color:var(--accent)]">
                    {genre.name}
                  </Link>
                </h2>
                <p className="record-text">
                  {genreDescriptions[genre.name] || "A focused shelf for thoughtful book perspectives."}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
