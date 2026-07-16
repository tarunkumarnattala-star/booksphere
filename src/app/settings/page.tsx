"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Compass } from "lucide-react";
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

    const { error } = await supabase.from("profiles").update(cleanDraft).eq("id", profileId);
    setSaving(false);
    if (error) {
      setMessage(error.code === "23505" ? "That username is already taken." : "Your changes could not be saved. Please try again.");
      return;
    }

    setDraft(cleanDraft);
    router.replace(`/profile/${cleanDraft.username}`);
  }

  return (
    <div className="editorial-page max-w-3xl">
      <p className="caption mb-4">Settings</p>
      <h1 className="large-title">Profile settings.</h1>
      <p className="body-copy mt-5 max-w-2xl">Keep your public identity clear so readers understand who is contributing and what perspective you bring.</p>
      {loadState === "loading" && <p className="body-copy mt-8">Loading your profile...</p>}
      {loadState === "unavailable" && <p role="alert" className="mt-8 rounded-[20px] bg-white p-5 text-sm font-medium shadow-[var(--shadow-soft)]">{message}</p>}
      {loadState === "ready" && (
        <form onSubmit={saveProfile} className="mt-8 grid gap-4 rounded-[28px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
          <label className="grid gap-2 text-sm font-medium">Display name<input required minLength={2} maxLength={80} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Display name" className="rounded-[18px] bg-black/[0.035] px-4 py-3 font-medium outline-none ring-1 ring-transparent focus:ring-black/20" /></label>
          <label className="grid gap-2 text-sm font-medium">Username<input required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_-]+" value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} placeholder="Username" className="rounded-[18px] bg-black/[0.035] px-4 py-3 font-medium outline-none ring-1 ring-transparent focus:ring-black/20" /></label>
          <label className="grid gap-2 text-sm font-medium">Bio<textarea maxLength={280} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} rows={5} placeholder="What do you read and contribute?" className="rounded-[18px] bg-black/[0.035] px-4 py-3 font-medium outline-none ring-1 ring-transparent focus:ring-black/20" /><span className="text-right text-xs font-normal text-[color:var(--color-text-secondary)]">{draft.bio.length}/280</span></label>
          {message && <p role="alert" className="flex items-center gap-2 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]"><CircleAlert size={17} /> {message}</p>}
          <button disabled={saving} className="rounded-full bg-[color:var(--color-text-primary)] px-5 py-3 text-sm font-semibold !text-white transition hover:opacity-85 disabled:opacity-50">{saving ? "Saving..." : "Save profile"}</button>
        </form>
      )}
      <div className="mt-6 border-t border-[color:var(--color-hairline)] pt-5">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("booksphere:onboarding:start"))}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:bg-white hover:text-[color:var(--color-text-primary)]"
        >
          <Compass size={16} />
          Show app guide again
        </button>
      </div>
    </div>
  );
}
