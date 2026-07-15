"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookCover } from "./book-cover";
import { CommentThread } from "./comment-thread";
import { FollowButton } from "./follow-button";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { PostActions } from "./post-actions";
import { KnowledgePost } from "@/lib/types";
import { getBook, getProfileById, knowledgePosts } from "@/lib/data";
import { getSupabaseKnowledgePost } from "@/lib/knowledge-posts";

export function LocalKnowledgePostPage({ id }: { id: string }) {
  const [post, setPost] = useState<KnowledgePost | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
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
  }, [id]);

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
        <Link href="/feed" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
          <ArrowLeft size={16} />
          Back to feed
        </Link>
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
  const recommendedNotes = knowledgePosts.slice(0, 3);
  const referenceBook = post.bookId ? getBook(post.bookId) : null;

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
            </div>
            <p className="mt-10 max-w-3xl text-[22px] font-normal leading-[1.55] tracking-[-0.03em] text-[color:var(--color-text-secondary)]">
              {post.body}
            </p>

            {referenceBook && (
              <Link href={`/book/${referenceBook.id}`} className="mt-10 grid gap-3 rounded-[24px] bg-black/[0.025] p-3 transition hover:bg-black/[0.045] sm:grid-cols-[70px_1fr] sm:items-center">
                <BookCover book={referenceBook} className="w-[70px] rounded-[12px]" />
                <span>
                  <span className="caption block">Referenced book</span>
                  <span className="title-3 mt-1 block">{referenceBook.title}</span>
                  <span className="subheadline mt-1 block">{referenceBook.author}</span>
                </span>
              </Link>
            )}

            {!referenceBook && post.referenceTitle && (
              <div className="mt-8 rounded-[20px] bg-black/[0.025] px-4 py-3">
                <p className="caption text-[10px]">Optional reference</p>
                <p className="mt-1 text-sm font-medium text-[color:var(--color-text-primary)]">{post.referenceTitle}</p>
              </div>
            )}

            <PostActions targetId={post.id} likes={post.likes} comments={post.comments} />
          </article>

          <CommentThread postId={post.id} />
        </div>

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
            <p className="caption">Reader note</p>
            <p className="body-copy mt-3 text-[15px] leading-7">A practical thought shared from someone&apos;s reading, work, or lived experience.</p>
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
        </aside>
      </section>
    </div>
  );
}
