"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Plus, Send, Sparkles } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";
import { createSupabaseKnowledgePost, knowledgePostTitleFromBody } from "@/lib/knowledge-posts";
import type { KnowledgePost } from "@/lib/types";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { LoginRequiredNotice } from "./login-required-notice";

const MIN_POST_LENGTH = 4;

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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    setPublishing(true);
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

      storeLocalPost(post);
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
    } finally {
      setPublishing(false);
    }
  }

  return (
    <form data-onboarding="feed-composer" onSubmit={submit} className={`rounded-[26px] bg-white shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] ${compact ? "p-4" : "p-4 md:p-5"}`}>
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--color-text-primary)] text-sm font-semibold text-white">
          {compact ? <Sparkles size={17} /> : "N"}
        </div>
        <div className="min-w-0 flex-1">
          {compact && initialTopic && <p className="caption mb-2 text-[10px]">About {initialTopic}</p>}
          <label htmlFor="feed-thought" className="sr-only">Share what you learned or noticed</label>
          <textarea
            id="feed-thought"
            value={thought}
            onChange={(event) => {
              setThought(event.target.value);
              if (error) setError("");
            }}
            rows={compact ? 2 : 3}
            maxLength={2000}
            placeholder={initialTopic ? `What did you notice about ${initialTopic}?` : "What did you learn, notice, try, or change?"}
            className="w-full resize-none border-0 bg-transparent text-[17px] font-medium leading-7 text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)]"
          />
          {!compact && showContext && (
            <div className="mt-3 grid gap-2 border-t border-[color:var(--color-hairline)] pt-3 sm:grid-cols-2">
              <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={80} placeholder="Topic (optional)" className="min-h-11 rounded-[16px] bg-black/[0.035] px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-black/15" />
              <input value={referenceTitle} onChange={(event) => setReferenceTitle(event.target.value)} maxLength={200} placeholder="Book or source (optional)" className="min-h-11 rounded-[16px] bg-black/[0.035] px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-black/15" />
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
          {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
          <div className="mt-3 flex items-center gap-2 border-t border-[color:var(--color-hairline)] pt-3">
            {!compact && (
              <button type="button" onClick={() => setShowContext((value) => !value)} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:bg-black/[0.035] hover:text-[color:var(--color-text-primary)]">
                {showContext ? <BookOpen size={16} /> : <Plus size={16} />}
                Add context
              </button>
            )}
            <button type="submit" disabled={publishing || thought.trim().length < MIN_POST_LENGTH} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-4 text-sm font-medium !text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35">
              <Send size={15} />
              {publishing ? "Sharing" : "Share"}
            </button>
          </div>
        </div>
      </div>
      {published && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-[100] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)] md:bottom-8"
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          Posted to your feed.
        </div>
      )}
    </form>
  );
}
