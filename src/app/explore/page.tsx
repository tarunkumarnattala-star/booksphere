import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { KnowledgeScroll } from "@/components/knowledge-scroll";
import { getSupabaseFeedContributions } from "@/lib/contributions";

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description: "Ten minutes of what people actually took from the books - what works, what does not, and what is still argued about.",
  path: "/explore"
});

// Home used to open on a featured question and a list of perspective cards, which described
// the product rather than being it. The thing a time-poor reader came for is the scroll, so
// the scroll is what the app opens on.
//
// Five minutes of cache: the editorial half never changes between deploys and the reader half
// is shared by everyone, so a crowd arriving on one link costs the database almost nothing.
export const revalidate = 300;

export default async function HomePage() {
  const perspectives = await getSupabaseFeedContributions(24);

  return (
    <div className="editorial-page max-w-[680px]">
      <header className="mb-5">
        <h1 className="title-1">Ten minutes, and you come out with something.</h1>
        <p className="mt-2 text-[15px] leading-6 text-[color:var(--color-text-secondary)]">
          One idea at a time, each one from a book. What it argues, what you can do with it,
          where it stops working, and what is still being fought over. For thinking that is not
          about one book, go to the Feed.
        </p>
      </header>

      <KnowledgeScroll perspectives={perspectives} />

      <p className="mt-6 text-center text-[14px] leading-6 text-[color:var(--color-text-secondary)]">
        The shelf is being built out book by book. What readers write themselves sits in here
        alongside it, and becomes the reason to come back.
      </p>
    </div>
  );
}
