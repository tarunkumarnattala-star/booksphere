import { MessageCircle, ThumbsUp } from "lucide-react";
import { DiscussionPost } from "@/lib/types";
import { getBook, getDiscussionRankingLabel, getProfileById } from "@/lib/data";
import { contributionDestinationUrl } from "@/lib/contributions";
import { BookCover } from "./book-cover";
import { bookCoverData } from "@/lib/book-cover-data";
import { FollowButton } from "./follow-button";
import { ProfileChip } from "./profile-chip";
import { PostActions } from "./post-actions";

export function DiscussionCard({ post, showBook = false, compact = false, canDelete = false, onDelete }: { post: DiscussionPost; showBook?: boolean; compact?: boolean; canDelete?: boolean; onDelete?: () => void }) {
  const profile = getProfileById(post.userId) || {
    id: post.userId,
    name: post.authorName || "Reader",
    username: post.authorUsername || "reader",
    bio: "",
    createdAt: post.createdAt,
    followers: 0,
    following: 0,
    badges: [],
    topGenres: []
  };
  const book = getBook(post.bookId);
  const ranking = getDiscussionRankingLabel(post);
  const topAwards = post.awards.slice(0, 2);
  const topUsefulness = (post.usefulness || []).slice(0, 2);

  return (
    <article id={post.id} className="interactive-lift scroll-mt-24 overflow-hidden rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <ProfileChip profile={profile} />
          <FollowButton profileUsername={profile.username} compact />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <span className="rounded-full bg-black/[0.035] px-3 py-1.5 text-[11px] font-medium text-[color:var(--color-text-secondary)]">{ranking}</span>
          <span className="rounded-full bg-black/[0.035] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--color-text-secondary)]">
            {post.postType}
          </span>
        </div>
      </div>

      {showBook && book && (
        <div className="mt-5 grid grid-cols-[48px_1fr] items-center gap-3 rounded-[18px] bg-black/[0.025] p-2 pr-3">
          <BookCover book={bookCoverData(book)} className="w-full rounded-[10px]" />
          <div className="min-w-0">
            <p className="caption text-[10px]">Book</p>
            <p className="line-clamp-1 text-sm font-medium text-[color:var(--color-text-primary)]">{book.title}</p>
          </div>
        </div>
      )}

      <a href={contributionDestinationUrl(post)} className="block">
        <h3 className="title-3 mt-5 break-words transition hover:opacity-75">{post.title}</h3>
      </a>
      <p className={`body-copy mt-3 text-[15px] leading-7 ${compact ? "line-clamp-4" : ""}`}>{post.body}</p>

      {topAwards.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {topAwards.map((award) => (
            <span key={award.type} className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)]">
              {award.count} {award.type}
            </span>
          ))}
        </div>
      )}

      {topUsefulness.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {topUsefulness.map((reaction) => (
            <span key={reaction.type} className="rounded-full bg-black/[0.035] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)]">
              {reaction.count} {reaction.type}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><ThumbsUp size={15} /> {post.likes}</span>
        <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> {post.comments}</span>
        <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>

      <PostActions post={post} targetId={post.id} likes={post.likes} comments={post.comments} saves={post.saves} follows={post.follows} awards={post.awards} usefulness={post.usefulness} canDelete={canDelete} onDelete={onDelete} />
    </article>
  );
}
