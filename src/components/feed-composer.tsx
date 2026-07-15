"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Plus, Send } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";
import { createSupabaseKnowledgePost } from "@/lib/knowledge-posts";
import type { KnowledgePost } from "@/lib/types";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { LoginRequiredNotice } from "./login-required-notice";

function titleFromThought(thought: string) {
  const firstLine = thought.split(/\n|(?<=[.!?])\s/)[0].trim();
  return firstLine.length <= 120 ? firstLine : `${firstLine.slice(0, 117).trim()}...`;
}

function storeLocalPost(post: KnowledgePost) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(LOCAL_KNOWLEDGE_POSTS_KEY) || "[]") as KnowledgePost[];
    window.localStorage.setItem(LOCAL_KNOWLEDGE_POSTS_KEY, JSON.stringify([post, ...stored.filter((item) => item.id !== post.id)]));
  } catch {
    window.localStorage.setItem(LOCAL_KNOWLEDGE_POSTS_KEY, JSON.stringify([post]));
  }
}

export function FeedComposer() {
  const [thought, setThought] = useState("");
  const [topic, setTopic] = useState("");
  const [referenceTitle, setReferenceTitle] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanThought = thought.trim();
    if (cleanThought.length < 20) {
      setError("Add enough context for another person to understand the thought.");
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
      title: titleFromThought(cleanThought),
      body: cleanThought,
      topic: topic.trim() || "Reflection",
      referenceTitle: referenceTitle.trim() || undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

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
        setPublishing(false);
        return;
      }
      post = result.post;
    }

    storeLocalPost(post);
    window.dispatchEvent(new CustomEvent("booksphere:knowledge-post-created", { detail: post }));
    setThought("");
    setTopic("");
    setReferenceTitle("");
    setShowContext(false);
    setPublished(true);
    setPublishing(false);
    window.setTimeout(() => setPublished(false), 2200);
  }

  return (
    <form onSubmit={submit} className="rounded-[26px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-5">
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--color-text-primary)] text-sm font-semibold text-white">N</div>
        <div className="min-w-0 flex-1">
          <label htmlFor="feed-thought" className="sr-only">Share what you learned or noticed</label>
          <textarea
            id="feed-thought"
            value={thought}
            onChange={(event) => setThought(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What did you learn, notice, try, or change?"
            className="w-full resize-none border-0 bg-transparent text-[17px] font-medium leading-7 text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)]"
          />
          {showContext && (
            <div className="mt-3 grid gap-2 border-t border-[color:var(--color-hairline)] pt-3 sm:grid-cols-2">
              <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={80} placeholder="Topic (optional)" className="min-h-11 rounded-[16px] bg-black/[0.035] px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-black/15" />
              <input value={referenceTitle} onChange={(event) => setReferenceTitle(event.target.value)} maxLength={200} placeholder="Book or source (optional)" className="min-h-11 rounded-[16px] bg-black/[0.035] px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-black/15" />
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
          {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
          {published && <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[color:var(--color-green)]"><CheckCircle2 size={16} />Shared to the feed.</p>}
          <div className="mt-3 flex items-center gap-2 border-t border-[color:var(--color-hairline)] pt-3">
            <button type="button" onClick={() => setShowContext((value) => !value)} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:bg-black/[0.035] hover:text-[color:var(--color-text-primary)]">
              {showContext ? <BookOpen size={16} /> : <Plus size={16} />}
              Add context
            </button>
            <button type="submit" disabled={publishing || thought.trim().length < 20} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-4 text-sm font-medium !text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35">
              <Send size={15} />
              {publishing ? "Sharing" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
