"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { KnowledgePost } from "@/lib/types";
import { LOCAL_KNOWLEDGE_POSTS_KEY } from "./knowledge-feed";
import { LoginRequiredNotice } from "./login-required-notice";

export function KnowledgeForm() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const body = String(form.get("body") || "").trim();
    const topic = String(form.get("topic") || "").trim() || "Knowledge Note";
    if (title.length < 4 || body.length < 20) {
      setError("Give the post a useful title and enough context to help someone think better.");
      return;
    }
    setError("");
    const post: KnowledgePost = {
      id: `local-knowledge-${crypto.randomUUID()}`,
      userId: auth.local ? "local-reader" : auth.profileId,
      title,
      body,
      topic,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    try {
      const stored = JSON.parse(window.localStorage.getItem(LOCAL_KNOWLEDGE_POSTS_KEY) || "[]") as KnowledgePost[];
      window.localStorage.setItem(LOCAL_KNOWLEDGE_POSTS_KEY, JSON.stringify([post, ...stored]));
    } catch {
      window.localStorage.setItem(LOCAL_KNOWLEDGE_POSTS_KEY, JSON.stringify([post]));
    }
    setSaved(true);
    event.currentTarget.reset();
    window.setTimeout(() => router.push("/feed"), 450);
  }

  return (
    <form onSubmit={submit} className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
      <p className="caption">Knowledge Post</p>
      <h1 className="title-1 mt-2">Share a short knowledge note.</h1>
      <p className="body-copy mt-4 max-w-2xl text-[16px]">
        The strongest BookSphere posts are tied to a book. Use this for a quick note, or choose a book first when you want your insight to become part of a book&apos;s knowledge map.
      </p>
      <div className="mt-6 grid gap-4">
        <input name="title" placeholder="A lesson, mental model, quote note, or recommendation" className="rounded-[20px] bg-black/[0.035] px-4 py-3 font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
        <textarea name="body" rows={8} placeholder="Write the useful part. What should someone understand, try, question, or remember?" className="rounded-[20px] bg-black/[0.035] px-4 py-3 font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
        <input name="topic" placeholder="Optional topic or genre" className="rounded-[20px] bg-black/[0.035] px-4 py-3 font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
        {error && <p role="alert" className="rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
        {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
        {saved && <p className="flex items-center gap-2 rounded-[16px] bg-[color:var(--color-green)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-green)]"><CheckCircle2 size={17} />Published to your feed.</p>}
        <button className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-semibold !text-white transition hover:opacity-85">Publish note</button>
      </div>
    </form>
  );
}
