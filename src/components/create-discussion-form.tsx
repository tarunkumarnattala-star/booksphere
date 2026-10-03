"use client";

import { useEffect, useMemo, useState } from "react";
import { Book, PostType } from "@/lib/types";
import { requireProfile } from "@/lib/auth-client";
import { trackEvent } from "@/lib/analytics";
import { createSupabaseContribution } from "@/lib/contributions";
import { addLocalDiscussion } from "@/lib/local-discussions";
import { supabase } from "@/lib/supabase";
import { LoginRequiredNotice } from "./login-required-notice";
import { perspectiveGroups } from "@/lib/perspective-groups";

// Grouped so the differentiated kinds lead, from the one list the book page also reads
// (lib/perspective-groups.ts). A flat list of eleven put "Summary" beside "What Did Not
// Work", which reads as though they are worth the same - and they are not. A summary is the
// one thing a language model already does better than any reader will, while an account of
// what actually happened when someone applied an idea, especially when it failed, exists
// nowhere else.
//
// Quote is deliberately absent: it adds nothing a reader cannot get elsewhere and invites
// pasting copyrighted passages. Existing posts of every type still render; this governs only
// what can be written from here.
const postTypeGroups = perspectiveGroups;
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

// Matches the discussion_posts check constraints in the database.
const MIN_TITLE_LENGTH = 4;
const MIN_BODY_LENGTH = 20;

// A stranger can reach this form from six CTAs on the book page with no session check, and
// requireProfile() only runs on submit. So the sequence was: write two hundred words, press
// publish, get a "log in" notice, follow it, come back in a fresh page load - and the draft
// was gone, because it lived only in React state. That is the highest-effort contribution
// the product wants, discarded at the last step, on the action that has never once produced
// a row. The draft now survives the round trip.
function draftKey(bookId: string) {
  return `booksphere.perspectiveDraft.${bookId}`;
}

export function CreateDiscussionForm({ book, initialPostType = "Insight", initialTitle = "", starterPromptId = "" }: { book: Book; initialPostType?: PostType; initialTitle?: string; starterPromptId?: string }) {
  const [submitted, setSubmitted] = useState(false);
  // This is the product's core action and it had no double-submit guard at all: the button
  // was never disabled, and requireProfile() plus the insert is several seconds on a phone,
  // which is exactly when someone presses again. The rate-limit trigger allows 10 posts an
  // hour, so a second press published a second identical perspective.
  const [publishing, setPublishing] = useState(false);
  const [createdPostId, setCreatedPostId] = useState("");
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    postType: initialPostType,
    title: initialTitle,
    body: "",
    quoteReference: "",
    contextType: "",
    actionTaken: "",
    outcome: "",
    whatFailed: "",
    wouldChange: "",
    // The book-page prompt this perspective started from, if any. Travels with the draft.
    starterPromptId
  });
  // Restore after mount rather than in the initial state: this component is server-rendered
  // and reading localStorage during render is a hydration mismatch.
  useEffect(() => {
    // queueMicrotask because the lint rule forbids setState directly inside an effect, which
    // is the pattern the rest of this codebase already uses for exactly this.
    queueMicrotask(() => {
      try {
        const stored = window.localStorage.getItem(draftKey(book.id));
        if (!stored) return;
        const parsed = JSON.parse(stored) as Partial<typeof form>;
        if (!parsed || typeof parsed !== "object") return;
        setForm((current) => ({
          ...current,
          ...parsed,
          postType: (parsed.postType as PostType) || current.postType,
          // A restored draft about a different question keeps its own prompt link, not the one
          // in the URL; a draft saved before prompts were linked carries none.
          starterPromptId: parsed.title && parsed.title !== current.title
            ? (typeof parsed.starterPromptId === "string" ? parsed.starterPromptId : "")
            : current.starterPromptId
        }));
        setRestored(true);
      } catch {
        window.localStorage.removeItem(draftKey(book.id));
      }
    });
  }, [book.id]);

  function rememberDraft() {
    try {
      window.localStorage.setItem(draftKey(book.id), JSON.stringify(form));
    } catch {
      // A full storage quota must not stop someone publishing.
    }
  }

  function forgetDraft() {
    try {
      window.localStorage.removeItem(draftKey(book.id));
    } catch {
      // Nothing to do; the draft is stale either way.
    }
  }

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
    if (publishing || submitted) return;
    setPublishing(true);
    try {
      await runSubmit();
    } finally {
      setPublishing(false);
    }
  }

  async function runSubmit() {
    const auth = await requireProfile();
    if (!auth.ok) {
      rememberDraft();
      setNotice(auth.message);
      return;
    }
    // These mirror the database check constraints on discussion_posts
    // (title >= 4, body >= 20). Keep them in step: a looser form would let the
    // post fail at the database with a far less helpful message.
    if (form.title.trim().length < MIN_TITLE_LENGTH) {
      setError(`Give your perspective a title of at least ${MIN_TITLE_LENGTH} characters.`);
      return;
    }
    if (form.body.trim().length < MIN_BODY_LENGTH) {
      setError(`Add at least ${MIN_BODY_LENGTH} characters so another reader can follow your point.`);
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
          wouldChange: form.wouldChange.trim() || undefined,
          starterPromptId: form.starterPromptId || undefined
        })
      : {
          post: addLocalDiscussion({
            bookId: book.id,
            postType: form.postType,
            title: form.title,
            body: bodyWithStructure,
            quoteReference: form.quoteReference
          }),
          error: null,
          cause: null
        };

    if (result.error || !result.post) {
      // A failed publish used to leave no trace anywhere: the reader saw one sentence and
      // the reason died in the browser. Record the cause so a report of "it would not post"
      // can be answered from /admin/analytics instead of guessed at.
      trackEvent("write_failed", { op: "create_post", bookId: book.id, code: result.cause?.code || null, message: result.cause?.message || null });
      rememberDraft();
      setError(result.error || "We could not publish your perspective. Your draft has been preserved.");
      return;
    }
    forgetDraft();
    const post = result.post;
    setCreatedPostId(post.id);
    trackEvent(form.postType === "Application" ? "application_created" : "perspective_created", { bookId: book.id, postType: form.postType });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <p className="caption">Published</p>
        <h2 className="title-1 mt-4 max-w-[20ch]">It is on the book&rsquo;s page now.</h2>
        <p className="body-copy measure mt-5">
          Anyone reading {book.title} can see what you made of it, and reply to you about it.
        </p>
        <a href={createdPostId ? `/discussion/${createdPostId}` : `/book/${book.id}#discussions`} className="btn-ink mt-8">
          Read it back
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <p className="caption">New perspective</p>
      <h1 className="large-title mt-4 max-w-[16ch]">Share a perspective on {book.title}</h1>
      <p className="body-copy measure mt-5">
        Not a blank text box. Say what you tried, what happened, what you would push back on,
        or what you are still not sure about.
      </p>
      {restored && (
        <p role="status" className="footnote mt-5 border-l-2 border-[color:var(--ink)] pl-4 text-[color:var(--ink)]">
          The draft you started here is still in the fields below.
        </p>
      )}

      {/* The kind of perspective was a native dropdown showing "Insight" - so the product's
          own argument, that an account of what happened when you used a book is worth more
          than a summary of it, was folded away behind a chevron. All eleven are on the page,
          in their three groups, lived outcomes first. */}
      <div className="section-rule">
      <fieldset>
        <legend className="caption">What kind is it?</legend>
        <div className="mt-5 grid gap-5">
          {postTypeGroups.map((group) => (
            <div key={group.label} className="grid gap-2 border-t border-[color:var(--rule)] pt-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5">
              <p className="caption caption-muted pt-[3px]">{group.label}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {group.types.map((type) => (
                  <label key={type} className="inline-flex min-h-11 items-center">
                    <input
                      type="radio"
                      name="postType"
                      value={type}
                      checked={form.postType === type}
                      onChange={() => setForm({ ...form, postType: type })}
                      className="peer sr-only"
                    />
                    <span className="cursor-pointer text-[15px] text-[color:var(--ink-50)] transition-colors peer-checked:text-[color:var(--ink)] peer-checked:underline peer-checked:decoration-2 peer-checked:underline-offset-[6px] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[color:var(--ink)] hover:text-[color:var(--ink)]">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      </div>

      <p className="mt-8 border-l-2 border-[color:var(--ink)] pl-5">
        <span className="caption caption-muted block">The question to answer</span>
        <span className="lead mt-2 block text-[color:var(--ink)]">{activePrompt}</span>
      </p>

      <div className="mt-8 grid gap-5">
        <label className="field-label">
          <span className="caption caption-muted">Title</span>
          <input
            maxLength={180}
            value={form.title}
            onChange={(event) => { setError(""); setForm({ ...form, title: event.target.value }); }}
            placeholder="The idea that changed how I think about..."
            className="field"
          />
        </label>
        <label className="field-label">
          <span className="caption caption-muted">What you want to say</span>
          <textarea
            maxLength={10000}
            value={form.body}
            onChange={(event) => { setError(""); setForm({ ...form, body: event.target.value }); }}
            rows={10}
            placeholder="What you noticed, applied, questioned, challenged, connected, or would want another reader to understand."
            className="field"
          />
          <span className="footnote numeral">
            {bodyCount === 0
              ? `${MIN_BODY_LENGTH} characters minimum`
              : bodyCount < MIN_BODY_LENGTH
                ? `${MIN_BODY_LENGTH - bodyCount} more characters`
                : `${bodyCount} characters`}
          </span>
        </label>

        {isApplicationLike && (
          // The four fields that make this product different from a review site, so they are
          // labelled as one thing rather than dropped into a grey box.
          <div className="border-t border-[color:var(--rule)] pt-5">
            <p className="caption">What actually happened</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="field-label">
                <span className="caption caption-muted">Where</span>
                <select
                  value={form.contextType}
                  onChange={(event) => setForm({ ...form, contextType: event.target.value })}
                  className="field"
                >
                  <option value="">Choose a context</option>
                  {contextTags.map((tag) => <option key={tag}>{tag}</option>)}
                </select>
              </label>
              <label className="field-label">
                <span className="caption caption-muted">What you tried</span>
                <input maxLength={500} value={form.actionTaken} onChange={(event) => setForm({ ...form, actionTaken: event.target.value })} placeholder="The thing you actually did" className="field" />
              </label>
              <label className="field-label">
                <span className="caption caption-muted">What changed</span>
                <input maxLength={500} value={form.outcome} onChange={(event) => setForm({ ...form, outcome: event.target.value })} placeholder="The result, as plainly as you can put it" className="field" />
              </label>
              <label className="field-label">
                <span className="caption caption-muted">What did not work</span>
                <input maxLength={500} value={form.whatFailed} onChange={(event) => setForm({ ...form, whatFailed: event.target.value })} placeholder="Where the idea broke down" className="field" />
              </label>
              <label className="field-label md:col-span-2">
                <span className="caption caption-muted">What you would change</span>
                <input maxLength={500} value={form.wouldChange} onChange={(event) => setForm({ ...form, wouldChange: event.target.value })} placeholder="What you would do differently next time" className="field" />
              </label>
            </div>
          </div>
        )}

        <label className="field-label">
          <span className="caption caption-muted">Chapter or reference, if any</span>
          <input
            maxLength={500}
            value={form.quoteReference}
            onChange={(event) => setForm({ ...form, quoteReference: event.target.value })}
            placeholder="A chapter or an idea, not a long passage"
            className="field"
          />
        </label>

        {error && <p role="alert" className="footnote border-l-2 border-[color:var(--color-rose)] pl-4 text-[color:var(--color-rose)]">{error}</p>}
        {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}

        <div className="mt-3 flex flex-col items-start gap-3">
          <button disabled={publishing} className="btn-ink w-full sm:w-auto">
            {publishing ? "Publishing" : "Publish perspective"}
          </button>
          <p className="footnote">Free. You sign in with Google at this step, not before it.</p>
        </div>
      </div>
    </form>
  );
}
