"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireProfile } from "@/lib/auth-client";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";
import { getLocalProfile } from "@/lib/local-session";
import { supabase } from "@/lib/supabase";

const SETTINGS_KEY = "booksphere.profileDraft";
const emptyDraft = { name: "", username: "", bio: "" };

type SettingsDraft = typeof emptyDraft;
type LoadState = "loading" | "ready" | "unavailable";

export default function SettingsPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<SettingsDraft>(emptyDraft);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const auth = await requireProfile();
      if (!active) return;

      if (!auth.ok) {
        setMessage(auth.message);
        setLoadState("unavailable");
        return;
      }

      setProfileId(auth.profileId);
      if (auth.local && canUseLocalCommunityFallback()) {
        const localProfile = getLocalProfile();
        const stored = window.localStorage.getItem(SETTINGS_KEY);
        try {
          setDraft(stored ? JSON.parse(stored) : { ...emptyDraft, name: localProfile?.name || "" });
        } catch {
          setDraft({ ...emptyDraft, name: localProfile?.name || "" });
        }
        setLoadState("ready");
        return;
      }

      const { data, error } = await supabase!
        .from("profiles")
        .select("name,username,bio")
        .eq("id", auth.profileId)
        .single();

      if (!active) return;
      if (error || !data) {
        setMessage("We could not load your profile. Please refresh and try again.");
        setLoadState("unavailable");
        return;
      }

      setDraft({ name: data.name || "", username: data.username || "", bio: data.bio || "" });
      setLoadState("ready");
    }

    void loadProfile();
    return () => { active = false; };
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanDraft = {
      name: draft.name.trim(),
      username: draft.username.trim().toLowerCase(),
      bio: draft.bio.trim()
    };

    if (cleanDraft.name.length < 2 || !/^[a-z0-9_-]{3,30}$/.test(cleanDraft.username) || cleanDraft.bio.length > 280) {
      setMessage("Use a name of at least 2 characters, a 3-30 character username with letters, numbers, _ or -, and a bio under 280 characters.");
      return;
    }

    setSaving(true);
    if (!supabase && canUseLocalCommunityFallback()) {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(cleanDraft));
      setDraft(cleanDraft);
      setSaving(false);
      router.replace("/profile/local-reader");
      return;
    }

    if (!supabase || !profileId) {
      setMessage("Profile editing is temporarily unavailable.");
      setSaving(false);
      return;
    }

    // An UPDATE with no .select() returns 204 and error: null whether it changed one row or
    // zero. If the RLS ownership clause matches nothing - an expired token, a profileId from
    // a different session - Postgres writes nothing, PostgREST reports no error, this screen
    // says "saved", and the redirect below lands on a username that does not exist: the
    // reader is shown a 404 as confirmation that their profile saved. Read the row back and
    // navigate with what the database actually holds.
    const { data, error } = await supabase
      .from("profiles")
      .update(cleanDraft)
      .eq("id", profileId)
      .select("id,username")
      .maybeSingle();
    setSaving(false);
    if (error) {
      setMessage(error.code === "23505" ? "That username is already taken." : "Your changes could not be saved. Please try again.");
      return;
    }
    if (!data) {
      setMessage("Your changes were not saved. Sign in again and retry.");
      return;
    }

    setDraft(cleanDraft);
    // Every nav resolves the Profile tab to /profile/<username> once, on mount, and only
    // recomputes it on this event or a Supabase auth-state change. Changing your username
    // fires neither, so the tab kept pointing at the name you no longer have and answered
    // "Reader not found" - the same shape as the delete-then-Profile bug, on a screen whose
    // whole purpose is changing that value.
    window.dispatchEvent(new Event("booksphere-auth-change"));
    router.replace(`/profile/${data.username as string}`);
  }

  return (
    <div className="editorial-page editorial-prose">
      <p className="caption">Settings</p>
      <h1 className="large-title mt-4 max-w-[16ch]">Your public identity</h1>
      <p className="body-copy measure mt-5">
        This is what a reader sees under anything you write. Nothing else about you is shown.
      </p>

      {loadState === "loading" && <p role="status" className="caption caption-muted mt-8">Loading</p>}
      {loadState === "unavailable" && (
        <p role="alert" className="body-copy measure mt-8 border-l-2 border-[color:var(--color-rose)] pl-5 text-[color:var(--color-rose)]">{message}</p>
      )}

      {loadState === "ready" && (
        <form onSubmit={saveProfile} className="mt-8 grid gap-5 border-t border-[color:var(--rule-strong)] pt-8">
          <label className="field-label">
            <span className="caption caption-muted">Display name</span>
            <input required minLength={2} maxLength={80} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="The name under your writing" className="field" />
          </label>
          <label className="field-label">
            <span className="caption caption-muted">Username</span>
            <input required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_-]+" value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} placeholder="letters, numbers, _ or -" className="field" />
          </label>
          <label className="field-label">
            <span className="caption caption-muted">Bio</span>
            <textarea maxLength={280} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} rows={5} placeholder="What you read, and what you tend to write about" className="field" />
            <span className="footnote numeral">{draft.bio.length}/280</span>
          </label>
          {message && (
            <p role="alert" className="body-copy border-l-2 border-[color:var(--color-rose)] pl-5 text-[color:var(--color-rose)]">{message}</p>
          )}
          <div>
            <button disabled={saving} className="btn-ink w-full sm:w-auto">{saving ? "Saving" : "Save"}</button>
          </div>
        </form>
      )}

      <p className="mt-8 border-t border-[color:var(--rule)] pt-4">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("booksphere:onboarding:start"))}
          className="control"
        >
          Show the app guide again
        </button>
      </p>
    </div>
  );
}
