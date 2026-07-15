"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb } from "lucide-react";
import { Book, PostType } from "@/lib/types";
import { requireProfile } from "@/lib/auth-client";
import { trackEvent } from "@/lib/analytics";
import { createSupabaseContribution } from "@/lib/contributions";
import { addLocalDiscussion } from "@/lib/local-discussions";
import { supabase } from "@/lib/supabase";
import { LoginRequiredNotice } from "./login-required-notice";

const postTypes: PostType[] = ["Insight", "Application", "Disagreement", "Summary", "Question", "Connection", "Real-Life Result", "What Did Not Work", "Limitation", "Quote", "Personal Experience"];
const promptByType: Record<PostType, string> = {
  Insight: "What idea changed how you think?",
  Application: "How did you apply this in real life?",
  Disagreement: "What do you disagree with, and why?",
  Question: "What part of this book do you want others to help explain?",
  Quote: "What line stood out, and what does it mean to you? Avoid long copyrighted passages.",
  Summary: "What is the most useful explanation of this idea?",
  Connection: "What other book, idea, or experience helps explain this?",
  "Real-Life Result": "What changed after you used this idea?",
  "What Did Not Work": "What did you try, why did it fail, and what would you do differently?",
  Limitation: "Where is this book incomplete, too general, or risky without more context?",
  "Personal Experience": "How did this book connect to something you lived through?"
};

const contextTags = ["Work", "Leadership", "Study", "Finance", "Relationships", "Health", "Communication", "Startup", "Personal Habits", "Creativity"];

export function CreateDiscussionForm({ book }: { book: Book }) {
  const [submitted, setSubmitted] = useState(false);
  const [createdPostId, setCreatedPostId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    postType: "Insight" as PostType,
    title: "",
    body: "",
    quoteReference: "",
    contextType: "",
    actionTaken: "",
    outcome: "",
    whatFailed: "",
    wouldChange: ""
  });
  const activePrompt = promptByType[form.postType];
  const bodyCount = useMemo(() => form.body.trim().length, [form.body]);
  const isApplicationLike = form.postType === "Application" || form.postType === "Real-Life Result" || form.postType === "What Did Not Work";

  function structuredBody() {
    const parts = [form.body.trim()];
    if (form.contextType) parts.push(`Context: ${form.contextType}`);
    if (form.actionTaken.trim()) parts.push(`Action taken: ${form.actionTaken.trim()}`);
    if (form.outcome.trim()) parts.push(`Result: ${form.outcome.trim()}`);
    if (form.whatFailed.trim()) parts.push(`What did not work: ${form.whatFailed.trim()}`);
    if (form.wouldChange.trim()) parts.push(`What I would change: ${form.wouldChange.trim()}`);
    return parts.join("\n\n");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    if (form.title.trim().length < 8) {
      setError("Give the thread a specific title so readers know why it is worth opening.");
      return;
    }
    if (form.body.trim().length < 80) {
      setError("Add at least 80 characters. BookSphere works best when posts include a useful idea, example, or question.");
      return;
    }
    setError("");
    const bodyWithStructure = structuredBody();
    const result = supabase
      ? await createSupabaseContribution({
          profileId: auth.profileId,
          book,
          postType: form.postType,
          title: form.title.trim(),
          body: bodyWithStructure,
          quoteReference: form.quoteReference.trim() || undefined,
          contextType: form.contextType || undefined,
          actionTaken: form.actionTaken.trim() || undefined,
          outcome: form.outcome.trim() || undefined,
          whatFailed: form.whatFailed.trim() || undefined,
          wouldChange: form.wouldChange.trim() || undefined
        })
      : {
          post: addLocalDiscussion({
            bookId: book.id,
            postType: form.postType,
            title: form.title,
            body: bodyWithStructure,
            quoteReference: form.quoteReference
          }),
          error: null
        };

    if (result.error || !result.post) {
      setError(result.error || "We could not publish your perspective. Your draft has been preserved.");
      return;
    }
    const post = result.post;
    setCreatedPostId(post.id);
    trackEvent(form.postType === "Application" ? "application_created" : "perspective_created", { bookId: book.id, postType: form.postType });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
        <CheckCircle2 className="text-[color:var(--color-green)]" />
        <h2 className="title-2 mt-4">Insight published</h2>
        <p className="body-copy mt-2 text-[15px] leading-6">
          Your perspective is now attached to this book so other readers can learn from the idea, application, question, or disagreement you shared.
        </p>
        <a href={`/book/${book.id}#${createdPostId || "discussions"}`} className="mt-5 inline-flex rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85">
          View your insight
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
      <div className="mb-6">
        <p className="caption">Share Insight</p>
        <h1 className="title-1 mt-2">Share a perspective on {book.title}.</h1>
        <p className="body-copy mt-4 max-w-2xl text-[16px]">BookSphere is not a blank comment box. Add the idea, reference, application, or disagreement that would help another reader understand the book better.</p>
      </div>

      <div className="mb-6 rounded-[24px] bg-[#f7f2e8] p-5">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-1 text-[color:var(--color-accent)]" size={18} />
          <div>
            <p className="caption text-[10px]">Prompt for {form.postType}</p>
            <p className="headline mt-2 text-[color:var(--color-text-primary)]">{activePrompt}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Post type
          <select
            value={form.postType}
            onChange={(event) => setForm({ ...form, postType: event.target.value as PostType })}
            className="rounded-[20px] bg-black/[0.035] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
          >
            {postTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Title
          <input
            maxLength={180}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="The idea that changed how I think about..."
            className="rounded-[20px] bg-black/[0.035] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Body
          <textarea
            maxLength={10000}
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
            rows={8}
            placeholder="Write the useful part: what you noticed, applied, questioned, challenged, connected, or would want another reader to understand."
            className="rounded-[20px] bg-black/[0.035] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
          />
          <span className="text-xs font-medium text-[color:var(--color-text-muted)]">{bodyCount}/80 minimum characters</span>
        </label>
        {isApplicationLike && (
          <div className="grid gap-4 rounded-[24px] bg-black/[0.025] p-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Context tag
              <select
                value={form.contextType}
                onChange={(event) => setForm({ ...form, contextType: event.target.value })}
                className="rounded-[20px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              >
                <option value="">Choose a context</option>
                {contextTags.map((tag) => <option key={tag}>{tag}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Action taken
              <input
                maxLength={500}
                value={form.actionTaken}
                onChange={(event) => setForm({ ...form, actionTaken: event.target.value })}
                placeholder="What did you actually try?"
                className="rounded-[20px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Result
              <input
                maxLength={500}
                value={form.outcome}
                onChange={(event) => setForm({ ...form, outcome: event.target.value })}
                placeholder="What changed?"
                className="rounded-[20px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              What did not work
              <input
                maxLength={500}
                value={form.whatFailed}
                onChange={(event) => setForm({ ...form, whatFailed: event.target.value })}
                placeholder="Where did the idea break down?"
                className="rounded-[20px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              What would you change?
              <input
                maxLength={500}
                value={form.wouldChange}
                onChange={(event) => setForm({ ...form, wouldChange: event.target.value })}
                placeholder="What would you do differently next time?"
                className="rounded-[20px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              />
            </label>
          </div>
        )}
        <label className="grid gap-2 text-sm font-medium">
          Optional quote or reference
          <input
            maxLength={500}
            value={form.quoteReference}
            onChange={(event) => setForm({ ...form, quoteReference: event.target.value })}
            placeholder="Chapter, idea, or short reference. Avoid copyrighted passages."
            className="rounded-[20px] bg-black/[0.035] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
          />
        </label>
        {error && <p role="alert" className="rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
        {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
        <button className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85">
          Submit discussion
        </button>
      </div>
    </form>
  );
}
