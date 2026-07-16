"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { BackToFeedButton } from "./back-to-feed-button";
import { CommentThread } from "./comment-thread";
import { FollowButton } from "./follow-button";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { KnowledgePostActions } from "./knowledge-post-actions";
import { KnowledgePost } from "@/lib/types";
import { getBook, getProfileById } from "@/lib/data";
import { getSupabaseKnowledgePost } from "@/lib/knowledge-posts";

function initialsFor(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function LocalKnowledgePostPage({ id, initialPost }: { id: string; initialPost?: KnowledgePost }) {
  const [post, setPost] = useState<KnowledgePost | null | undefined>(initialPost);

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      if (initialPost) {
        if (!cancelled) setPost(initialPost);
        return;
      }
      try {
        const posts = JSON.parse(window.localStorage.getItem(LOCAL_KNOWLEDGE_POSTS_KEY) || "[]") as KnowledgePost[];
        const localPost = posts.find((item) => item.id === id);
        if (localPost) {
          if (!cancelled) setPost(localPost);
          return;
        }
      } catch {
        // A damaged local preview should not prevent a production lookup.
      }

      const remotePost = await getSupabaseKnowledgePost(id);
      if (!cancelled) setPost(remotePost);
    }

    void loadPost();
    return () => {
      cancelled = true;
    };
  }, [id, initialPost]);

  if (post === undefined) {
    return (
      <div className="editorial-page max-w-3xl">
        <p className="subheadline">Opening note...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="editorial-page max-w-3xl">
        <BackToFeedButton />
        <div className="rounded-[30px] bg-white p-8 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
          <p className="caption">Note unavailable</p>
          <h1 className="title-1 mt-2">We could not find this knowledge note.</h1>
          <p className="body-copy mt-4">It may have been removed, or the link may be incomplete.</p>
        </div>
      </div>
    );
  }

  const fallbackProfile = getProfileById(post.userId);
  const profile = {
    ...fallbackProfile,
    name: post.authorName || fallbackProfile.name,
    username: post.authorUsername || fallbackProfile.username
  };
  const referenceBook = post.bookId ? getBook(post.bookId) : null;
  const createdDate = new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="editorial-page max-w-[780px]">
      <BackToFeedButton />

      <div className="space-y-5">
        <article className="rounded-[26px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] sm:p-7">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${profile.username}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-[color:var(--color-text-primary)] text-sm font-semibold text-white">
              {initialsFor(profile.name)}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${profile.username}`} className="text-sm font-semibold transition hover:opacity-70">{profile.name}</Link>
              <p className="mt-0.5 text-xs text-[color:var(--color-text-secondary)]">{createdDate}</p>
            </div>
            <FollowButton profileUsername={profile.username} compact />
          </div>

          <p className="caption mt-6">{post.topic}</p>
          <h1 className="mt-2 max-w-3xl text-balance text-[28px] font-medium leading-[1.12] sm:text-[36px]">{post.title}</h1>
          <p className="mt-5 max-w-3xl whitespace-pre-wrap text-[17px] leading-7 text-[color:var(--color-text-secondary)] sm:text-[18px] sm:leading-8">
            {post.body}
          </p>

          {referenceBook && (
            <Link href={`/book/${referenceBook.id}`} className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 text-xs font-medium text-[color:var(--color-text-secondary)] transition hover:bg-black/[0.06]">
              <BookOpen size={14} className="shrink-0" />
              <span className="truncate">Book context · {referenceBook.title}</span>
            </Link>
          )}

          {!referenceBook && post.referenceTitle && (
            <p className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 text-xs font-medium text-[color:var(--color-text-secondary)]">
              <BookOpen size={14} className="shrink-0" />
              <span className="truncate">Context · {post.referenceTitle}</span>
            </p>
          )}

          <KnowledgePostActions post={post} onUpdated={setPost} onDeleted={() => setPost(null)} />
        </article>

        <CommentThread
          postId={post.id}
          targetType="knowledge_post"
          onCountChange={(change) => setPost((current) => current ? { ...current, comments: Math.max(0, current.comments + change) } : current)}
        />
      </div>
    </div>
  );
}
