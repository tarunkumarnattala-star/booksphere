"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { KnowledgePost } from "@/lib/types";
import { getBook, getProfileById } from "@/lib/data";
import { BookCover } from "./book-cover";
import { FollowButton } from "./follow-button";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function KnowledgeNoteCard({ post, featured = false }: { post: KnowledgePost; featured?: boolean }) {
  const profile = getProfileById(post.userId);
  const referenceBook = post.bookId ? getBook(post.bookId) : null;
  const createdDate = new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <article className="interactive-lift flex flex-col rounded-[30px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/profile/${profile.username}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-text-primary)] text-sm font-semibold text-white transition hover:opacity-85">
            {initialsFor(profile.name)}
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/profile/${profile.username}`} className="text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:opacity-70">
                {profile.name}
              </Link>
              <FollowButton profileUsername={profile.username} compact />
            </div>
            <p className="mt-1 text-xs font-medium text-[color:var(--color-text-secondary)]">
              {createdDate} · {profile.badges[0] || "Thoughtful Reader"}
            </p>
          </div>
        </div>
        <p className="caption rounded-full bg-black/[0.035] px-3 py-2 text-[10px]">{post.topic}</p>
      </div>

      <Link href={`/post/${post.id}`} className="group mt-5 block">
        <h2 className={`${featured ? "title-2" : "title-3"} line-clamp-3 max-w-3xl text-balance group-hover:opacity-75`}>
          {post.title}
        </h2>
        <p className="body-copy mt-4 line-clamp-5 text-[15px] leading-7 md:text-base">
          {post.body}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)]">
          Read full note <ArrowUpRight size={16} />
        </span>
      </Link>

      {referenceBook && (
        <Link href={`/book/${referenceBook.id}`} className="mt-6 grid grid-cols-[64px_1fr] items-center gap-4 rounded-[22px] bg-black/[0.025] p-3 pr-4 transition hover:bg-black/[0.045]">
          <BookCover book={referenceBook} className="w-full rounded-[12px]" />
          <div className="min-w-0">
            <p className="caption text-[10px]">Optional reference</p>
            <p className="line-clamp-1 text-base font-medium tracking-[-0.02em] text-[color:var(--color-text-primary)]">{referenceBook.title}</p>
            <p className="line-clamp-1 text-sm font-medium text-[color:var(--color-text-secondary)]">{referenceBook.author}</p>
          </div>
        </Link>
      )}

      <p className="footnote mt-6 border-t border-[color:var(--color-hairline)] pt-5">Editorial knowledge note</p>
    </article>
  );
}
