"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackToFeedButton } from "./back-to-feed-button";
import { CommentThread } from "./comment-thread";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { KnowledgePostActions } from "./knowledge-post-actions";
import { KnowledgePost } from "@/lib/types";
import { authorProfileFor, getBook } from "@/lib/data";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";
import { getSupabaseKnowledgePost } from "@/lib/knowledge-posts";

export function LocalKnowledgePostPage({ id, initialPost }: { id: string; initialPost?: KnowledgePost }) {
  const [post, setPost] = useState<KnowledgePost | null | undefined>(initialPost);
  // Deleting used to set post to null, which rendered "We could not find this knowledge
  // note - it may have been removed, or the link may be incomplete" at the author who had
  // just removed it on purpose. A deliberate delete is not a broken link.
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      if (initialPost) {
        if (!cancelled) setPost(initialPost);
        return;
      }
      // Only consult the offline preview store when there is no database behind the app.
      // With Supabase configured this branch preferred a stale local copy over the server,
      // which is how a deleted post reappeared here: the server correctly had nothing, and
      // the reader who had just deleted it was shown it again, editable.
      if (canUseLocalCommunityFallback()) {
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
      }

      const remotePost = await getSupabaseKnowledgePost(id);
      if (!cancelled) setPost(remotePost);
    }

    void loadPost();
    return () => {
      cancelled = true;
    };
  }, [id, initialPost]);

  if (deleted) {
    return (
      <div className="editorial-page editorial-prose">
        <BackToFeedButton />
        <p className="caption mt-5">Removed</p>
        <h1 className="large-title mt-4 max-w-[20ch]">Your note has been deleted.</h1>
        <p className="body-copy measure mt-5">
          It is no longer on the feed or on your profile.{" "}
          <Link href="/feed" className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px]">Back to the feed</Link>
        </p>
      </div>
    );
  }

  if (post === undefined) {
    return (
      <div className="editorial-page editorial-prose" role="status">
        <p className="caption caption-muted">Opening the note</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="editorial-page editorial-prose">
        <BackToFeedButton />
        <p className="caption mt-5">Note unavailable</p>
        <h1 className="large-title mt-4 max-w-[20ch]">This note is not here.</h1>
        <p className="body-copy measure mt-5">It may have been removed, or the link may be incomplete.</p>
      </div>
    );
  }

  const fallbackProfile = authorProfileFor(post);
  const profile = {
    ...fallbackProfile,
    name: post.authorName || fallbackProfile.name,
    username: post.authorUsername || fallbackProfile.username
  };
  const referenceBook = post.bookId ? getBook(post.bookId) : null;
  const trimmedBody = post.body.trim();
  const bodyBelowTitle = trimmedBody.startsWith(post.title.trim())
    ? trimmedBody.slice(post.title.trim().length).replace(/^[\s.?!:;-]+/, "").trim()
    : trimmedBody;
  const createdDate = new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article className="editorial-page editorial-prose">
      <BackToFeedButton />

      <header className="mt-5 border-t-2 border-[color:var(--ink)] pt-5">
        <p className="caption">{post.topic || "Note"}</p>
        <h1 className="large-title mt-4 max-w-[20ch]">{post.title}</h1>
        <p className="footnote mt-5">
          <Link href={`/profile/${profile.username}`} className="underline decoration-[color:var(--rule-strong)] underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">
            {profile.name}
          </Link>
          {" \u00b7 "}
          {createdDate}
        </p>
      </header>

      {/* Some notes are one sentence used as both title and body. Printing it twice, once
          at 40px and once at 17px, looks like a rendering fault rather than a short note. */}
      {bodyBelowTitle && <p className="prose-perspective mt-8 whitespace-pre-wrap">{bodyBelowTitle}</p>}

      {referenceBook ? (
        <p className="footnote mt-8">
          On{" "}
          <Link href={`/book/${referenceBook.id}`} className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px] transition hover:decoration-[color:var(--ink)]">
            {referenceBook.title}
          </Link>
        </p>
      ) : post.referenceTitle ? (
        <p className="footnote mt-8">On {post.referenceTitle}</p>
      ) : null}

      <KnowledgePostActions post={post} onUpdated={setPost} onDeleted={() => setDeleted(true)} />

      <section className="section-rule">
        <CommentThread
          postId={post.id}
          targetType="knowledge_post"
          onCountChange={(change) => setPost((current) => current ? { ...current, comments: Math.max(0, current.comments + change) } : current)}
        />
      </section>
    </article>
  );
}
