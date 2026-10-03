import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookCommunityActions } from "@/components/book-community-actions";
import { BookCover } from "@/components/book-cover";
import { DiscussionCard } from "@/components/discussion-card";
import { LocalDiscussionList } from "@/components/local-discussion-list";
import { PerspectivePrompts } from "@/components/perspective-prompts";
import { DiscussionSort } from "@/lib/types";
import { books, discussionSortOptions, getBook, getBookConcepts, getBookIdeas, getBookKnowledgePreview, getDiscussionsForBook, getOftenReadNext, sortDiscussions } from "@/lib/data";
import { perspectiveGroups } from "@/lib/perspective-groups";
import { promptPoolForBook } from "@/lib/perspective-prompts";
import { getSupabaseContributionsForBook } from "@/lib/contributions";
import { isSupabaseConfigured } from "@/lib/supabase";
import { bookCoverData } from "@/lib/book-cover-data";
import { slugify } from "@/lib/utils";

// The catalog is the complete set of valid params, so anything else is genuinely not a
// page. Declaring that lets Next answer with a real 404 at the routing layer; calling
// notFound() from inside the page renders the right screen but still returns HTTP 200,
// which reads to a crawler as a valid page and gets indexed.
export const dynamicParams = false;

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

function parseSort(value?: string): DiscussionSort {
  return discussionSortOptions.some((option) => option.value === value) ? value as DiscussionSort : "hot";
}

// The book's own name in the tab, in browser history, and on any link someone shares.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);
  if (!book) return pageMetadata({ title: "Book not found", noIndex: true });
  return pageMetadata({
    title: `${book.title} by ${book.author}`,
    description: `What readers applied, questioned, challenged, and learned from ${book.title}.`,
    path: `/book/${book.id}`
  });
}

export default async function BookPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ sort?: string; thread?: string }> }) {
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
  const concepts = getBookConcepts(book.id);

  // The perspectives are printed in the product's own three groups, in the product's own
  // order: what happened when someone used the book first, then where it breaks down, then
  // what it means. A group with nothing in it is not printed - on most of 394 books that
  // would be three empty headings - and the open angles are offered underneath instead.
  const groups = perspectiveGroups
    .map((group) => ({ ...group, posts: posts.filter((post) => group.types.includes(post.postType)) }))
    .filter((group) => group.posts.length > 0);
  // A type that predates the current eleven (Quote) would otherwise vanish from its book.
  const ungrouped = posts.filter((post) => !perspectiveGroups.some((group) => group.types.includes(post.postType)));

  return (
    <div className="editorial-page">
      <header className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-8">
        <BookCover book={bookCoverData(book)} priority className="w-full" />
        <div className="min-w-0">
          <p className="caption">
            {book.genres.slice(0, 2).map((genre, index) => (
              <span key={genre}>
                {index > 0 && <span className="text-[color:var(--ink-50)]"> / </span>}
                <Link href={`/genre/${slugify(genre)}`} className="transition-colors hover:text-[color:var(--ink)]">{genre}</Link>
              </span>
            ))}
          </p>
          <h1 className="large-title mt-4">{book.title}</h1>
          <p className="lead mt-3">{book.author}</p>
        </div>
      </header>

      {/* For every book without an editorial override, `coreThesis` is literally
          `description + " " + whyMatters`, so printing both put the same two sentences on the
          page twice, 900px apart. The longer one runs here, where a reader asks the question;
          the ideas section goes straight to the ideas. */}
      <section className="mt-8">
        <p className="caption">What this book is about</p>
        <p className="body-copy measure mt-4">{preview ? preview.coreThesis : book.description}</p>
      </section>

      {/* Four facts, label above value, in the order a reader asks for them. The perspective
          count is a real count of what has been written, not an engagement figure. */}
      <dl className="facts mt-8 border-t border-[color:var(--rule)] pt-5">
        <div>
          <dt className="caption caption-muted">Published</dt>
          <dd className="numeral">{book.publicationLabel}</dd>
        </div>
        {preview && (
          <div>
            <dt className="caption caption-muted">Time to read</dt>
            <dd>{preview.fullBookDecision.timeCommitment}</dd>
          </div>
        )}
        <div>
          <dt className="caption caption-muted">Perspectives</dt>
          <dd className="numeral">{posts.length}</dd>
        </div>
        <div>
          <dt className="caption caption-muted">Best for</dt>
          <dd>{book.bestForTags.slice(0, 3).join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-5">
        <Link href={`/book/${book.id}/create-discussion`} className="btn-ink w-full sm:w-auto sm:self-start">
          Share a perspective
        </Link>
        <BookCommunityActions book={book} />
      </div>

      {preview && (
        <section id="knowledge-preview" className="section-rule scroll-mt-24">
          <p className="caption">The ideas</p>
          <h2 className="title-1 mt-4 max-w-[20ch]">What the book argues</h2>

          <ol className="records">
            {ideas.map((idea) => (
              <li key={idea.id} className="record">
                <p className="caption record-stamp">{idea.chapterOrConcept}</p>
                <div className="min-w-0">
                  <h3 className="record-title">{idea.title}</h3>
                  <p className="record-text">{idea.shortExplanation}</p>
                  {/* The example is the part a reader can act on, so it is set apart from the
                      explanation by a rule rather than buried as a third paragraph. */}
                  <p className="record-text mt-5 border-l border-[color:var(--rule-strong)] pl-5 text-[color:var(--ink)]">
                    {idea.practicalExample}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {book.sourceLinks.length > 0 && (
            <p className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="caption caption-muted">Source</span>
              {book.sourceLinks.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="footnote text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] decoration-1 underline-offset-[5px] transition hover:decoration-[color:var(--ink)]"
                >
                  {source.label}
                </a>
              ))}
            </p>
          )}
        </section>
      )}

      <section id="discussions" className="section-rule scroll-mt-24">
        <p className="caption">Perspectives</p>
        <h2 className="title-1 mt-4 max-w-[20ch]">
          {posts.length ? "What readers made of it" : "Nobody has written about this one yet"}
        </h2>
        <p className="body-copy measure mt-5">
          {posts.length
            ? "Grouped by what each one is: what happened when someone used the book, where it breaks down, and what it means."
            : "Every reader takes something different from a book. Pick a question below and answer it your way."}
        </p>

        <LocalDiscussionList bookId={book.id} />

        {groups.map((group) => (
          <section key={group.label} className="mt-[52px]">
            <h3 className="caption caption-muted">{group.label}</h3>
            <ol className="records records-tight">
              {group.posts.map((post) => <DiscussionCard key={post.id} post={post} />)}
            </ol>
          </section>
        ))}

        {ungrouped.length > 0 && (
          <section className="mt-[52px]">
            <h3 className="caption caption-muted">Also written about this book</h3>
            <ol className="records records-tight">
              {ungrouped.map((post) => <DiscussionCard key={post.id} post={post} />)}
            </ol>
          </section>
        )}

        {/* Readers scrolling past existing perspectives get angles nobody has taken yet. */}
        <div className="mt-[52px]">
          <PerspectivePrompts
            bookId={book.id}
            pool={promptPoolForBook(book)}
            answeredTitles={posts.map((post) => post.title)}
            frame={{
              title: posts.length ? "Angles nobody has taken yet" : "Four ways in",
              body: "Pick one you can speak to. Each opens the composer with the question already in place."
            }}
          />
        </div>
      </section>

      {preview && (
        <section id="full-book-decision" className="section-rule scroll-mt-24">
          <p className="caption">Worth reading?</p>
          <h2 className="title-1 mt-4 max-w-[20ch]">Whether to read the whole thing</h2>
          <p className="body-copy measure mt-5">
            Read the full book for the author&rsquo;s complete argument and examples. Use BookSphere
            for orientation and for what happened when other people tried it.
          </p>
          <div className="mt-[52px] grid gap-8 md:grid-cols-3 md:gap-5">
            <DecisionList title="Read it if" items={preview.fullBookDecision.readFullBookIf.slice(0, 2)} />
            <DecisionList title="This page may be enough if" items={preview.fullBookDecision.previewEnoughIf.slice(0, 2)} />
            <DecisionList title="Choose another if" items={preview.fullBookDecision.chooseAnotherIf.slice(0, 2)} />
          </div>
          <div className="mt-8 border-t border-[color:var(--rule)] pt-5">
            <p className="caption caption-muted">Keep in mind</p>
            <p className="body-copy measure mt-3">{preview.limitations[0]}</p>
          </div>
          {concepts.length > 0 && (
            <div className="mt-8 border-t border-[color:var(--rule)] pt-5">
              <p className="caption caption-muted">Language from the book</p>
              <p className="body-copy mt-3">{concepts.slice(0, 6).map((concept) => concept.name).join(" \u00b7 ")}</p>
            </div>
          )}
        </section>
      )}

      {nextBooks.length > 0 && (
        <section className="section-rule">
          <p className="caption">Often read next</p>
          <ol className="records records-tight">
            {nextBooks.slice(0, 4).map((next) => (
              <li key={next.id} className="record record-media">
                <Link href={`/book/${next.id}`} className="block w-full md:w-[96px]" tabIndex={-1} aria-hidden="true">
                  <BookCover book={bookCoverData(next)} className="w-full" />
                </Link>
                <div className="min-w-0">
                  <h3 className="record-title">
                    <Link href={`/book/${next.id}`} className="transition-colors hover:text-[color:var(--accent)]">{next.title}</Link>
                  </h3>
                  {/* Title and author only. Both of the per-book lines available here -
                      whyMatters and bestForTags - fall back to one string shared by every
                      book in a genre, so the list printed the same sentence four times. */}
                  <p className="record-meta !mt-2">{next.author}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function DecisionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="caption caption-muted">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="body-copy text-[color:var(--ink)]">{item}</li>
        ))}
      </ul>
    </div>
  );
}
