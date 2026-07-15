import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { bookCoverData } from "@/lib/book-cover-data";
import { FollowButton } from "@/components/follow-button";
import { LocalKnowledgePostPage } from "@/components/local-knowledge-post-page";
import { discussions, getBook, getKnowledgePost, getProfileById, knowledgePosts, sortDiscussions } from "@/lib/data";

export function generateStaticParams() {
  return knowledgePosts.map((post) => ({ id: post.id }));
}

export default async function KnowledgePostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getKnowledgePost(id);
  if (!post) return <LocalKnowledgePostPage id={id} />;

  const profile = getProfileById(post.userId);
  const referenceBook = post.bookId ? getBook(post.bookId) : null;
  const recommendedNotes = knowledgePosts.filter((item) => item.id !== post.id).slice(0, 3);
  const recommendedThreads = sortDiscussions(discussions, "rising").slice(0, 3);

  return (
    <div className="editorial-page max-w-[1160px]">
      <Link href="/feed" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">
        <ArrowLeft size={16} />
        Back to feed
      </Link>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <article className="rounded-[34px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-9">
            <p className="caption">{post.topic}</p>
            <h1 className="large-title mt-4 max-w-4xl text-balance">{post.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-[color:var(--color-text-secondary)]">
              <span>By {profile.name}</span>
              <FollowButton profileUsername={profile.username} compact />
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
            </div>

            <div className="mt-10 max-w-3xl">
              <p className="text-[22px] font-normal leading-[1.55] tracking-[-0.03em] text-[color:var(--color-text-secondary)]">
                {post.body}
              </p>
            </div>

            {referenceBook && (
              <Link href={`/book/${referenceBook.id}`} className="mt-10 grid gap-4 rounded-[28px] bg-black/[0.025] p-4 transition hover:bg-black/[0.045] sm:grid-cols-[86px_1fr_auto] sm:items-center">
                <BookCover book={bookCoverData(referenceBook)} className="w-[86px] rounded-[14px]" />
                <div>
                  <p className="caption">Referenced book</p>
                  <h2 className="title-3 mt-1">{referenceBook.title}</h2>
                  <p className="subheadline mt-1">{referenceBook.author}</p>
                </div>
                <span className="hidden items-center gap-2 text-sm font-medium sm:inline-flex">
                  Open book <ArrowUpRight size={16} />
                </span>
              </Link>
            )}

            <p className="footnote mt-10 border-t border-[color:var(--color-hairline)] pt-5">Editorial knowledge note</p>
          </article>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
            <p className="caption">Why this belongs in the feed</p>
            <p className="body-copy mt-3 text-[15px] leading-7">
              Feed posts are knowledge pills: useful reflections, questions, lessons, and mental models. They can reference a book, but they do not have to be book reviews.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
            <p className="caption">More useful notes</p>
            <div className="mt-4 space-y-4">
              {recommendedNotes.map((note) => (
                <Link key={note.id} href={`/post/${note.id}`} className="block rounded-[20px] bg-black/[0.025] p-4 transition hover:bg-black/[0.045]">
                  <p className="caption text-[10px]">{note.topic}</p>
                  <h2 className="mt-1 line-clamp-2 text-base font-medium leading-snug text-[color:var(--color-text-primary)]">{note.title}</h2>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
            <p className="caption">Threads to open next</p>
            <div className="mt-4 space-y-4">
              {recommendedThreads.map((thread) => {
                const book = getBook(thread.bookId);
                if (!book) return null;
                return (
                  <Link key={thread.id} href={`/book/${book.id}#discussions`} className="grid grid-cols-[48px_1fr] gap-3 rounded-[20px] bg-black/[0.025] p-3 transition hover:bg-black/[0.045]">
                    <BookCover book={bookCoverData(book)} className="w-full rounded-[10px]" />
                    <span className="min-w-0">
                      <span className="block line-clamp-2 text-sm font-medium text-[color:var(--color-text-primary)]">{thread.title}</span>
                      <span className="mt-1 block truncate text-xs text-[color:var(--color-text-secondary)]">{book.title}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
