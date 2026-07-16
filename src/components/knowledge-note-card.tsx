"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, MessageCircle } from "lucide-react";
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
  const fallbackProfile = getProfileById(post.userId);
  const profile = {
    ...fallbackProfile,
    name: post.authorName || fallbackProfile.name,
    username: post.authorUsername || fallbackProfile.username
  };
  const referenceBook = post.bookId ? getBook(post.bookId) : null;
  const createdDate = new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const bodyWithoutRepeatedTitle = post.body.trim().startsWith(post.title.trim())
    ? post.body.trim().slice(post.title.trim().length).replace(/^[\s.?!:;-]+/, "").trim()
    : post.body.trim();
  const body = bodyWithoutRepeatedTitle || post.body;
  const isLong = body.length > 260;

  return (
    <article className="interactive-lift flex flex-col rounded-[30px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-7">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link href={`/profile/${profile.username}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-text-primary)] text-sm font-semibold text-white transition hover:opacity-85">
            {initialsFor(profile.name)}
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/profile/${profile.username}`} className="text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:opacity-70">
                {profile.name}
              </Link>
            </div>
            <p className="mt-1 text-xs font-medium text-[color:var(--color-text-secondary)]">
              {createdDate} · {profile.badges[0] || "Thoughtful Reader"}
            </p>
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <FollowButton profileUsername={profile.username} compact />
        </div>
      </div>

      <Link href={`/post/${post.id}`} className="group mt-4 block">
        <p className="caption mb-3 text-[10px]">{post.topic}</p>
        <h2 className={`${featured ? "title-2" : "title-3"} line-clamp-3 max-w-3xl text-balance group-hover:opacity-75`}>
          {post.title}
        </h2>
        <p className="body-copy mt-3 line-clamp-4 text-[15px] leading-6 md:text-base md:leading-7">
          {body}
        </p>
        {isLong && <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)]">Read more <ArrowUpRight size={16} /></span>}
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

      {!referenceBook && post.referenceTitle && (
        <p className="mt-5 inline-flex w-fit items-center rounded-full bg-black/[0.035] px-3 py-2 text-xs font-medium text-[color:var(--color-text-secondary)]">
          Book or source: {post.referenceTitle}
        </p>
      )}

      <div className="mt-5 flex items-center gap-5 border-t border-[color:var(--color-hairline)] pt-4 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <Link href={`/post/${post.id}`} className="inline-flex items-center gap-1.5 transition hover:text-[color:var(--color-text-primary)]" aria-label={`${post.likes} likes`}><Heart size={15} /> {post.likes}</Link>
        <Link href={`/post/${post.id}#comments`} className="inline-flex items-center gap-1.5 transition hover:text-[color:var(--color-text-primary)]" aria-label={`${post.comments} comments`}><MessageCircle size={15} /> {post.comments}</Link>
        <Link href={`/post/${post.id}`} className="ml-auto text-xs transition hover:text-[color:var(--color-text-primary)]">Open post</Link>
      </div>
    </article>
  );
}
