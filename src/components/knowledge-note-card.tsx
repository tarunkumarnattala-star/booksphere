"use client";

import Link from "next/link";
import { KnowledgePost } from "@/lib/types";
import { authorProfileFor, getBook } from "@/lib/data";
import { rememberFeedPosition } from "@/lib/feed-return";

// A note is a record, like a perspective: the topic in the docket column, then what was
// written, what it was about, and who wrote it. What used to be here was a social card -
// avatar circle, Follow button, heart and speech-bubble counters both reading 0 - around
// two sentences. Nobody is following anybody yet, and saying so forty times down one page
// is the loudest possible way to say it.
export function KnowledgeNoteCard({ post }: { post: KnowledgePost; featured?: boolean }) {
  const fallbackProfile = authorProfileFor(post);
  const profile = {
    ...fallbackProfile,
    name: post.authorName || fallbackProfile.name,
    username: post.authorUsername || fallbackProfile.username
  };
  const referenceBook = post.bookId ? getBook(post.bookId) : null;
  const createdDate = new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const bodyWithoutRepeatedTitle = post.body.trim().startsWith(post.title.trim())
    ? post.body.trim().slice(post.title.trim().length).replace(/^[\s.?!:;-]+/, "").trim()
    : post.body.trim();
  // Several notes are a single sentence used as both title and body. Stripping the repeat
  // used to fall back to the full body, so the same sentence printed twice in a row.
  const body = bodyWithoutRepeatedTitle;
  const rememberPosition = () => rememberFeedPosition(post.id);

  return (
    <li data-feed-post-id={post.id} className="record">
      <p className="caption record-stamp">{post.topic || "Note"}</p>
      <div className="min-w-0">
        <h2 className="record-title">
          <Link href={`/post/${post.id}`} onClick={rememberPosition} className="transition-colors hover:text-[color:var(--accent)]">
            {post.title}
          </Link>
        </h2>
        {body && <p className="record-text line-clamp-4">{body}</p>}
        {referenceBook ? (
          <p className="record-meta">
            On{" "}
            <Link href={`/book/${referenceBook.id}`} className="underline decoration-[color:var(--rule-strong)] underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">
              {referenceBook.title}
            </Link>
          </p>
        ) : post.referenceTitle ? (
          <p className="record-meta">On {post.referenceTitle}</p>
        ) : null}
        <p className={referenceBook || post.referenceTitle ? "record-writer" : "record-writer !mt-5"}>
          Written by{" "}
          <Link href={`/profile/${profile.username}`} className="underline decoration-[color:var(--rule-strong)] underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">
            {profile.name}
          </Link>
          {" · "}
          {createdDate}
        </p>
      </div>
    </li>
  );
}
