import Link from "next/link";
import { notFound } from "next/navigation";
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
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

type ProfileContribution =
  | { kind: "discussion"; item: DiscussionPost }
  | { kind: "knowledge"; item: KnowledgePost };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return profiles.map((profile) => ({ username: profile.username }));
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const bundle = await getCanonicalProfileBundle(username);
  const profile = bundle?.profile || getProfile(username);
  if (!profile) return pageMetadata({ title: "Reader not found", noIndex: true });
  return pageMetadata({
    title: `${profile.name} (@${profile.username})`,
    description: profile.bio?.trim() || `What ${profile.name} has applied, questioned, and learned from books.`,
    path: `/profile/${profile.username}`
  });
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
    <div className="editorial-page">
      <header>
        <p className="caption">
          @{profile.username}
          {isEditorialProfile ? <span className="caption-muted">{" \u00b7 "}Editorial account</span> : null}
        </p>
        <h1 className="large-title mt-4">{profile.name}</h1>
        {profile.bio && <p className="body-copy measure mt-5">{profile.bio}</p>}
        <div className="mt-8">
          <ProfilePrimaryAction profileId={profile.id} profileUsername={profile.username} />
        </div>
      </header>

      {/* Followers and Following used to lead this row as two large numerals. Both are real
          counts of a table that is empty, so the page opened by telling every visitor that
          nobody follows this person. What is actually here - what they wrote, and the books
          behind it - is countable and worth counting. */}
      <dl className="facts mt-8 border-t border-[color:var(--rule)] pt-5">
        <div>
          <dt className="caption caption-muted">Perspectives</dt>
          <dd className="numeral">{userDiscussions.length}</dd>
        </div>
        <div>
          <dt className="caption caption-muted">Notes</dt>
          <dd className="numeral">{userKnowledge.length}</dd>
        </div>
        <div>
          <dt className="caption caption-muted">Books referenced</dt>
          <dd className="numeral">{referencedBooks.length}</dd>
        </div>
        {profile.topGenres.length > 0 && (
          <div>
            <dt className="caption caption-muted">Writes about</dt>
            <dd>{profile.topGenres.slice(0, 3).join(", ")}</dd>
          </div>
        )}
      </dl>

      <section id="contributions" className="section-rule scroll-mt-24">
        <p className="caption">Everything {profile.name} has written</p>
        {contributions.length > 0 ? (
          <ol className="records records-tight">
            {contributions.slice(0, 20).map((contribution) => contribution.kind === "discussion" ? (
              <DiscussionContributionRecord key={contribution.item.id} post={contribution.item} />
            ) : (
              <KnowledgeContributionRecord key={contribution.item.id} post={contribution.item} />
            ))}
          </ol>
        ) : (
          <p className="body-copy measure mt-5">
            Nothing yet. What this reader applies, questions, challenges or learns will appear here.
          </p>
        )}
      </section>

      {referencedBooks.length > 0 && (
        <section id="books-referenced" className="section-rule scroll-mt-24">
          <p className="caption">Books behind the writing</p>
          <ul className="mt-5 grid gap-x-8 border-t border-[color:var(--rule-strong)] sm:grid-cols-2">
            {referencedBooks.map((book) => (
              <li key={book.id} className="border-b border-[color:var(--rule)]">
                <Link href={`/book/${book.id}`} prefetch={false} className="block py-2.5 transition-colors hover:bg-[color:var(--band)]">
                  <span className="block text-[15px] leading-snug text-[color:var(--ink)]">{book.title}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-[color:var(--ink-50)]">{book.author}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 border-t border-[color:var(--rule)] pt-4">
        <Link href={`/profile/${profile.username}/connections?view=following`} className="caption caption-muted inline-flex min-h-11 items-center transition-colors hover:text-[color:var(--ink)]">
          Who {profile.name} follows
        </Link>
      </p>
    </div>
  );
}

function DiscussionContributionRecord({ post }: { post: DiscussionPost }) {
  const book = getBook(post.bookId);
  return (
    <li className="record">
      <p className="caption record-stamp">{post.postType}</p>
      <div className="min-w-0">
        <h3 className="record-title">
          <Link href={contributionDestinationUrl(post)} className="transition-colors hover:text-[color:var(--accent)]">{post.title}</Link>
        </h3>
        <p className="record-text line-clamp-3">{post.body}</p>
        {book && (
          <p className="record-meta">
            <Link href={`/book/${book.id}`} className="underline decoration-[color:var(--rule-strong)] underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">{book.title}</Link>
          </p>
        )}
        <p className={book ? "record-writer" : "record-writer !mt-5"}>{formatShortDate(post.createdAt)}</p>
      </div>
    </li>
  );
}

function KnowledgeContributionRecord({ post }: { post: KnowledgePost }) {
  const book = post.bookId ? getBook(post.bookId) : null;
  return (
    <li className="record">
      <p className="caption record-stamp">{post.topic || "Note"}</p>
      <div className="min-w-0">
        <h3 className="record-title">
          <Link href={`/post/${post.id}`} className="transition-colors hover:text-[color:var(--accent)]">{post.title}</Link>
        </h3>
        <p className="record-text line-clamp-3">{post.body}</p>
        {book && (
          <p className="record-meta">
            <Link href={`/book/${book.id}`} className="underline decoration-[color:var(--rule-strong)] underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">{book.title}</Link>
          </p>
        )}
        <p className={book ? "record-writer" : "record-writer !mt-5"}>{formatShortDate(post.createdAt)}</p>
      </div>
    </li>
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
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
