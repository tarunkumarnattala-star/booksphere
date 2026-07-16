import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, MessageCircle, ThumbsUp } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { GenrePill } from "@/components/genre-pill";
import { ProfilePrimaryAction } from "@/components/profile-primary-action";
import {
  discussions,
  getBook,
  getProfile,
  getProfileById,
  knowledgePosts,
  profiles
} from "@/lib/data";
import { contributionDestinationUrl } from "@/lib/contributions";
import { getCanonicalProfileBundle } from "@/lib/profile-data";
import type { Book, DiscussionPost, KnowledgePost } from "@/lib/types";
import { formatCount, initials } from "@/lib/utils";
import { bookCoverData } from "@/lib/book-cover-data";

type ProfileContribution =
  | { kind: "discussion"; item: DiscussionPost }
  | { kind: "knowledge"; item: KnowledgePost };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return profiles.map((profile) => ({ username: profile.username }));
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const canonicalBundle = await getCanonicalProfileBundle(username);
  const profile = canonicalBundle?.profile || getProfile(username) || (username === "local-reader" ? getProfileById("local-reader") : undefined);
  if (!profile) notFound();

  const userDiscussions = (canonicalBundle?.contributions || discussions.filter((post) => post.userId === profile.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const userKnowledge = canonicalBundle ? canonicalBundle.knowledgePosts : knowledgePosts
    .filter((post) => post.userId === profile.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const contributions: ProfileContribution[] = [
    ...userDiscussions.map((item) => ({ kind: "discussion" as const, item })),
    ...userKnowledge.map((item) => ({ kind: "knowledge" as const, item }))
  ].sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime());
  const referencedBooks = getReferencedBooks(userDiscussions, userKnowledge);
  const isEditorialProfile = profile.username === "booksphere-team";

  return (
    <div className="editorial-page max-w-[1180px]">
      <section className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-[color:var(--color-text-primary)] text-xl font-medium !text-white md:size-24">
            {initials(profile.name)}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="caption">@{profile.username}</p>
                  {isEditorialProfile && (
                    <span className="rounded-full bg-[color:var(--color-accent)]/10 px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-text-primary)]">
                      Editorial profile
                    </span>
                  )}
                </div>
                <h1 className="title-1 mt-2 text-balance">{profile.name}</h1>
                <p className="body-copy mt-3 max-w-2xl">{profile.bio}</p>
              </div>
              <ProfilePrimaryAction profileId={profile.id} profileUsername={profile.username} />
            </div>

            {profile.topGenres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.topGenres.slice(0, 3).map((genre) => <GenrePill key={genre} name={genre} />)}
              </div>
            )}
          </div>
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[color:var(--color-hairline)] pt-6 sm:grid-cols-4">
          <ProofItem label="Followers" value={formatCount(profile.followers)} />
          <ProofItem label="Following" value={formatCount(profile.following)} />
          <ProofItem label="Contributions" value={`${contributions.length}`} />
          <ProofItem label="Books referenced" value={`${referencedBooks.length}`} />
        </dl>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <main>
          <div className="mb-5">
            <p className="caption">Contributions</p>
            <h2 className="title-2 mt-2">Useful ideas shared</h2>
            <p className="body-copy mt-2 max-w-2xl text-[15px]">
              Book-grounded ideas, applications, questions, and disagreements from this reader.
            </p>
          </div>

          {contributions.length > 0 ? (
            <div className="grid gap-4">
              {contributions.slice(0, 8).map((contribution) => contribution.kind === "discussion" ? (
                <DiscussionContributionCard key={contribution.item.id} post={contribution.item} />
              ) : (
                <KnowledgeContributionCard key={contribution.item.id} post={contribution.item} />
              ))}
            </div>
          ) : (
            <EmptyContributions />
          )}
        </main>

        <aside className="lg:sticky lg:top-24">
          <div className="mb-5">
            <p className="caption">Book trail</p>
            <h2 className="title-3 mt-2">Books behind the ideas</h2>
            <p className="body-copy mt-2 text-[15px]">Only books this reader has actually referenced.</p>
          </div>

          {referencedBooks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {referencedBooks.slice(0, 6).map((book) => <ReferencedBookRow key={book.id} book={book} />)}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white p-5 text-sm leading-6 text-[color:var(--color-text-secondary)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
              Referenced books will appear after this reader shares a contribution.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ProofItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="caption text-[10px]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-[color:var(--color-text-primary)]">{value}</dd>
    </div>
  );
}

function DiscussionContributionCard({ post }: { post: DiscussionPost }) {
  const book = getBook(post.bookId);
  return (
    <article className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-[color:var(--color-text-secondary)]">{post.postType}</span>
        {book && <Link href={`/book/${book.id}`} className="caption text-[10px] transition hover:opacity-70">{book.title}</Link>}
        <span className="ml-auto text-xs font-medium text-[color:var(--color-text-muted)]">{formatShortDate(post.createdAt)}</span>
      </div>
      <Link href={contributionDestinationUrl(post)} className="group mt-4 block">
        <h3 className="title-3 text-balance transition group-hover:opacity-75">{post.title}</h3>
        <p className="body-copy mt-3 line-clamp-3 text-[15px] leading-7">{post.body}</p>
      </Link>
      <div className="mt-5 flex items-center gap-5 border-t border-[color:var(--color-hairline)] pt-4 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><ThumbsUp size={15} /> {post.likes}</span>
        <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> {post.comments}</span>
      </div>
    </article>
  );
}

function KnowledgeContributionCard({ post }: { post: KnowledgePost }) {
  const book = post.bookId ? getBook(post.bookId) : null;
  return (
    <article className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-[color:var(--color-text-secondary)]">{post.topic}</span>
        {book && <Link href={`/book/${book.id}`} className="caption text-[10px] transition hover:opacity-70">{book.title}</Link>}
        <span className="ml-auto text-xs font-medium text-[color:var(--color-text-muted)]">{formatShortDate(post.createdAt)}</span>
      </div>
      <Link href={`/post/${post.id}`} className="group mt-4 block">
        <h3 className="title-3 text-balance transition group-hover:opacity-75">{post.title}</h3>
        <p className="body-copy mt-3 line-clamp-3 text-[15px] leading-7">{post.body}</p>
      </Link>
      <div className="mt-5 flex items-center gap-5 border-t border-[color:var(--color-hairline)] pt-4 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><ThumbsUp size={15} /> {post.likes}</span>
        <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> {post.comments}</span>
      </div>
    </article>
  );
}

function ReferencedBookRow({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} className="group grid grid-cols-[58px_1fr] items-center gap-3 rounded-[22px] bg-white p-3 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] transition hover:-translate-y-0.5">
      <BookCover book={bookCoverData(book)} className="w-full rounded-[10px]" />
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[color:var(--color-text-primary)] group-hover:opacity-75">{book.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs font-medium text-[color:var(--color-text-secondary)]">{book.author}</p>
      </div>
    </Link>
  );
}

function EmptyContributions() {
  return (
    <section className="rounded-[28px] bg-white p-7 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
      <span className="grid size-10 place-items-center rounded-full bg-black/[0.04] text-[color:var(--color-text-secondary)]"><BookOpen size={18} /></span>
      <h3 className="title-3 mt-4">No contributions yet</h3>
      <p className="body-copy mt-2 max-w-xl text-[15px]">Ideas, applications, questions, and disagreements will appear here after this reader shares them.</p>
    </section>
  );
}

function getReferencedBooks(userDiscussions: DiscussionPost[], userKnowledge: KnowledgePost[]) {
  const bookIds = [
    ...userDiscussions.map((post) => post.bookId),
    ...userKnowledge.flatMap((post) => post.bookId ? [post.bookId] : [])
  ];
  return [...new Set(bookIds)].map((bookId) => getBook(bookId)).filter((book): book is Book => Boolean(book));
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
