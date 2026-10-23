import Link from "next/link";
import { authorProfileFor, getBook, isHouseAuthored } from "@/lib/data";
import type { DiscussionPost } from "@/lib/types";
import { EDITORIAL_KIND_LABEL, editorialEntries, type EditorialCard } from "@/lib/editorial";

// The scroll is the product. Ten minutes of it should leave someone with something they can
// use, which means one idea per card and no card that needs the one before it.
//
// Reader perspectives are mixed in rather than kept on a separate tab. Splitting them off made
// both halves look thin and quietly said that what readers write is a side feature, when it is
// the thing this is for. Editorial fills the shelf today; these replace it as they arrive.

type ScrollItem =
  | { source: "editorial"; card: EditorialCard & { bookId: string } }
  | { source: "reader"; post: DiscussionPost };

// A run of one book's cards reads as a summary of that book, which is the thing this is not.
// Interleaving by lane keeps consecutive cards from different books, and drops a reader's
// perspective in every few cards so the shelf never reads as one voice for long.
function buildScroll(perspectives: DiscussionPost[]): ScrollItem[] {
  const lanes = editorialEntries.map((entry) => entry.cards.map((card) => ({ ...card, bookId: entry.bookId })));
  const editorial: Array<EditorialCard & { bookId: string }> = [];
  const depth = Math.max(0, ...lanes.map((lane) => lane.length));
  const taken = new Set<string>();
  for (let row = 0; row < depth; row += 1) {
    for (let lane = 0; lane < lanes.length; lane += 1) {
      const card = lanes[lane][(row + lane) % lanes[lane].length];
      if (card && !taken.has(card.id)) {
        taken.add(card.id);
        editorial.push(card);
      }
    }
  }

  const items: ScrollItem[] = [];
  let readerIndex = 0;
  editorial.forEach((card, index) => {
    items.push({ source: "editorial", card });
    if ((index + 1) % 4 === 0 && readerIndex < perspectives.length) {
      items.push({ source: "reader", post: perspectives[readerIndex] });
      readerIndex += 1;
    }
  });
  // Anything left over still deserves to be seen rather than silently dropped.
  while (readerIndex < perspectives.length) {
    items.push({ source: "reader", post: perspectives[readerIndex] });
    readerIndex += 1;
  }
  return items;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <li className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">{children}</li>;
}

export function KnowledgeScroll({ perspectives = [] }: { perspectives?: DiscussionPost[] }) {
  // Fifty of the fifty-one perspectives in the database were written by the house account. Run
  // through the reader slot they would have told every stranger that "a reader did this" when
  // BookSphere wrote it. The house is kept out of this stream entirely: the reader cards are
  // few and real, and the gap where the rest should be is the honest state of the product.
  const readerWritten = perspectives.filter((post) => !isHouseAuthored(post));
  const items = buildScroll(readerWritten);

  return (
    <ul className="grid gap-3">
      {items.map((item) => {
        if (item.source === "reader") {
          const post = item.post;
          const book = getBook(post.bookId);
          const profile = authorProfileFor(post);
          return (
            <Shell key={`reader:${post.id}`}>
              <p className="caption text-[color:var(--color-accent)]">What a reader did</p>
              <h2 className="mt-2 text-[20px] font-medium leading-[1.25] tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {post.title}
              </h2>
              <p className="mt-2.5 line-clamp-6 text-[15px] leading-[1.6] text-[color:var(--color-text-secondary)]">{post.body}</p>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-[color:var(--color-hairline)] pt-3">
                <Link href={`/discussion/${post.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[color:var(--color-text-primary)]">
                    {book ? book.title : "On a book"}
                  </p>
                  <p className="truncate text-[13px] text-[color:var(--color-text-muted)]">{profile.name}</p>
                </Link>
                <span className="shrink-0 text-[12px] text-[color:var(--color-text-muted)]">Reader</span>
              </div>
            </Shell>
          );
        }

        const card = item.card;
        const book = getBook(card.bookId);
        const opponent = card.argumentWith ? getBook(card.argumentWith) : undefined;
        if (!book) return null;

        return (
          <Shell key={card.id}>
            <p className="caption">{EDITORIAL_KIND_LABEL[card.kind]}</p>
            <h2 className="mt-2 text-[20px] font-medium leading-[1.25] tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              {card.claim}
            </h2>
            <p className="mt-2.5 text-[15px] leading-[1.6] text-[color:var(--color-text-secondary)]">{card.body}</p>

            {card.tryIt && (
              <div className="mt-3.5 rounded-[16px] bg-black/[0.03] px-4 py-3">
                <p className="text-[12.5px] font-semibold text-[color:var(--color-text-primary)]">Try this</p>
                <p className="mt-1 text-[14px] leading-[1.5] text-[color:var(--color-text-secondary)]">{card.tryIt}</p>
                {/* The hard part of this product is not getting people to read, it is getting
                    anyone to write. "Write a perspective" is a blank page and almost nobody
                    answers it. "You read this - did it work?" is a question a person can answer
                    in two sentences, and what comes back is exactly what the next reader
                    wanted: not a summary, but what happened when someone tried it. */}
                <Link
                  href={`/book/${book.id}/create-discussion?idea=${encodeURIComponent(card.id)}`}
                  className="mt-3 inline-flex min-h-10 items-center rounded-full bg-[color:var(--color-text-primary)] px-4 text-[13px] font-semibold !text-white transition hover:opacity-85"
                >
                  I tried this
                </Link>
              </div>
            )}

            {opponent && (
              <p className="mt-3.5 text-[14px] leading-[1.5] text-[color:var(--color-text-secondary)]">
                Argues with{" "}
                <Link
                  href={`/book/${opponent.id}`}
                  className="font-medium text-[color:var(--color-text-primary)] underline underline-offset-4"
                >
                  {opponent.title}
                </Link>
                .
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[color:var(--color-hairline)] pt-3">
              <Link href={`/book/${book.id}`} className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[color:var(--color-text-primary)]">{book.title}</p>
                <p className="truncate text-[13px] text-[color:var(--color-text-muted)]">{book.author}</p>
              </Link>
              {/* Said plainly on every card. The moment a reader suspects this is a person's
                  experience when it is not, nothing else on the site is trustworthy either. */}
              <span className="shrink-0 text-[12px] text-[color:var(--color-text-muted)]">BookSphere</span>
            </div>
          </Shell>
        );
      })}
    </ul>
  );
}
