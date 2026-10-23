import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { getBook } from "@/lib/data";
import { EDITORIAL_KIND_LABEL, editorialEntries, type EditorialCard } from "@/lib/editorial";

export const metadata: Metadata = pageMetadata({
  title: "The scroll",
  description: "Ten minutes of what people actually took from the books - what works, what does not, and what is still argued about.",
  path: "/scroll"
});

// Static. Nothing here is per-reader, so it is served from the edge and costs the database
// nothing no matter how many people arrive at once.
export const revalidate = 300;

// One book's cards in a row reads like a summary of that book, which is the thing this is not.
// Interleaving by position means consecutive cards come from different books and different
// kinds, so the shelf argues with itself the way it should.
function interleave(): Array<EditorialCard & { bookId: string }> {
  const lanes = editorialEntries.map((entry) => entry.cards.map((card) => ({ ...card, bookId: entry.bookId })));
  const out: Array<EditorialCard & { bookId: string }> = [];
  const depth = Math.max(...lanes.map((lane) => lane.length));
  for (let row = 0; row < depth; row += 1) {
    for (let lane = 0; lane < lanes.length; lane += 1) {
      // Offset each lane so the same kind does not line up across a row.
      const card = lanes[lane][(row + lane) % lanes[lane].length];
      if (card && !out.some((existing) => existing.id === card.id)) out.push(card);
    }
  }
  return out;
}

const KIND_TONE: Record<string, string> = {
  argument: "text-[color:var(--color-text-secondary)]",
  practice: "text-[color:var(--color-accent)]",
  limit: "text-[color:var(--color-text-secondary)]",
  contested: "text-[color:var(--color-accent)]",
  misread: "text-[color:var(--color-text-secondary)]"
};

export default function ScrollPage() {
  const cards = interleave();

  return (
    <div className="editorial-page max-w-[680px]">
      <header className="mb-5">
        <h1 className="title-1">Ten minutes, and you come out with something.</h1>
        <p className="mt-2 text-[15px] leading-6 text-[color:var(--color-text-secondary)]">
          One idea at a time from the books people actually use. What they argue, what you can do
          with them, where they stop working, and what is still being fought over.
        </p>
      </header>

      <ul className="grid gap-3">
        {cards.map((card) => {
          const book = getBook(card.bookId);
          const opponent = card.argumentWith ? getBook(card.argumentWith) : undefined;
          if (!book) return null;

          return (
            <li
              key={card.id}
              className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]"
            >
              <p className={`caption ${KIND_TONE[card.kind] || ""}`}>{EDITORIAL_KIND_LABEL[card.kind]}</p>

              <h2 className="mt-2 text-[20px] font-medium leading-[1.25] tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {card.claim}
              </h2>

              <p className="mt-2.5 text-[15px] leading-[1.6] text-[color:var(--color-text-secondary)]">{card.body}</p>

              {card.tryIt && (
                <div className="mt-3.5 rounded-[16px] bg-black/[0.03] px-4 py-3">
                  <p className="text-[12.5px] font-semibold text-[color:var(--color-text-primary)]">Try this</p>
                  <p className="mt-1 text-[14px] leading-[1.5] text-[color:var(--color-text-secondary)]">{card.tryIt}</p>
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
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-[14px] leading-6 text-[color:var(--color-text-secondary)]">
        This shelf is being built out book by book. What readers write themselves will sit above
        these, and become the reason to come back.
      </p>
    </div>
  );
}
