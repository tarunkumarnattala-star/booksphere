import Link from "next/link";
import { Bookmark, MessageCircle, ThumbsUp } from "lucide-react";
import { DiscussionPost } from "@/lib/types";
import { getBook, getDiscussionRankingLabel, getProfileById } from "@/lib/data";
import { BookCover } from "./book-cover";
import { bookCoverData } from "@/lib/book-cover-data";
import { initials } from "@/lib/utils";

export function TrendingDiscussionCard({ post, featured = false }: { post: DiscussionPost; featured?: boolean }) {
  const book = getBook(post.bookId);
  const profile = getProfileById(post.userId);
  const ranking = getDiscussionRankingLabel(post);

  if (!book) return null;

  return (
    <Link
      href={`/book/${book.id}#discussions`}
      className="interactive-lift group flex w-[84vw] max-w-[360px] shrink-0 snap-start flex-col rounded-[26px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] md:w-[360px]"
    >
      <div className="flex gap-4">
        <BookCover book={bookCoverData(book)} priority={featured} className="w-[82px] shrink-0 rounded-[14px] shadow-[0_12px_26px_rgba(0,0,0,0.12)]" />
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-text-secondary)]">{ranking}</span>
            <span className="caption text-[10px]">{post.postType}</span>
          </div>
          <h3 className="mt-3 line-clamp-2 text-[18px] font-medium leading-[1.15] tracking-[-0.035em] text-[color:var(--color-text-primary)]">
            {post.title}
          </h3>
          <p className="mt-1 truncate text-sm font-normal text-[color:var(--color-text-secondary)]">{book.title}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-[14px] font-normal leading-6 text-[color:var(--color-text-secondary)]">
        {post.body}
      </p>

      <div className="mt-5 flex min-w-0 items-center justify-between gap-4 border-t border-[color:var(--color-hairline)] pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-text-primary)] text-xs font-medium !text-white">
            {initials(profile.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-[color:var(--color-text-primary)]">{profile.name}</span>
            <span className="block truncate text-xs font-normal text-[color:var(--color-text-secondary)]">{profile.badges[0]}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 text-[13px] font-medium text-[color:var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1"><ThumbsUp size={14} />{post.likes}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle size={14} />{post.comments}</span>
          <span className="inline-flex items-center gap-1"><Bookmark size={14} />{post.saves}</span>
        </div>
      </div>
    </Link>
  );
}
