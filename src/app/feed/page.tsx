import Link from "next/link";
import {
  BookOpen,
  Flame,
  Layers3,
  Lightbulb,
  PenLine,
  Route,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { DiscussionCard } from "@/components/discussion-card";
import { EmptyState } from "@/components/empty-state";
import { KnowledgeFeed } from "@/components/knowledge-feed";
import { getSupabaseFeedContributions } from "@/lib/contributions";
import { getBook, getTrendingDiscussionPosts, knowledgePosts, readingPaths, sortDiscussions, discussions } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { bookCoverData } from "@/lib/book-cover-data";

const trendingTopics = ["Mental Models", "Atomic Habits", "Decision Making", "Investing", "Communication"];

const popularQuestions = [
  "What habit changed your life?",
  "Best book for building discipline?",
  "How do you stay focused?",
  "The most practical book you read this year?",
  "Books that improved your thinking the most",
];

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const persistedFeed = await getSupabaseFeedContributions(12);
  const trending = getTrendingDiscussionPosts(6);
  const rising = sortDiscussions(discussions, "rising").slice(0, 6);
  const previewDiscussions = isSupabaseConfigured ? persistedFeed : [...rising, ...trending];
  const recommendedDiscussions = previewDiscussions
    .filter((post, index, all) => all.findIndex((item) => item.id === post.id) === index)
    .slice(0, 4);

  return (
    <div className="editorial-page max-w-[1560px]">
      <div className="mb-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-6">
          <FeedPromisePanel />
          <ComposerCard />

          <section id="book-ideas">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="caption mb-2">Ideas from books</p>
                <h2 className="title-2">Understand the useful part fast</h2>
                <p className="subheadline mt-2 max-w-2xl">Short reader perspectives that explain the idea, where it came from, how it was applied, or where it should be challenged.</p>
              </div>
            </div>
            <KnowledgeFeed seedPosts={knowledgePosts} variant="stream" />
          </section>

          <section className="rounded-[34px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-6">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="caption mb-2">Book discussions</p>
                <h2 className="title-3">Compare how readers understood it</h2>
                <p className="subheadline mt-2">Questions, applications, and disagreements that add context beyond a plain summary.</p>
              </div>
              <Link href="/explore#editorial-perspectives" className="text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">
                Browse all
              </Link>
            </div>
            <div className="grid gap-4">
              {recommendedDiscussions.slice(0, 3).map((post) => (
                <DiscussionCard key={post.id} post={post} showBook compact />
              ))}
              {!recommendedDiscussions.length && (
                <EmptyState title="No discussions yet" body="Choose a book and open the first useful question, application, or disagreement." />
              )}
            </div>
          </section>
        </main>

        <aside className="hidden xl:block">
          <FeedRightRail />
        </aside>
      </div>
    </div>
  );
}

function FeedPromisePanel() {
  const steps = [
    ["1", "Read the idea", "Get the useful point without opening the whole book first."],
    ["2", "See the proof", "Compare how readers used it, challenged it, or explained the limit."],
    ["3", "Decide next", "Save the insight, reply, or open the book when it is worth your time."]
  ];

  return (
    <section className="rounded-[32px] bg-[color:var(--color-text-primary)] p-5 text-white shadow-[var(--shadow-soft)] md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="caption mb-2 text-[#d6a536]">Knowledge pill</p>
          <h1 className="text-[30px] font-medium leading-tight tracking-[-0.035em] md:text-[38px]">Useful book ideas you can understand fast.</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/70 md:text-[15px]">
            The feed is for short, human explanations: the idea, where it came from, how someone used it, and where readers disagree.
          </p>
        </div>
        <Link href="/search" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:bg-white/90">
          Find a book
        </Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map(([number, title, body]) => (
          <div key={title} className="rounded-[22px] bg-white/[0.075] p-4 ring-1 ring-white/10">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-[color:var(--color-text-primary)]">{number}</span>
            <h2 className="mt-3 text-base font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-5 text-white/68">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComposerCard() {
  return (
    <section className="rounded-[32px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-text-primary)] text-sm font-semibold text-white">N</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">Share one useful idea from a book.</h2>
              <p className="mt-1 text-sm font-medium text-[color:var(--color-text-secondary)]">Pick the book, then explain the idea, application, question, or disagreement that helps another reader.</p>
            </div>
            <Link href="/search?intent=add" className="grid size-11 place-items-center rounded-full text-[color:var(--color-text-secondary)] transition hover:bg-black/[0.04] hover:text-[color:var(--color-text-primary)]" aria-label="Choose a book to create from">
              <PenLine size={18} />
            </Link>
          </div>

          <Link href="/search?intent=add" className="mt-5 block rounded-[22px] border border-[color:var(--color-hairline)] bg-white px-5 py-5 text-sm font-medium text-[color:var(--color-text-muted)] transition hover:border-black/10 hover:bg-black/[0.015]">
            Choose a book, then write the useful idea in your own words...
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/search?intent=add" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-4 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:bg-black/[0.06]">
              <BookOpen size={16} />
              Choose the book
            </Link>
            <Link href="/search?intent=add" className="ml-auto inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-text-primary)] px-5 text-sm font-medium !text-white transition hover:opacity-85">
              Start
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeedRightRail() {
  return (
    <div className="sticky top-24 space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Flame size={16} /></span>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">Trending topics</h2>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`} className="flex items-center justify-between gap-3 rounded-[16px] px-2 py-1.5 transition hover:bg-black/[0.035]">
              <span className="flex items-center gap-3 text-sm font-medium text-[color:var(--color-text-primary)]"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.04] text-[color:var(--color-text-secondary)]"><Search size={14} /></span>{topic}</span>
            </Link>
          ))}
        </div>
        <Link href="/search" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">
          View all topics <TrendingUp size={15} />
        </Link>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500"><Sparkles size={16} /></span>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">Questions worth exploring</h2>
        </div>
        <ol className="space-y-3">
          {popularQuestions.map((question, index) => (
            <li key={question} className="grid grid-cols-[24px_1fr] gap-3 text-sm font-medium leading-5 text-[color:var(--color-text-primary)]">
              <span className="text-[color:var(--color-text-secondary)]">{index + 1}</span>
              <Link href={`/search?q=${encodeURIComponent(question)}`} className="transition hover:opacity-70">{question}</Link>
            </li>
          ))}
        </ol>
        <Link href="/search" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">
          View all questions <TrendingUp size={15} />
        </Link>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Layers3 size={16} /></span>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">Suggested paths</h2>
        </div>
        <div className="space-y-3">
          {readingPaths.slice(0, 3).map((path) => {
            const firstBook = getBook(path.bookIds[0]);
            return (
              <Link key={path.id} href={`/path/${path.slug}`} className="grid grid-cols-[42px_1fr] items-center gap-3 rounded-[16px] p-2 transition hover:bg-black/[0.035]">
                {firstBook ? <BookCover book={bookCoverData(firstBook)} className="w-full rounded-[10px]" /> : <span className="h-14 rounded-[10px] bg-black/[0.05]" />}
                <span className="min-w-0">
                  <span className="line-clamp-1 text-sm font-semibold text-[color:var(--color-text-primary)]">{path.title}</span>
                  <span className="text-xs font-medium text-[color:var(--color-text-secondary)]">{path.bookIds.length} books · official path</span>
                </span>
              </Link>
            );
          })}
        </div>
        <Link href="/search" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">
          View all paths <Route size={15} />
        </Link>
      </section>

      <section className="rounded-[28px] bg-[color:var(--color-text-primary)] p-5 text-white shadow-[var(--shadow-soft)]">
        <Lightbulb className="mb-5 text-[#d6a536]" size={22} />
        <p className="text-lg font-semibold leading-7 tracking-[-0.02em]">Every strong post starts with a book and ends with a useful idea someone can apply.</p>
      </section>
    </div>
  );
}
