"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { DiscussionCard } from "@/components/discussion-card";
import { EmptyState } from "@/components/empty-state";
import { KnowledgeNoteCard } from "@/components/knowledge-note-card";
import { requireProfile } from "@/lib/auth-client";
import { getSupabaseContributionsByIds, localBookForDbBook } from "@/lib/contributions";
import { getSupabaseKnowledgePostsByIds } from "@/lib/knowledge-posts";
import { books, discussions, getMostSaved, getSavedInsightPosts } from "@/lib/data";
import { getLocalDiscussions } from "@/lib/local-discussions";
import { getLocalProfile } from "@/lib/local-session";
import { getLocalItems } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import type { Book, DiscussionPost, KnowledgePost } from "@/lib/types";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

// Any localStorage key changing in another tab fires `storage` here, and trackEvent writes
// booksphere.analytics on every like, save, share and report. So a like in a second tab
// used to blank this whole page to "Loading your saved shelf..." and refetch it.
const WATCHED_STORAGE_KEYS = new Set([
  "booksphere.savedBooks",
  "booksphere.savedInsights",
  "booksphere.savedKnowledgePosts",
  "booksphere.localDiscussions"
]);

export function SavedClient() {
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [savedInsightIds, setSavedInsightIds] = useState<string[]>([]);
  const [remoteInsights, setRemoteInsights] = useState<DiscussionPost[]>([]);
  const [savedNotes, setSavedNotes] = useState<KnowledgePost[]>([]);
  const [localPosts, setLocalPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    // `active` only flips on unmount, so two overlapping refreshes could land out of order
    // and the slower, older one would win. A run token settles that.
    let latestRun = 0;
    let hasLoadedOnce = false;

    async function refresh() {
      const run = ++latestRun;
      const stale = () => !active || run !== latestRun;
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

      // Only the first load blanks the page. A refetch triggered by another tab used to
      // replace the whole shelf with "Loading your saved shelf..." for the length of four
      // queries.
      if (!hasLoadedOnce) setLoading(true);
      // setError was never cleared anywhere in this file, and the error branch returns
      // before everything else, so one transient failure left the reader looking at a red
      // box for the rest of the session no matter how many successful refetches followed.
      setError("");
      const auth = await requireProfile();
      if (stale()) return;
      if (!auth.ok) {
        setSignedIn(false);
        setLoading(false);
        hasLoadedOnce = true;
        return;
      }

      const [savedBooksResult, savedInsightsResult, savedNotesResult] = await Promise.all([
        supabase.from("saved_books").select("book_id,books(slug,title,author)").eq("user_id", auth.profileId).order("created_at", { ascending: false }).limit(200),
        supabase.from("saved_insights").select("discussion_post_id").eq("user_id", auth.profileId).order("created_at", { ascending: false }).limit(200),
        supabase.from("saved_knowledge_posts").select("knowledge_post_id").eq("user_id", auth.profileId).order("created_at", { ascending: false }).limit(200)
      ]);

      if (stale()) return;
      if (savedBooksResult.error || savedInsightsResult.error || savedNotesResult.error) {
        setError("Your saved shelf could not be loaded. Please refresh and try again.");
        setSignedIn(true);
        setLoading(false);
        hasLoadedOnce = true;
        return;
      }

      // Matching on the author string is the exact failure 20260806000000 added books.slug
      // to eliminate: the catalog says "Peter Thiel and Blake Masters" and the database says
      // "Peter Thiel" (also Never Split the Difference and Outlive). Every one of those saves
      // was dropped on the floor here, and with no other saves the page then told the reader
      // their shelf was empty while the rows sat in the database.
      const localBookIds = (savedBooksResult.data || []).map((row) => {
        const relation = Array.isArray(row.books) ? row.books[0] : row.books;
        return localBookForDbBook(relation as { title: string; slug?: string | null } | null)?.id;
      }).filter((id): id is string => Boolean(id));
      const insightIds = (savedInsightsResult.data || []).map((row) => row.discussion_post_id as string);
      const noteIds = (savedNotesResult.data || []).map((row) => row.knowledge_post_id as string);
      const [insights, notes] = await Promise.all([
        getSupabaseContributionsByIds(insightIds),
        getSupabaseKnowledgePostsByIds(noteIds)
      ]);
      if (stale()) return;
      setSavedBookIds(localBookIds);
      setSavedInsightIds(insightIds);
      setRemoteInsights(insights);
      setSavedNotes(notes);
      setSignedIn(true);
      setLoading(false);
      hasLoadedOnce = true;
    }

    function onStorage(event: Event) {
      const key = (event as StorageEvent).key;
      if (key && !WATCHED_STORAGE_KEYS.has(key)) return;
      void refresh();
    }

    void refresh();
    window.addEventListener("booksphere-local-store-change", refresh);
    window.addEventListener("booksphere-local-discussions-change", refresh);
    // Unsaving from this very page deletes the row and updated only the button, so the card
    // stayed on the shelf reading "Save Insight" until a reload.
    window.addEventListener("booksphere-saved-change", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("booksphere-local-store-change", refresh);
      window.removeEventListener("booksphere-local-discussions-change", refresh);
      window.removeEventListener("booksphere-saved-change", refresh);
      window.removeEventListener("storage", onStorage);
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
        <EmptyState title="Log in to open your saved shelf" body="Saved books and perspectives are private to your account and stay available across devices after you sign in." action={<Link href="/login" className="rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white">Log in</Link>} />
      </div>
    );
  }

  // On a failed load this used to print the error, then "Your saved shelf is ready" - which
  // says the opposite - and then a shelf of editorial books under "Books readers save most",
  // all at once. Say one thing.
  if (error) {
    return <p role="alert" className="mt-8 rounded-[20px] bg-[color:var(--color-rose)]/10 p-4 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>;
  }

  const hasPersonalSaves = savedBookIds.length > 0 || savedInsightIds.length > 0 || savedNotes.length > 0;

  return (
    <>
      {!hasPersonalSaves && <div className="mt-8"><EmptyState title="Your saved shelf is ready" body="Save a book or a perspective to make this page personal. Your private shelf will appear here." /></div>}

      {savedInsights.length > 0 && (
        <section className="mt-14">
          <h2 className="title-2 mb-5">My Saved Perspectives</h2>
          <div className="grid gap-5 lg:grid-cols-2">{savedInsights.map((post) => <DiscussionCard key={post.id} post={post} showBook compact />)}</div>
        </section>
      )}

      {savedNotes.length > 0 && (
        <section className="mt-14">
          <h2 className="title-2 mb-5">My Saved Posts</h2>
          <div className="grid gap-5 lg:grid-cols-2">{savedNotes.map((post) => <KnowledgeNoteCard key={post.id} post={post} />)}</div>
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
