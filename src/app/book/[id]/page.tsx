import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, MessageCircle, PenLine, Scale } from "lucide-react";
import { BookCommunityActions } from "@/components/book-community-actions";
import { BookCover } from "@/components/book-cover";
import { CommentThread } from "@/components/comment-thread";
import { DiscussionCard } from "@/components/discussion-card";
import { DiscussionSortNav } from "@/components/discussion-sort-nav";
import { EmptyState } from "@/components/empty-state";
import { GenrePill } from "@/components/genre-pill";
import { LocalDiscussionList } from "@/components/local-discussion-list";
import { SectionShelf } from "@/components/section-shelf";
import { DiscussionSort } from "@/lib/types";
import { books, discussionSortOptions, getBook, getBookChapters, getBookConcepts, getBookIdeas, getBookKnowledgePreview, getDiscussionsForBook, getOftenReadNext, getPerspectiveClustersForBook, sortDiscussions } from "@/lib/data";
import { getSupabaseContributionsForBook } from "@/lib/contributions";
import { isSupabaseConfigured } from "@/lib/supabase";
import { bookCoverData } from "@/lib/book-cover-data";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

function parseSort(value?: string): DiscussionSort {
  return discussionSortOptions.some((option) => option.value === value) ? value as DiscussionSort : "hot";
}

export default async function BookPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ sort?: string }> }) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const sort = parseSort(query?.sort);
  const book = getBook(id);
  if (!book) notFound();
  const persistedPosts = await getSupabaseContributionsForBook(book);
  const seedPosts = isSupabaseConfigured ? [] : getDiscussionsForBook(book.id);
  const posts = sortDiscussions([...persistedPosts, ...seedPosts], sort);
  const nextBooks = getOftenReadNext(book.id);
  const ideas = getBookIdeas(book.id);
  const preview = getBookKnowledgePreview(book.id);
  const clusters = getPerspectiveClustersForBook(book.id, posts);
  const activeClusters = clusters.filter((cluster) => cluster.posts.length > 0);
  const concepts = getBookConcepts(book.id);
  const chapters = getBookChapters(book.id);

  return (
    <div className="editorial-page max-w-[1320px]">
      <section className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
        <div>
          <BookCover book={bookCoverData(book)} priority className="mx-auto w-full max-w-[220px] sm:max-w-[260px] lg:max-w-none" />
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {book.genres.map((genre) => <GenrePill key={genre} name={genre} />)}
          </div>
          <h1 className="large-title mt-6 max-w-4xl">{book.title}</h1>
          <p className="headline mt-4 text-[color:var(--color-text-secondary)]">{book.author}</p>
          <div className="mt-6 grid gap-5 border-y border-[color:var(--color-hairline)] py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.45fr)] sm:gap-8">
            <div>
              <p className="caption text-[10px]">What this book is about</p>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[color:var(--color-text-primary)]">{book.description}</p>
            </div>
            <div>
              <p className="caption text-[10px]">Who it is for</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {book.bestForTags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-black/[0.035] px-3 py-1.5 text-sm font-medium text-[color:var(--color-text-secondary)]">{tag}</span>)}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/[0.035] px-3 py-1.5 text-sm font-medium text-[color:var(--color-text-secondary)]">{book.publicationLabel}</span>
            {preview && <span className="rounded-full bg-black/[0.035] px-3 py-1.5 text-sm font-medium text-[color:var(--color-text-secondary)]">{preview.fullBookDecision.timeCommitment}</span>}
            <span className="rounded-full bg-black/[0.035] px-3 py-1.5 text-sm font-medium text-[color:var(--color-text-secondary)]">{posts.length} perspectives</span>
          </div>

          <div className="mt-8">
            <BookCommunityActions book={book} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={preview ? "#knowledge-preview" : "#discussions"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85">
              <BookOpen size={17} /> {preview ? "Learn the useful ideas" : "Read reader perspectives"}
            </a>
            <Link href={`/book/${book.id}/create-discussion`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition hover:bg-black/[0.035]">
              <PenLine size={17} /> Share Insight
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Explore this book" className="mt-10 grid grid-cols-3 divide-x divide-[color:var(--color-hairline)] border-y border-[color:var(--color-hairline)] py-3">
        <BookOutcomeLink href={preview ? "#knowledge-preview" : "#discussions"} icon={<BookOpen size={17} />} label={preview ? "Useful ideas" : "Reader insights"} />
        <BookOutcomeLink href="#perspective-map" icon={<MessageCircle size={17} />} label="Reader views" />
        <BookOutcomeLink href={preview ? "#full-book-decision" : "#discussions"} icon={<Scale size={17} />} label={preview ? "Worth reading?" : "Open threads"} />
      </section>

      {preview && (
        <section id="knowledge-preview" className="mt-8 scroll-mt-24">
          <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
              <p className="caption">Learn this book</p>
              <h2 className="title-3 mt-3">The useful ideas, explained simply</h2>
              <p className="body-copy mt-4 max-w-4xl">{preview.coreThesis}</p>
              <p className="mt-4 text-sm font-medium leading-6 text-[color:var(--color-text-secondary)]">
                Start here for orientation. Then compare how readers applied, challenged, or limited each idea.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ideas.map((idea) => (
                  <div key={idea.id} className="rounded-[20px] bg-black/[0.025] p-4">
                    <p className="caption text-[10px]">{idea.chapterOrConcept}</p>
                    <h3 className="mt-2 text-base font-semibold leading-5 text-[color:var(--color-text-primary)]">{idea.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{idea.shortExplanation}</p>
                    <p className="mt-3 text-xs font-medium leading-5 text-[color:var(--color-text-muted)]">{idea.practicalExample}</p>
                    <a href="#perspective-map" className="mt-4 inline-flex text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">View perspectives</a>
                  </div>
                ))}
              </div>
              {book.sourceLinks.length > 0 && (
                <div className="mt-6 border-t border-[color:var(--color-hairline)] pt-5">
                  <p className="footnote mb-3">Book source</p>
                  <div className="flex flex-wrap gap-2">
                    {book.sourceLinks.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-full bg-black/[0.035] px-3 py-1.5 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:bg-black/[0.065]">{source.label}</a>)}
                  </div>
                </div>
              )}
          </div>
        </section>
      )}

      <section id="perspective-map" className="mt-6 scroll-mt-24 rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="caption mb-2">Reader perspectives</p>
            <h2 className="title-3">See where the ideas worked, failed, or changed</h2>
            <p className="subheadline mt-2 max-w-3xl">Only perspectives readers have actually contributed appear here.</p>
          </div>
          <a href="#discussions" className="text-sm font-medium text-[color:var(--color-text-primary)] transition hover:opacity-70">
            Open discussions
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeClusters.map((cluster) => (
            <div key={cluster.key} className="rounded-[24px] bg-black/[0.025] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="caption text-[10px]">{cluster.count === 1 ? "1 reader perspective" : `${cluster.count} reader perspectives`}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-[color:var(--color-text-primary)]">{cluster.name}</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[color:var(--color-text-secondary)]">{cluster.reactionHint}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">{cluster.explanation}</p>
              {cluster.posts[0] && (
                <a href={`#${cluster.posts[0].id}`} className="mt-4 block rounded-[18px] bg-white p-3 transition hover:bg-black/[0.02]">
                  <p className="line-clamp-2 text-sm font-semibold text-[color:var(--color-text-primary)]">{cluster.posts[0].title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[color:var(--color-text-muted)]">{cluster.posts[0].body}</p>
                </a>
              )}
            </div>
          ))}
        </div>
        {!activeClusters.length && (
          <div className="flex flex-col gap-4 rounded-[24px] bg-black/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">No reader perspective has been added yet. Share what you applied, questioned, or disagreed with.</p>
            <Link href={`/book/${book.id}/create-discussion`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)] ring-1 ring-black/[0.04] transition hover:bg-black/[0.035]">
              Add a perspective
            </Link>
          </div>
        )}
      </section>

      {preview && (
      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
          <p className="caption">Key concepts</p>
          <h2 className="title-3 mt-3">The language readers use</h2>
          <p className="body-copy mt-3 text-[15px] leading-6">{chapters[0]?.overview}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {concepts.slice(0, 6).map((concept) => (
              <span key={concept.id} className="rounded-full bg-black/[0.035] px-3 py-2 text-sm font-medium text-[color:var(--color-text-secondary)]">{concept.name}</span>
            ))}
          </div>
        </div>
        <div id="full-book-decision" className="scroll-mt-24 rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
          <p className="caption">Should you read the full book?</p>
          <h2 className="title-3 mt-3">Decide before committing the time</h2>
              <p className="body-copy mt-3 text-[15px] leading-6">{preview.fullBookDecision.fullBookAdds}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <DecisionList title="Read it if" items={preview.fullBookDecision.readFullBookIf} />
                <DecisionList title="Preview may be enough if" items={preview.fullBookDecision.previewEnoughIf} />
                <DecisionList title="Choose another if" items={preview.fullBookDecision.chooseAnotherIf} />
              </div>
              <div className="mt-6 border-t border-[color:var(--color-hairline)] pt-5">
                <p className="caption text-[10px]">Keep in mind</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                  {preview.limitations.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
        </div>
      </section>
      )}

      <section id="discussions" className="scroll-mt-24 border-t border-[color:var(--color-hairline)] pt-12 md:pt-16">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="caption mb-2">Perspectives</p>
            <h2 className="title-1">What readers learned, applied, or challenged</h2>
            <p className="subheadline mt-2">Open a thread to see the summary, question, application, disagreement, or lesson behind the book.</p>
          </div>
          <Link href={`/book/${book.id}/create-discussion`} className="hidden rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85 md:inline-flex">
            New Post
          </Link>
          <Link href={`/book/${book.id}/create-discussion`} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85 md:hidden">
            New perspective
          </Link>
        </div>

        <div className="mb-8">
          <DiscussionSortNav activeSort={sort} baseHref={`/book/${book.id}`} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <LocalDiscussionList bookId={book.id} />
            {posts.length ? posts.map((post) => <DiscussionCard key={post.id} post={post} />) : (
              <EmptyState
                title="No discussions yet"
                body="Be the first to turn this book into a useful conversation. Start with what changed your thinking, what you applied, or what you disagree with."
                action={(
                  <Link href={`/book/${book.id}/create-discussion`} className="rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85">
                    Share the first insight
                  </Link>
                )}
              />
            )}
          </div>
          {posts.length ? <CommentThread postId={posts[0].id} /> : (
            <EmptyState
              title="Comments open after the first post"
              body="BookSphere keeps comments attached to specific perspectives so replies stay focused and useful."
            />
          )}
        </div>
      </section>

      <div className="mt-16 border-t border-[color:var(--color-hairline)] pt-6">
        <SectionShelf title="Often read next" subtitle="Related books to continue with after you have seen the conversation around this one." books={nextBooks} badge="Read Next" signal="insights" />
      </div>
    </div>
  );
}

function BookOutcomeLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a href={href} className="flex min-w-0 items-center justify-center gap-2 px-2 py-2 text-center text-xs font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)] sm:text-sm">
      <span className="shrink-0 text-[color:var(--color-accent)]">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function DecisionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="caption text-[10px]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-5 text-[color:var(--color-text-secondary)]">{item}</li>
        ))}
      </ul>
    </div>
  );
}
