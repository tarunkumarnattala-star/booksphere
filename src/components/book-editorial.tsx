import Link from "next/link";
import { getBook } from "@/lib/data";
import { EDITORIAL_KIND_LABEL, editorialForBook, type EditorialKind } from "@/lib/editorial";

// The same five kinds the scroll shows, grouped here instead of interleaved: on a book page a
// reader has chosen this book and wants it whole, in order, rather than one card at a time.
const ORDER: EditorialKind[] = ["argument", "practice", "limit", "contested", "misread"];

export function BookEditorial({ bookId }: { bookId: string }) {
  const entry = editorialForBook(bookId);
  if (!entry) return null;

  return (
    <section id="editorial" className="mt-8 scroll-mt-24">
      <h2 className="title-2">{entry.inOneLine}</h2>
      <p className="mt-2 text-[15px] leading-6 text-[color:var(--color-text-secondary)]">
        Who it helps: {entry.forWhom}
      </p>

      {ORDER.map((kind) => {
        const cards = entry.cards.filter((card) => card.kind === kind);
        if (!cards.length) return null;

        return (
          <div key={kind} className="mt-6">
            <p className="caption mb-2.5">{EDITORIAL_KIND_LABEL[kind]}</p>
            <ul className="grid gap-2.5">
              {cards.map((card) => {
                const opponent = card.argumentWith ? getBook(card.argumentWith) : undefined;
                return (
                  <li key={card.id} className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
                    <h3 className="text-[17px] font-medium leading-[1.3] tracking-[-0.025em] text-[color:var(--color-text-primary)]">
                      {card.claim}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.55] text-[color:var(--color-text-secondary)]">{card.body}</p>

                    {card.tryIt && (
                      <div className="mt-3 rounded-[14px] bg-black/[0.03] px-3.5 py-3">
                        <p className="text-[12.5px] font-semibold text-[color:var(--color-text-primary)]">Try this</p>
                        <p className="mt-1 text-[14px] leading-[1.5] text-[color:var(--color-text-secondary)]">{card.tryIt}</p>
                        <Link
                          href={`/book/${bookId}/create-discussion?idea=${encodeURIComponent(card.id)}`}
                          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-[color:var(--color-text-primary)] px-4 text-[13px] font-semibold !text-white transition hover:opacity-85"
                        >
                          I tried this
                        </Link>
                      </div>
                    )}

                    {opponent && (
                      <p className="mt-3 text-[14px] leading-[1.5] text-[color:var(--color-text-secondary)]">
                        Argues with{" "}
                        <Link href={`/book/${opponent.id}`} className="font-medium text-[color:var(--color-text-primary)] underline underline-offset-4">
                          {opponent.title}
                        </Link>
                        .
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {/* Said once per page rather than on every card: at this density, a label on each one
          would be noise, and the claim still has to be made plainly. */}
      <p className="mt-4 text-[13px] leading-5 text-[color:var(--color-text-muted)]">
        Written by BookSphere. What readers have written themselves is below.
      </p>
    </section>
  );
}
