import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Clock3, Plus, Users } from "lucide-react";
import { EditorialPickCard } from "@/components/editorial-pick-card";
import { GenreDirectory } from "@/components/genre-directory";
import { HeroInlineSearch } from "@/components/hero-inline-search";
import { ReadingPathCard } from "@/components/reading-path-card";
import { SectionShelf } from "@/components/section-shelf";
import { BookCover } from "@/components/book-cover";
import {
  books,
  genres,
  getBook,
  getDiscussionRankingLabel,
  getEditorialDiscussionPicks,
  getHomeDiscoveryShelves,
  getMostDiscussed,
  getMostSaved,
  getProfileById,
  getTrendingDiscussionPosts,
  readingPaths
} from "@/lib/data";
import type { DiscussionPost } from "@/lib/types";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { isSupabaseConfigured } from "@/lib/supabase";
import { bookCoverData } from "@/lib/book-cover-data";

export const dynamic = "force-dynamic";

export default async function ExplorePage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const query = searchParams ? await searchParams : {};
  const shelves = getHomeDiscoveryShelves();
  const persistedPosts = await getSupabaseFeedContributions(10);
  const trendingPosts = isSupabaseConfigured ? persistedPosts : getTrendingDiscussionPosts(10);
  const editorialPicks = getEditorialDiscussionPicks(5);
  return (
    <div className="mx-auto max-w-[1560px]">
      <section className="container-page pb-3 pt-7 md:pb-4 md:pt-9 lg:pb-3 lg:pt-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(420px,0.74fr)] lg:items-start">
          <div className="max-w-[900px]">
            <div data-onboarding="explore" className="rounded-[24px]">
              <p className="caption mb-4">Good evening</p>
              <h1 className="large-title max-w-4xl">Understand books through the people applying them.</h1>
              <p className="body-copy mt-5 max-w-2xl">
                No time to finish every book? Learn the core ideas through summaries, applications, disagreements, and real reader perspectives.
              </p>
              <div className="mt-5 grid grid-cols-3 divide-x divide-[color:var(--color-hairline)] border-y border-[color:var(--color-hairline)] py-3 sm:hidden">
                <MobileValueCue icon={<Clock3 size={15} />} text="Ideas fast" />
                <MobileValueCue icon={<Users size={15} />} text="Reader views" />
                <MobileValueCue icon={<CheckCircle2 size={15} />} text="Worth reading?" />
              </div>
              <div className="mt-6 hidden max-w-3xl gap-2.5 sm:grid sm:grid-cols-3">
                <FirstFiveSecondCard icon={<Clock3 size={17} />} label="Start fast" text="Get the useful idea before committing hours." />
                <FirstFiveSecondCard icon={<Users size={17} />} label="Learn socially" text="See how readers applied, challenged, and explained it." />
                <FirstFiveSecondCard icon={<CheckCircle2 size={17} />} label="Decide clearly" text="Know when the full book is worth reading." />
              </div>
            </div>
            <HeroInlineSearch books={books} initialQuery={query.q || ""} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#editorial-perspectives" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85">
                Read useful perspectives <ArrowRight size={16} />
              </a>
              <Link href="/genres" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] transition hover:bg-black/[0.035]">
                Browse genres
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] md:p-5">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="caption mb-2">Live reading room</p>
                <h2 className="text-[22px] font-medium leading-tight tracking-[-0.035em] text-[color:var(--color-text-primary)]">Useful threads people can enter today</h2>
              </div>
              <Link href="/feed" className="hidden text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)] sm:inline">
                View all
              </Link>
            </div>
            <div className="grid gap-2.5">
              {trendingPosts.slice(0, 4).map((post, index) => (
                <LiveThreadCard key={post.id} post={post} priority={index === 0} />
              ))}
              {!trendingPosts.length && (
                <p className="rounded-[20px] bg-black/[0.025] px-4 py-6 text-sm font-medium leading-6 text-[color:var(--color-text-secondary)]">
                  The reading room is ready. New community discussions will appear here as readers contribute.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="editorial-perspectives" className="scroll-mt-24 pb-8 pt-5 md:pb-10 md:pt-5">
        <div className="mb-5 px-4 md:px-6 lg:px-8">
          <p className="caption mb-2">Editorial</p>
          <h2 className="title-2">Five Perspectives Worth Reading</h2>
          <p className="subheadline mt-2 max-w-2xl">Human-curated insights that show the idea, application, question, or disagreement behind a book.</p>
        </div>
        <div className="shelf-scroll flex gap-5 overflow-x-auto px-4 pb-4 md:px-6 lg:px-8">
          {editorialPicks.map(({ pick, post }) => <EditorialPickCard key={pick.id} pick={pick} post={post} />)}
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="mb-5 px-4 md:px-6 lg:px-8">
          <p className="caption mb-2">Start Here</p>
          <h2 className="title-2">Reading Paths</h2>
          <p className="subheadline mt-2 max-w-2xl">Curated sequences for people who know the outcome they want and need the clearest books, ideas, and perspectives to start with.</p>
        </div>
        <div className="shelf-scroll flex gap-5 overflow-x-auto px-4 pb-4 md:px-6 lg:px-8">
          {readingPaths.map((path) => <ReadingPathCard key={path.id} path={path} />)}
        </div>
      </section>

      <SectionShelf title="Editor’s Picks" subtitle="Books with clear ideas, practical takeaways, and strong reader perspective." books={shelves[0].books} badge="Editor’s Pick" signal="insights" />
      <SectionShelf title="Books to Compare" subtitle="Books selected for useful questions, applications, and disagreements." books={getMostDiscussed()} badge="Editorial Selection" signal="editorial" />
      <SectionShelf title="Worth Returning To" subtitle="Evergreen books selected for long-term knowledge value." books={getMostSaved()} badge="Evergreen" signal="editorial" />

      <GenreDirectory genres={genres} booksByGenre={(genreName) => books.filter((book) => book.genres.includes(genreName))} heading="Browse by Genre" subtitle="Focused reading rooms organized around ideas, not shelves in a database." />

      <section id="about-booksphere" className="container-page scroll-mt-24 py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <p className="caption mb-2">About BookSphere</p>
          <h2 className="title-2">Questions, answered simply.</h2>
          <div className="mt-6 divide-y divide-[color:var(--color-hairline)] border-y border-[color:var(--color-hairline)]">
            <ProductAnswer
              question="What is BookSphere?"
              answer="BookSphere helps you understand books through concise context and real reader perspectives, including how people applied, questioned, or challenged an idea."
            />
            <ProductAnswer
              question="Does BookSphere replace the full book?"
              answer="It gives you the core ideas and lived perspectives quickly, then helps you decide whether the full book's examples, evidence, and depth are worth your time."
            />
            <ProductAnswer
              question="How are book pages and the Feed different?"
              answer="A book page is centered on knowledge from one book. The Feed is centered on knowledge from people and real life; a book can be referenced, but it is never required."
            />
            <ProductAnswer
              question="Do I need an account?"
              answer="You can explore books and perspectives without one. An account is needed when you want to post, comment, save, or follow."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductAnswer({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-semibold text-[color:var(--color-text-primary)] [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <Plus size={18} className="shrink-0 text-[color:var(--color-text-secondary)] transition-transform group-open:rotate-45" />
      </summary>
      <p className="max-w-3xl pb-5 pr-10 text-sm leading-6 text-[color:var(--color-text-secondary)]">{answer}</p>
    </details>
  );
}

function FirstFiveSecondCard({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div className="rounded-[20px] bg-white/78 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.035)] ring-1 ring-black/[0.025]">
      <div className="mb-3 flex items-center gap-2 text-[color:var(--color-accent)]">
        {icon}
        <p className="caption text-[10px]">{label}</p>
      </div>
      <p className="text-sm font-medium leading-5 text-[color:var(--color-text-primary)]">{text}</p>
    </div>
  );
}

function MobileValueCue({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-1.5 px-2 text-center text-[11px] font-medium text-[color:var(--color-text-secondary)]">
      <span className="shrink-0 text-[color:var(--color-accent)]">{icon}</span>
      <span className="leading-tight">{text}</span>
    </div>
  );
}

function LiveThreadCard({ post, priority = false }: { post: DiscussionPost; priority?: boolean }) {
  const book = getBook(post.bookId);
  const profile = getProfileById(post.userId);

  if (!book) return null;

  return (
    <Link
      href={`/book/${book.id}#discussions`}
      className="group flex min-w-0 items-center gap-3 rounded-[20px] p-2.5 transition hover:bg-black/[0.025]"
    >
      <BookCover book={bookCoverData(book)} priority={priority} className="w-[52px] shrink-0 rounded-[11px] shadow-[0_10px_24px_rgba(0,0,0,0.10)]" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-text-secondary)]">{getDiscussionRankingLabel(post)}</span>
          <span className="caption text-[10px]">{post.postType}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-[1.18] tracking-[-0.025em] text-[color:var(--color-text-primary)]">
          {post.title}
        </h3>
        <p className="mt-1 truncate text-sm font-normal text-[color:var(--color-text-secondary)]">
          {book.title} · {profile.name}
        </p>
      </div>
    </Link>
  );
}
