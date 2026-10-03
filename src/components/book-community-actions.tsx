"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, ThumbsDown, ThumbsUp } from "lucide-react";
import { Book } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { requireProfile } from "@/lib/auth-client";
import { resolveDbBook } from "@/lib/contributions";
import { announceSavedChange, hasLocalItem, toggleLocalItem } from "@/lib/local-store";
import { trackEvent } from "@/lib/analytics";
import { LoginRequiredNotice } from "./login-required-notice";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

export function BookCommunityActions({ book }: { book: Book }) {
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(book.saveCount);
  const [recommendation, setRecommendation] = useState<"yes" | "no" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const actionInFlight = useRef(false);

  useEffect(() => {
    if (!supabase) {
      if (!canUseLocalCommunityFallback()) return;
      queueMicrotask(() => {
        setSaved(hasLocalItem("booksphere.savedBooks", book.id));
        const recommendationValue = window.localStorage.getItem(`booksphere.recommendation.${book.id}`);
        if (recommendationValue === "yes" || recommendationValue === "no") setRecommendation(recommendationValue);
      });
      return;
    }
    let active = true;
    async function loadState() {
      const auth = await requireProfile();
      const dbBook = await resolveDbBook({ id: book.id, title: book.title, author: book.author });
      if (!dbBook?.id) return;
      const { data: counts } = await supabase!.from("book_engagement_counts").select("saves_count").eq("book_id", dbBook.id).maybeSingle();
      if (active && counts) setSaveCount(Number(counts.saves_count || 0));
      if (!auth.ok) return;
      const [savedResult, recommendationResult] = await Promise.all([
        supabase!.from("saved_books").select("id").eq("user_id", auth.profileId).eq("book_id", dbBook.id).maybeSingle(),
        supabase!.from("book_recommendations").select("recommended").eq("user_id", auth.profileId).eq("book_id", dbBook.id).maybeSingle()
      ]);
      if (!active) return;
      setSaved(Boolean(savedResult.data?.id));
      if (typeof recommendationResult.data?.recommended === "boolean") setRecommendation(recommendationResult.data.recommended ? "yes" : "no");
    }
    void loadState();
    return () => { active = false; };
  }, [book.author, book.id, book.title]);

  async function getSupabaseContext() {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return null;
    }

    if (!supabase) return { profileId: auth.profileId, bookId: book.id };
    const dbBook = await resolveDbBook({ id: book.id, title: book.title, author: book.author });

    if (!dbBook?.id) {
      setError("We could not find this book in the database yet. Try again after seed data is synced.");
      return null;
    }

    return { profileId: auth.profileId, bookId: dbBook.id };
  }

  async function toggleSaved() {
    // The guard used to be set after getSupabaseContext(), which is auth.getUser() plus up to
    // three queries, and disabled={syncing} was live for the whole of it. Two taps both read
    // saved === false, both incremented optimistically and both inserted; the second returns
    // 23505, which is deliberately treated as success - so the button read "Saved · N+2" over
    // a single row until a reload. A ref latches synchronously; state does not.
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    try {
      await runToggleSaved();
    } finally {
      actionInFlight.current = false;
    }
  }

  async function runToggleSaved() {
    const nextSaved = !saved;
    const context = await getSupabaseContext();
    if (!context) return;

    if (!supabase || context.profileId === "local-reader") {
      const nowSaved = toggleLocalItem("booksphere.savedBooks", book.id);
      setSaved(nowSaved);
      setSaveCount((count) => Math.max(0, count + (nowSaved ? 1 : -1)));
      trackEvent(nowSaved ? "book_saved" : "book_unsaved", { bookId: book.id });
      return;
    }

    setSaved(nextSaved);
    setSaveCount((count) => count + (nextSaved ? 1 : -1));
    setSyncing(true);
    setError("");

    // saved_books has no UPDATE policy, so upsert's ON CONFLICT DO UPDATE arm is refused by
    // RLS whenever a conflict is real. There is nothing to update - the row is its own key -
    // so insert and treat 23505 as already-saved.
    const { error: rawSaveError } = nextSaved
      ? await supabase.from("saved_books").insert({ user_id: context.profileId, book_id: context.bookId })
      : await supabase.from("saved_books").delete().eq("user_id", context.profileId).eq("book_id", context.bookId);
    const saveError = rawSaveError && rawSaveError.code === "23505" ? null : rawSaveError;

    if (saveError) {
      setSaved(!nextSaved);
      setSaveCount((count) => count + (nextSaved ? -1 : 1));
      setError("We could not update your saved books. Please try again.");
    } else {
      announceSavedChange();
    }
    setSyncing(false);
  }

  async function chooseRecommendation(value: "yes" | "no") {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    try {
      await runChooseRecommendation(value);
    } finally {
      actionInFlight.current = false;
    }
  }

  async function runChooseRecommendation(value: "yes" | "no") {
    const previous = recommendation;
    const context = await getSupabaseContext();
    if (!context) return;

    if (!supabase || context.profileId === "local-reader") {
      window.localStorage.setItem(`booksphere.recommendation.${book.id}`, value);
      setRecommendation(value);
      trackEvent("book_recommended", { bookId: book.id, value });
      return;
    }

    setRecommendation(value);
    setSyncing(true);
    setError("");
    const { error: recommendationError } = await supabase
      .from("book_recommendations")
      .upsert({ user_id: context.profileId, book_id: context.bookId, recommended: value === "yes" }, { onConflict: "user_id,book_id" });

    if (recommendationError) {
      setRecommendation(previous);
      setError("We could not save your recommendation. Please try again.");
    }
    setSyncing(false);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={toggleSaved}
          disabled={syncing}
          aria-label={saved ? "Remove this book from saved books" : "Save this book to revisit later"}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-semibold !text-white transition duration-200 hover:opacity-85 disabled:opacity-55 sm:w-auto"
        >
          <Bookmark size={17} className={saved ? "fill-white" : ""} />
          {saved ? "Saved" : "Save Book"}{saveCount > 0 ? ` · ${saveCount}` : ""}
        </button>
        <div className="flex w-full rounded-full bg-white p-1 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] sm:w-auto">
          <button
            type="button"
            onClick={() => chooseRecommendation("yes")}
            disabled={syncing}
            aria-label="Recommend this book if it genuinely helped you"
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition duration-200 disabled:opacity-55 ${recommendation === "yes" ? "bg-[color:var(--color-text-primary)] !text-white" : "text-[color:var(--color-text-secondary)] hover:bg-black/[0.04]"}`}
          >
            <ThumbsUp size={16} /> Recommend
          </button>
          <button
            type="button"
            onClick={() => chooseRecommendation("no")}
            disabled={syncing}
            aria-label="Mark this book as not for me"
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition duration-200 disabled:opacity-55 ${recommendation === "no" ? "bg-[color:var(--color-text-primary)] !text-white" : "text-[color:var(--color-text-secondary)] hover:bg-black/[0.04]"}`}
          >
            <ThumbsDown size={16} /> Not for me
          </button>
        </div>
      </div>
      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="mt-3 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
    </div>
  );
}
