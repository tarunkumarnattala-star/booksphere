"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Bookmark, Flag, Heart, MessageCircle, Pencil, PlusCircle, Share2, Trash2 } from "lucide-react";
import { AwardType, DiscussionAward, DiscussionPost, PostType, UsefulnessReaction, UsefulnessReactionType } from "@/lib/types";
import { requireProfile } from "@/lib/auth-client";
import { dbReactionByLabel, deleteSupabaseContribution, getUserContributionState, toggleSupabaseFollowDiscussion, toggleSupabaseLike, toggleSupabaseSaveInsight, updateSupabaseContribution } from "@/lib/contributions";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";
import { announceSavedChange, hasLocalItem, toggleLocalItem } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import { LoginRequiredNotice } from "./login-required-notice";

const awardOptions: AwardType[] = ["Changed My Thinking", "Practical Advice", "Great Summary", "Best Explanation", "Actionable", "Deep Insight"];
const usefulnessOptions: UsefulnessReactionType[] = ["Helped me understand", "Helped me apply", "Changed my thinking", "Strong counterargument", "Best summary", "Worth reading full book"];
const editablePostTypes: PostType[] = ["Insight", "Application", "Disagreement", "Summary", "Question", "Connection", "Real-Life Result", "What Did Not Work", "Limitation", "Quote", "Personal Experience"];

// The totals passed in already include the viewer's own row, so only the change made in
// this session should move the number.
function visibleCount(total: number, selected: boolean, persisted: boolean) {
  if (selected === persisted) return total;
  return Math.max(0, total + (selected ? 1 : -1));
}

export function PostActions({
  post,
  likes,
  comments,
  saves = 0,
  follows = 0,
  awards = [],
  usefulness = [],
  canDelete = false,
  targetId,
  onDelete
}: {
  post?: DiscussionPost;
  likes: number;
  comments: number;
  saves?: number;
  follows?: number;
  awards?: DiscussionAward[];
  usefulness?: UsefulnessReaction[];
  canDelete?: boolean;
  targetId?: string;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  // The counts handed to this component are unfiltered totals - `likes` is a count(*) over
  // the likes table, and saves/follows come from discussion_engagement_counts, a view that
  // sees every row. The viewer's own like is therefore ALREADY in them. Rendering
  // `likes + (liked ? 1 : 0)` counted it a second time, so a perspective you had already
  // liked read one higher than the same card's own "{post.likes}" two lines above it, and
  // unliking left the number one too high until a reload. Track what the server actually
  // had and render the difference, which is what knowledge-post-actions already does.
  const [persistedLiked, setPersistedLiked] = useState(false);
  const [persistedSaved, setPersistedSaved] = useState(false);
  const [persistedFollowing, setPersistedFollowing] = useState(false);
  const [reported, setReported] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAwards, setSelectedAwards] = useState<AwardType[]>([]);
  const [persistedAwards, setPersistedAwards] = useState<AwardType[]>([]);
  const [selectedUsefulness, setSelectedUsefulness] = useState<UsefulnessReactionType[]>([]);
  const [persistedUsefulness, setPersistedUsefulness] = useState<UsefulnessReactionType[]>([]);
  const [openPicker, setOpenPicker] = useState<"usefulness" | "award" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [syncingCommunity, setSyncingCommunity] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam or manipulation");
  const [reporting, setReporting] = useState(false);
  const [editDraft, setEditDraft] = useState({
    postType: post?.postType || "Insight" as PostType,
    title: post?.title || "",
    body: post?.body || "",
    quoteReference: post?.quoteReference || "",
    contextType: post?.contextType || "",
    actionTaken: post?.actionTaken || "",
    outcome: post?.outcome || "",
    whatFailed: post?.whatFailed || "",
    wouldChange: post?.wouldChange || ""
  });

  useEffect(() => {
    if (!targetId) return;
    if (supabase) return;
    if (!canUseLocalCommunityFallback()) return;
    queueMicrotask(() => {
      // persisted* deliberately stays false here. In the offline preview the totals come
      // from the static catalog and never contained a locally stored like, so a local like
      // really is one the displayed number does not know about.
      setLiked(hasLocalItem("booksphere.likedPosts", targetId));
      setSaved(hasLocalItem("booksphere.savedInsights", targetId));
      setFollowing(hasLocalItem("booksphere.followedDiscussions", targetId));
      setReported(hasLocalItem("booksphere.reportedPosts", targetId));
      try {
        setSelectedAwards(JSON.parse(window.localStorage.getItem(`booksphere.awards.${targetId}`) || "[]") as AwardType[]);
      } catch {
        setSelectedAwards([]);
      }
      try {
        setSelectedUsefulness(JSON.parse(window.localStorage.getItem(`booksphere.usefulness.${targetId}`) || "[]") as UsefulnessReactionType[]);
      } catch {
        setSelectedUsefulness([]);
      }
    });
  }, [targetId]);

  useEffect(() => {
    if (!supabase || !targetId) return;
    const client = supabase;
    let cancelled = false;
    async function loadUserReactions() {
      const auth = await requireProfile();
      if (!auth.ok) return;
      const [usefulnessResult, awardsResult] = await Promise.all([
        client.from("useful_reactions").select("reaction_type").eq("user_id", auth.profileId).eq("target_type", "discussion_post").eq("target_id", targetId),
        client.from("post_awards").select("award_type").eq("user_id", auth.profileId).eq("discussion_post_id", targetId)
      ]);
      if (cancelled) return;
      const labels = (usefulnessResult.data || [])
        .map((row) => Object.entries(dbReactionByLabel).find(([, db]) => db === row.reaction_type)?.[0] as UsefulnessReactionType | undefined)
        .filter((label): label is UsefulnessReactionType => Boolean(label));
      setSelectedUsefulness(labels);
      setPersistedUsefulness(labels);
      const awardLabels = (awardsResult.data || []).map((row) => row.award_type as AwardType);
      setSelectedAwards(awardLabels);
      setPersistedAwards(awardLabels);
    }
    void loadUserReactions();
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  useEffect(() => {
    if (!post) return;
    const activePost = post;
    let cancelled = false;
    async function loadOwner() {
      const auth = await requireProfile();
      if (cancelled || !auth.ok) return;
      setIsOwner(auth.profileId === activePost.userId);
    }
    void loadOwner();
    return () => {
      cancelled = true;
    };
  }, [post]);

  // requireProfile() plus getUserContributionState is four round trips. The buttons are
  // clickable for the whole of it, and a click inside that window used to be overwritten by
  // the pre-click snapshot arriving late - the heart emptied for a like that had succeeded.
  // One flag per action: a Save inside that window must not also abandon the like and follow
  // state, which is what a single shared flag did.
  const actedRef = useRef({ like: false, save: false, follow: false });
  const usefulnessInFlight = useRef(false);

  useEffect(() => {
    if (!supabase || !targetId) return;
    const activeTargetId = targetId;
    let cancelled = false;
    actedRef.current = { like: false, save: false, follow: false };
    async function loadUserState() {
      const auth = await requireProfile();
      if (!auth.ok) return;
      const state = await getUserContributionState(auth.profileId, activeTargetId);
      if (cancelled) return;
      if (!actedRef.current.like) {
        setLiked(state.liked);
        setPersistedLiked(state.liked);
      }
      if (!actedRef.current.save) {
        setSaved(state.saved);
        setPersistedSaved(state.saved);
      }
      if (!actedRef.current.follow) {
        setFollowing(state.following);
        setPersistedFollowing(state.following);
      }
    }
    void loadUserState();
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  // router.refresh() re-renders the server tree and hands this component new totals while
  // the client state survives. Those totals already reflect whatever the reader has done, so
  // the delta has to reset to zero - otherwise a like counted once by the server was counted
  // again here, which is the whole bug this baseline exists to stop. FollowButton calls
  // router.refresh() and sits on the same card, so this is reachable on every card.
  const totalsKey = `${likes}|${saves}|${follows}`;
  const lastTotalsRef = useRef(totalsKey);
  useEffect(() => {
    if (lastTotalsRef.current === totalsKey) return;
    lastTotalsRef.current = totalsKey;
    setPersistedLiked(liked);
    setPersistedSaved(saved);
    setPersistedFollowing(following);
  }, [totalsKey, liked, saved, following]);

  async function requireAction(callback: () => void) {
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    callback();
  }

  async function toggleCommunityAction(
    kind: "like" | "save" | "follow",
    current: boolean,
    setter: (value: boolean) => void,
    countError: string
  ) {
    if (!targetId) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }

    const next = !current;
    if (syncingCommunity) return;
    actedRef.current[kind] = true;
    setSyncingCommunity(true);
    setter(next);
    setError("");

    if (!supabase) {
      if (!canUseLocalCommunityFallback()) {
        setter(current);
        setError(COMMUNITY_UNAVAILABLE_MESSAGE);
        setSyncingCommunity(false);
        return;
      }
      const key = kind === "like" ? "booksphere.likedPosts" : kind === "save" ? "booksphere.savedInsights" : "booksphere.followedDiscussions";
      const localNext = toggleLocalItem(key, targetId);
      setter(localNext);
      trackEvent(`${kind}_${localNext ? "added" : "removed"}`, { targetId, demo: true });
      setSyncingCommunity(false);
      return;
    }

    const result = kind === "like"
      ? await toggleSupabaseLike(auth.profileId, targetId, next)
      : kind === "save"
        ? await toggleSupabaseSaveInsight(auth.profileId, targetId, next)
        : await toggleSupabaseFollowDiscussion(auth.profileId, targetId, next);

    if (result.error) {
      setter(current);
      trackEvent("write_failed", { op: kind, targetId, code: result.code || null, message: result.error.slice(0, 200) });
      setError(countError);
      setSyncingCommunity(false);
      return;
    }
    trackEvent(kind === "like" ? "contribution_liked" : kind === "save" ? "contribution_saved" : "discussion_followed", { targetId, active: next });
    // /saved renders exactly these rows. Unsaving from that page left the card sitting on
    // the shelf under "My Saved Insights", reading "Save Insight", until a reload.
    if (kind === "save") announceSavedChange();
    setSyncingCommunity(false);
  }

  async function toggleAward(type: AwardType) {
    if (!targetId || syncingCommunity) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const previous = selectedAwards;
    const adding = !previous.includes(type);
    const next = adding ? [...previous, type] : previous.filter((item) => item !== type);
    setSelectedAwards(next);
    setSyncingCommunity(true);
    setError("");

    if (!supabase) {
      if (!canUseLocalCommunityFallback()) {
        setSelectedAwards(previous);
        setError(COMMUNITY_UNAVAILABLE_MESSAGE);
        setSyncingCommunity(false);
        return;
      }
      window.localStorage.setItem(`booksphere.awards.${targetId}`, JSON.stringify(next));
      setPersistedAwards(next);
      setSyncingCommunity(false);
      trackEvent(adding ? "post_awarded" : "post_award_removed", { targetId, awardType: type, demo: true });
      return;
    }

    // post_awards has no UPDATE policy, so the ON CONFLICT DO UPDATE arm is refused by RLS.
    // Insert instead and treat a duplicate as the award already being there.
    const rawResult = adding
      ? await supabase.from("post_awards").insert({ user_id: auth.profileId, discussion_post_id: targetId, award_type: type })
      : await supabase.from("post_awards").delete().eq("user_id", auth.profileId).eq("discussion_post_id", targetId).eq("award_type", type);
    const result = rawResult.error && rawResult.error.code === "23505" ? { ...rawResult, error: null } : rawResult;
    setSyncingCommunity(false);
    if (result.error) {
      setSelectedAwards(previous);
      setError("That award could not be saved. Please try again.");
      return;
    }
    setPersistedAwards(next);
    trackEvent(adding ? "post_awarded" : "post_award_removed", { targetId, awardType: type });
  }

  function awardCount(type: AwardType) {
    const base = awards.find((award) => award.type === type)?.count || 0;
    const optimisticAdd = selectedAwards.includes(type) && !persistedAwards.includes(type) ? 1 : 0;
    const optimisticRemove = !selectedAwards.includes(type) && persistedAwards.includes(type) ? 1 : 0;
    return Math.max(0, base + optimisticAdd - optimisticRemove);
  }

  async function submitReport() {
    if (!targetId || reporting) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    setReporting(true);
    setError("");
    if (!supabase) {
      if (!canUseLocalCommunityFallback()) {
        setError(COMMUNITY_UNAVAILABLE_MESSAGE);
        setReporting(false);
        return;
      }
      toggleLocalItem("booksphere.reportedPosts", targetId);
      setReported(true);
      setReportOpen(false);
      setReporting(false);
      return;
    }
    // insert, not upsert. PostgREST compiles upsert into INSERT ... ON CONFLICT DO UPDATE,
    // and Postgres demands UPDATE privilege on the table when it plans that statement -
    // whether or not a conflict ever occurs. `authenticated` holds insert, select and delete
    // on reports and no update, so every report ever attempted failed with 42501. That is
    // why the table has no rows at all: reporting has never once worked, for anyone.
    //
    // Granting update would fix the symptom and open a hole - a reporter could rewrite a
    // report after a moderator had read it. A reporter has no business editing a filed
    // report, so the insert stands alone and the unique index does the deduplicating:
    // 23505 means this person already flagged this post, which is the outcome they wanted.
    const { error: reportError } = await supabase.from("reports").insert(
      { reporter_id: auth.profileId, target_type: "discussion_post", target_id: targetId, reason: reportReason }
    );
    setReporting(false);
    if (reportError && reportError.code !== "23505") {
      trackEvent("write_failed", { op: "report_post", targetId, code: reportError.code || null, message: reportError.message?.slice(0, 200) || null });
      setError("Your report could not be submitted. Please try again.");
      return;
    }
    setReported(true);
    setReportOpen(false);
    // The reason stays out of analytics_events. It is already in `reports`, where a
    // moderator can delete it - but nothing can delete an analytics row (no DELETE grant on
    // that table for any role), so a copy here would outlive the report it duplicates, and
    // it is also mirrored into the reporter's own localStorage under booksphere.analytics.
    trackEvent("post_reported", { targetId });
  }

  async function toggleUsefulness(type: UsefulnessReactionType) {
    // This had no guard at all: two chips tapped in quick succession both computed their
    // payload from the same pre-first-tap array, so one chip's highlight vanished while its
    // row sat in the database. It gets its own latch rather than sharing syncingCommunity -
    // a shared lock would silently swallow a chip tap while a like was in flight, on chips
    // that have no disabled state to show for it, and a ref latches synchronously where a
    // state flag is still stale for the whole of requireProfile().
    if (!targetId || usefulnessInFlight.current) return;
    usefulnessInFlight.current = true;
    try {
      await runToggleUsefulness(type);
    } finally {
      usefulnessInFlight.current = false;
    }
  }

  async function runToggleUsefulness(type: UsefulnessReactionType) {
    if (!targetId) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    const adding = !selectedUsefulness.includes(type);
    const next = adding
      ? [...selectedUsefulness, type]
      : selectedUsefulness.filter((item) => item !== type);
    // Revert functionally rather than to a captured snapshot, so a failure here undoes only
    // this chip instead of discarding whatever else succeeded meanwhile.
    const revert = () => setSelectedUsefulness((current) => adding
      ? current.filter((item) => item !== type)
      : current.includes(type) ? current : [...current, type]);
    setSelectedUsefulness(next);
    setError("");

    if (!supabase) {
      if (!canUseLocalCommunityFallback()) {
        revert();
        setError(COMMUNITY_UNAVAILABLE_MESSAGE);
        return;
      }
      window.localStorage.setItem(`booksphere.usefulness.${targetId}`, JSON.stringify(next));
      setPersistedUsefulness(next);
      trackEvent(adding ? "usefulness_reaction_added" : "usefulness_reaction_removed", { targetId, reactionType: type });
      return;
    }

    const dbType = dbReactionByLabel[type];
    const result = adding
      ? await supabase.from("useful_reactions").upsert({
          user_id: auth.profileId,
          target_type: "discussion_post",
          target_id: targetId,
          reaction_type: dbType
        }, { onConflict: "user_id,target_type,target_id,reaction_type" })
      : await supabase
          .from("useful_reactions")
          .delete()
          .eq("user_id", auth.profileId)
          .eq("target_type", "discussion_post")
          .eq("target_id", targetId)
          .eq("reaction_type", dbType);

    if (result.error) {
      revert();
      setError("That reaction could not be saved. Please try again.");
      return;
    }
    setPersistedUsefulness((current) => adding
      ? current.includes(type) ? current : [...current, type]
      : current.filter((item) => item !== type));
    trackEvent(adding ? "useful_reaction_added" : "useful_reaction_removed", { targetId, reactionType: dbType });
  }

  function usefulnessCount(type: UsefulnessReactionType) {
    const base = usefulness.find((reaction) => reaction.type === type)?.count || 0;
    const optimisticAdd = selectedUsefulness.includes(type) && !persistedUsefulness.includes(type) ? 1 : 0;
    const optimisticRemove = !selectedUsefulness.includes(type) && persistedUsefulness.includes(type) ? 1 : 0;
    return Math.max(0, base + optimisticAdd - optimisticRemove);
  }

  function openComments() {
    const commentsPanel = document.getElementById("comments");
    if (commentsPanel) {
      commentsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.hash = "comments";
  }

  async function sharePost() {
    const url = targetId ? `${window.location.origin}${window.location.pathname}#${targetId}` : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "BookSphere discussion", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
      trackEvent("post_shared", { targetId });
    } catch {
      setNotice("We could not open sharing here. You can copy the page link from the browser.");
    }
  }

  async function saveEdit() {
    if (!post || !targetId) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }
    if (auth.profileId !== post.userId) {
      setError("You do not have permission to change this contribution.");
      return;
    }
    // Same thresholds as the composer and the database, not the old 8/80. A post is
    // creatable at 4 and 20; demanding 80 to edit it stranded every short post ever
    // written, including the first one anyone made on production.
    if (editDraft.title.trim().length < 4 || editDraft.body.trim().length < 20) {
      setError("Give this a title of at least 4 characters and at least 20 characters of context.");
      return;
    }
    setSavingEdit(true);
    setError("");
    const result = await updateSupabaseContribution(auth.profileId, targetId, editDraft);
    if (result.error) trackEvent("write_failed", { op: "edit_post", targetId, code: result.cause?.code || null, message: result.cause?.message || null });
    setSavingEdit(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function deleteContribution() {
    if (!targetId) return;
    const confirmed = window.confirm("Delete this contribution? It will disappear from BookSphere pages, search, saved insights, and followed discussions. This cannot be undone from the app.");
    if (!confirmed) return;
    const auth = await requireProfile();
    if (!auth.ok) {
      setNotice(auth.message);
      return;
    }

    setDeletingPost(true);
    setError("");
    if (supabase) {
      const result = await deleteSupabaseContribution(auth.profileId, targetId);
      setDeletingPost(false);
      if (result.error) {
        trackEvent("write_failed", { op: "delete_post", targetId, code: result.cause?.code || null, message: result.cause?.message || null });
        setError(result.error);
        return;
      }
      setDeleted(true);
      // Deleting used to leave the reader stranded: the card became one line of text on a
      // page whose subject no longer exists, with nothing to click. In a list the parent
      // removes the card, which is right - but on a perspective's own page there is nothing
      // left to be on, so take them back to the book it belonged to. Every product that
      // handles this well returns you to where the thing lived rather than leaving you
      // looking at its absence.
      if (onDelete) {
        onDelete();
        router.refresh();
        return;
      }
      router.replace(post?.bookId ? `/book/${post.bookId}` : "/explore");
      router.refresh();
      return;
    }

    if (!canUseLocalCommunityFallback()) {
      setDeletingPost(false);
      setError(COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    onDelete?.();
    setDeletingPost(false);
    setDeleted(true);
    trackEvent("post_deleted", { targetId, demo: true });
  }

  if (deleted) {
    return (
      <p className="mt-4 text-sm font-medium text-[color:var(--color-text-secondary)]">
        Contribution deleted.{" "}
        <Link href={post?.bookId ? `/book/${post.bookId}` : "/explore"} className="underline underline-offset-4">
          Back to {post?.bookId ? "the book" : "Explore"}
        </Link>
      </p>
    );
  }

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
        <button
          type="button"
          disabled={syncingCommunity}
          onClick={() => toggleCommunityAction("like", liked, setLiked, "We could not save your like. Please try again.")}
          aria-label="Like this perspective"
          className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 transition hover:bg-black/[0.06]"
        >
          <Heart size={16} className={liked ? "fill-[color:var(--color-rose)] text-[color:var(--color-rose)]" : ""} />
          {visibleCount(likes, liked, persistedLiked)}
        </button>
        <button type="button" onClick={openComments} className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 transition hover:bg-black/[0.06]" aria-label="Jump to comments">
          <MessageCircle size={16} /> {comments}
        </button>
        <button
          type="button"
          disabled={syncingCommunity}
          onClick={() => toggleCommunityAction("save", saved, setSaved, "We could not save this insight.")}
          aria-label="Save this perspective"
          className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 transition hover:bg-black/[0.06]"
        >
          <Bookmark size={16} className={saved ? "fill-[color:var(--color-text-primary)] text-[color:var(--color-text-primary)]" : ""} /> {saved ? "Saved" : "Save"} {saved || saves ? `· ${visibleCount(saves, saved, persistedSaved)}` : ""}
        </button>
        <button
          type="button"
          disabled={syncingCommunity}
          onClick={() => toggleCommunityAction("follow", following, setFollowing, "We could not follow this discussion. Please try again.")}
          aria-label="Follow replies to this perspective"
          className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 transition hover:bg-black/[0.06]"
        >
          <PlusCircle size={16} /> {following ? "Following replies" : "Follow replies"} {following || follows ? `· ${visibleCount(follows, following, persistedFollowing)}` : ""}
        </button>
        <button
          type="button"
          onClick={() => requireAction(() => setOpenPicker((value) => value === "usefulness" ? null : "usefulness"))}
          aria-label="Mark why this perspective was useful"
          aria-expanded={openPicker === "usefulness"}
          className={`flex min-h-11 items-center gap-2 rounded-full px-3 py-2 transition ${openPicker === "usefulness" ? "bg-[color:var(--color-text-primary)] !text-white" : "bg-black/[0.035] hover:bg-black/[0.06]"}`}
        >
          <Award size={16} /> Useful
        </button>
        <button
          type="button"
          onClick={() => requireAction(() => setOpenPicker((value) => value === "award" ? null : "award"))}
          aria-label="Award this perspective"
          aria-expanded={openPicker === "award"}
          className={`flex min-h-11 items-center gap-2 rounded-full px-3 py-2 transition ${openPicker === "award" ? "bg-[color:var(--color-text-primary)] !text-white" : "bg-black/[0.035] hover:bg-black/[0.06]"}`}
        >
          <Award size={16} /> Award
        </button>
        <button type="button" onClick={sharePost} className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 transition hover:bg-black/[0.06]" aria-label="Share this perspective">
          <Share2 size={16} /> {copied ? "Copied" : "Share"}
        </button>
        <button
          type="button"
          onClick={() => requireAction(() => {
            if (!reported) setReportOpen((value) => !value);
          })}
          disabled={reported || reporting}
          aria-label="Report this perspective"
          className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 transition hover:bg-black/[0.06]"
        >
          <Flag size={16} /> {reported ? "Reported" : "Report"}
        </button>
        {(isOwner || canDelete) && post && supabase && (
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 transition hover:bg-black/[0.06]"
          >
            <Pencil size={16} /> {editing ? "Close edit" : "Edit"}
          </button>
        )}
        {(isOwner || canDelete) && (
          <button
            type="button"
            disabled={deletingPost}
            onClick={deleteContribution}
            className="flex min-h-11 items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 text-[color:var(--color-rose)] transition hover:bg-black/[0.06]"
          >
            <Trash2 size={16} /> {deletingPost ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {reportOpen && !reported && (
        <div className="mt-3 rounded-[20px] bg-black/[0.025] p-4" role="group" aria-label="Report this perspective">
          <label className="grid gap-2 text-sm font-medium">
            Why should this be reviewed?
            <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="min-h-11 rounded-[16px] bg-white px-4 py-3 outline-none ring-1 ring-black/[0.05] focus:ring-black/20">
              <option>Spam or manipulation</option>
              <option>Harassment or hateful content</option>
              <option>Copyright concern</option>
              <option>Dangerous or misleading claim</option>
              <option>Other community concern</option>
            </select>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={reporting} onClick={submitReport} className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-5 py-2 text-sm font-medium !text-white disabled:opacity-50">{reporting ? "Submitting..." : "Submit report"}</button>
            <button type="button" disabled={reporting} onClick={() => setReportOpen(false)} className="min-h-11 rounded-full bg-white px-5 py-2 text-sm font-medium ring-1 ring-black/[0.05]">Cancel</button>
          </div>
        </div>
      )}

      {editing && post && (
        <div className="mt-4 rounded-[24px] bg-black/[0.025] p-4">
          <div className="grid gap-3">
            <label className="grid gap-2 text-sm font-medium">
              Type
              <select
                value={editDraft.postType}
                onChange={(event) => setEditDraft({ ...editDraft, postType: event.target.value as PostType })}
                className="rounded-[18px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              >
                {editablePostTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Title
              <input
                maxLength={180}
                value={editDraft.title}
                onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })}
                className="rounded-[18px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Body
              <textarea
                maxLength={10000}
                value={editDraft.body}
                onChange={(event) => setEditDraft({ ...editDraft, body: event.target.value })}
                rows={6}
                className="rounded-[18px] bg-white px-4 py-3 outline-none ring-1 ring-transparent focus:ring-black/20"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={editDraft.contextType} onChange={(event) => setEditDraft({ ...editDraft, contextType: event.target.value })} placeholder="Context" className="rounded-[18px] bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
              <input value={editDraft.actionTaken} onChange={(event) => setEditDraft({ ...editDraft, actionTaken: event.target.value })} placeholder="Action taken" className="rounded-[18px] bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
              <input value={editDraft.outcome} onChange={(event) => setEditDraft({ ...editDraft, outcome: event.target.value })} placeholder="Outcome" className="rounded-[18px] bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
              <input value={editDraft.whatFailed} onChange={(event) => setEditDraft({ ...editDraft, whatFailed: event.target.value })} placeholder="What failed" className="rounded-[18px] bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-black/20" />
              <input value={editDraft.wouldChange} onChange={(event) => setEditDraft({ ...editDraft, wouldChange: event.target.value })} placeholder="What would change" className="rounded-[18px] bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-black/20 md:col-span-2" />
              <input value={editDraft.quoteReference} onChange={(event) => setEditDraft({ ...editDraft, quoteReference: event.target.value })} placeholder="Quote or reference" className="rounded-[18px] bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-black/20 md:col-span-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={savingEdit} onClick={saveEdit} className="rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-medium !text-white transition hover:opacity-85 disabled:opacity-50">
                {savingEdit ? "Saving..." : "Save changes"}
              </button>
              <button type="button" disabled={savingEdit} onClick={() => setEditing(false)} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[color:var(--color-text-primary)] ring-1 ring-black/[0.05] transition hover:bg-black/[0.035]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {openPicker === "usefulness" && (
        <div className="mt-3 flex flex-wrap gap-2 rounded-[20px] bg-black/[0.025] p-3">
          {usefulnessOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleUsefulness(type)}
              className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium transition ${selectedUsefulness.includes(type) ? "bg-[color:var(--color-text-primary)] !text-white" : "bg-white text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"}`}
            >
              {usefulnessCount(type)} {type}
            </button>
          ))}
        </div>
      )}

      {openPicker === "award" && (
        <div className="mt-3 flex flex-wrap gap-2 rounded-[20px] bg-black/[0.025] p-3">
          {awardOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => void toggleAward(type)}
              disabled={syncingCommunity}
              className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium transition ${selectedAwards.includes(type) ? "bg-[color:var(--color-text-primary)] !text-white" : "bg-white text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"}`}
            >
              {awardCount(type)} {type}
            </button>
          ))}
        </div>
      )}

      {notice && <LoginRequiredNotice message={notice} onDismiss={() => setNotice("")} />}
      {error && <p role="alert" className="mt-3 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
    </div>
  );
}
