"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { DiscussionCard } from "@/components/discussion-card";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth-client";
import { getSupabaseContributionsByIds } from "@/lib/contributions";
import { books, discussions, getMostSaved, getSavedInsightPosts } from "@/lib/data";
import { getLocalDiscussions } from "@/lib/local-discussions";
import { getLocalProfile } from "@/lib/local-session";
import { getLocalItems } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import type { Book, DiscussionPost } from "@/lib/types";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

export function SavedClient() {
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [savedInsightIds, setSavedInsightIds] = useState<string[]>([]);
  const [remoteInsights, setRemoteInsights] = useState<DiscussionPost[]>([]);
  const [localPosts, setLocalPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function refresh() {
      if (!supabase) {
        queueMicrotask(() => {
          if (!active) return;
          if (!canUseLocalCommunityFallback()) {
            setSignedIn(false);
            setLoading(false);
            return;
          }
          setSavedBookIds(getLocalItems("booksphere.savedBooks"));
          setSavedInsightIds(getLocalItems("booksphere.savedInsights"));
          setLocalPosts(getLocalDiscussions());
          setSignedIn(Boolean(getLocalProfile()));
          setLoading(false);
        });
        return;
      }

      setLoading(true);
      const auth = await requireProfile();
      if (!auth.ok) {
        if (active) {
          setSignedIn(false);
          setLoading(false);
        }
        return;
      }

      const [savedBooksResult, savedInsightsResult] = await Promise.all([
        supabase.from("saved_books").select("book_id,books(title,author)").eq("user_id", auth.profileId).order("created_at", { ascending: false }),
        supabase.from("saved_insights").select("discussion_post_id").eq("user_id", auth.profileId).order("created_at", { ascending: false })
      ]);

      if (!active) return;
      if (savedBooksResult.error || savedInsightsResult.error) {
        setError("Your saved shelf could not be loaded. Please refresh and try again.");
        setSignedIn(true);
        setLoading(false);
        return;
      }

      const localBookIds = (savedBooksResult.data || []).map((row) => {
        const relation = Array.isArray(row.books) ? row.books[0] : row.books;
        return books.find((book) => book.title === relation?.title && book.author === relation?.author)?.id;
      }).filter((id): id is string => Boolean(id));
      const insightIds = (savedInsightsResult.data || []).map((row) => row.discussion_post_id as string);
      const insights = await getSupabaseContributionsByIds(insightIds);
      if (!active) return;
      setSavedBookIds(localBookIds);
      setSavedInsightIds(insightIds);
      setRemoteInsights(insights);
      setSignedIn(true);
      setLoading(false);
    }

    void refresh();
    window.addEventListener("booksphere-local-store-change", refresh);
    window.addEventListener("booksphere-local-discussions-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener("booksphere-local-store-change", refresh);
      window.removeEventListener("booksphere-local-discussions-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const savedBooks = useMemo(() => {
    const selected = savedBookIds.map((id) => books.find((book) => book.id === id)).filter((book): book is Book => Boolean(book));
    return selected.length ? selected : getMostSaved(undefined, 6);
  }, [savedBookIds]);

  const savedInsights = useMemo(() => {
    if (supabase) return remoteInsights;
    const allPosts = [...localPosts, ...discussions];
    const selected = savedInsightIds.map((id) => allPosts.find((post) => post.id === id)).filter((post): post is DiscussionPost => Boolean(post));
    return selected.length ? selected : getSavedInsightPosts(4);
  }, [localPosts, remoteInsights, savedInsightIds]);

  if (loading) return <p role="status" className="body-copy mt-10">Loading your saved shelf...</p>;

  if (signedIn === false) {
    return (
      <div className="mt-8">
        <EmptyState title="Log in to open your saved shelf" body="Saved books and insights are private to your account and stay available across devices after you sign in." action={<Link href="/login" className="rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white">Log in</Link>} />
      </div>
    );
  }

  const hasPersonalSaves = savedBookIds.length > 0 || savedInsightIds.length > 0;

  return (
    <>
      {error && <p role="alert" className="mt-8 rounded-[20px] bg-[color:var(--color-rose)]/10 p-4 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
      {!hasPersonalSaves && <div className="mt-8"><EmptyState title="Your saved shelf is ready" body="Save a book or insight to make this page personal. Your private shelf will appear here." /></div>}

      {savedInsights.length > 0 && (
        <section className="mt-14">
          <h2 className="title-2 mb-5">My Saved Insights</h2>
          <div className="grid gap-5 lg:grid-cols-2">{savedInsights.map((post) => <DiscussionCard key={post.id} post={post} showBook compact />)}</div>
        </section>
      )}

      {savedBooks.length > 0 && (
        <section className="mt-14">
          <h2 className="title-2 mb-5">{savedBookIds.length ? "My Saved Books" : "Books readers save most"}</h2>
          <div className="shelf-scroll flex gap-5 overflow-x-auto pb-4">{savedBooks.map((book) => <BookCard key={book.id} book={book} badge={savedBookIds.length ? "Saved" : "Most Saved"} signal="saves" />)}</div>
        </section>
      )}
    </>
  );
}
