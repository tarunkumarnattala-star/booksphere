"use client";

import { useRef, useState } from "react";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";
import { createSupabaseKnowledgePost, knowledgePostTitleFromBody, MIN_KNOWLEDGE_POST_LENGTH } from "@/lib/knowledge-posts";
import type { KnowledgePost } from "@/lib/types";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { LoginRequiredNotice } from "./login-required-notice";

const MIN_POST_LENGTH = MIN_KNOWLEDGE_POST_LENGTH;

function storeLocalPost(post: KnowledgePost) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(LOCAL_KNOWLEDGE_POSTS_KEY) || "[]") as KnowledgePost[];
    window.localStorage.setItem(LOCAL_KNOWLEDGE_POSTS_KEY, JSON.stringify([post, ...stored.filter((item) => item.id !== post.id)]));
  } catch {
    window.localStorage.setItem(LOCAL_KNOWLEDGE_POSTS_KEY, JSON.stringify([post]));
  }
}

export function FeedComposer({
  initialTopic = "",
  compact = false,
  onPublished
}: {
  initialTopic?: string;
  compact?: boolean;
  onPublished?: (post: KnowledgePost) => void;
}) {
  const [thought, setThought] = useState("");
  const [topic, setTopic] = useState(initialTopic);
  const [referenceTitle, setReferenceTitle] = useState("");
  const [showContext, setShowContext] = useState(!compact && Boolean(initialTopic));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const publishingRef = useRef(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The whole body runs inside the latch, not just the write. requireProfile is two
    // network round trips and the Share button stayed enabled for all of it, so two taps
    // published the same thought twice: knowledge_posts has no unique constraint and the
    // community rate-limit trigger does not cover that table. The finally is what keeps a
    // throw in requireProfile from leaving the button dead until a reload.
    if (publishingRef.current) return;
    publishingRef.current = true;
    setPublishing(true);
    try {
      await runSubmit();
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  }

  async function runSubmit() {
    const cleanThought = thought.trim();
    if (cleanThought.length < MIN_POST_LENGTH) {
      setError("Write at least 4 characters before sharing.");
      return;
    }
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }

    setError("");
    const draft: KnowledgePost = {
      id: `local-knowledge-${crypto.randomUUID()}`,
      userId: auth.local ? "local-reader" : auth.profileId,
      authorName: auth.local ? "You" : undefined,
      authorUsername: auth.local ? "local-reader" : undefined,
      title: knowledgePostTitleFromBody(cleanThought),
      body: cleanThought,
      topic: topic.trim() || "Reflection",
      referenceTitle: referenceTitle.trim() || undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    try {
      let post = draft;
      if (!auth.local && !canUseLocalCommunityFallback()) {
        const result = await createSupabaseKnowledgePost({
          profileId: auth.profileId,
          title: draft.title,
          body: draft.body,
          topic: draft.topic,
          referenceTitle: draft.referenceTitle
        });
        if (!result.post) {
          setError(result.error || "We could not publish this thought.");
          return;
        }
        post = result.post;
      }

      // Only the offline preview reads this store. Writing the real server row into it as
      // well left a copy that nothing pruned on delete, and /post/<id> falls back to it when
      // the server has no row - so a deleted post came back, in full, with Edit and Delete
      // buttons, for the one person who deleted it.
      if (auth.local || canUseLocalCommunityFallback()) storeLocalPost(post);
      window.dispatchEvent(new CustomEvent("booksphere:knowledge-post-created", { detail: post }));
      onPublished?.(post);
      setThought("");
      setTopic(compact ? initialTopic : "");
      setReferenceTitle("");
      setShowContext(false);
      setPublished(true);
      window.setTimeout(() => setPublished(false), 1000);
    } catch {
      setError("We could not publish this thought. Check your connection and try again.");
    }
  }

  return (
    <form
      data-onboarding="feed-composer"
      onSubmit={submit}
      className={compact ? "" : "border-y border-[color:var(--rule)] py-5"}
    >
      {compact && initialTopic && <p className="caption caption-muted mb-3">About {initialTopic}</p>}
      <label htmlFor="feed-thought" className="sr-only">Share what you learned or noticed</label>
      <textarea
        id="feed-thought"
        value={thought}
        onChange={(event) => {
          setThought(event.target.value);
          if (error) setError("");
        }}
        rows={compact ? 3 : 4}
        maxLength={2000}
        placeholder={initialTopic ? `What did you notice about ${initialTopic}?` : "What did you learn, notice, try, or change?"}
        className="field"
      />

      {!compact && showContext && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={80} placeholder="Topic" aria-label="Topic" className="field" />
          <input value={referenceTitle} onChange={(event) => setReferenceTitle(event.target.value)} maxLength={200} placeholder="Book or source" aria-label="Book or source" className="field" />
        </div>
      )}

      {error && <p role="alert" className="footnote mt-3 border-l-2 border-[color:var(--color-rose)] pl-4 text-[color:var(--color-rose)]">{error}</p>}
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}

      <div className="control-row mt-3 justify-between">
        {!compact ? (
          <button type="button" onClick={() => setShowContext((value) => !value)} aria-expanded={showContext} className="control">
            {showContext ? "Hide the topic and book" : "Add a topic or a book"}
          </button>
        ) : <span />}
        <button type="submit" disabled={publishing || thought.trim().length < MIN_POST_LENGTH} className="btn-ink btn-sm">
          {publishing ? "Publishing" : "Publish"}
        </button>
      </div>

      {published && (
        <p
          role="status"
          aria-live="polite"
          className="caption fixed inset-x-0 bottom-[76px] z-[100] mx-auto w-fit max-w-[calc(100vw-40px)] bg-[color:var(--ink)] px-5 py-4 !text-[color:var(--paper)] md:bottom-8"
        >
          Published to the feed
        </p>
      )}
    </form>
  );
}
