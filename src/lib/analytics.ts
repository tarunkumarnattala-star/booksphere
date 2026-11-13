"use client";

import { supabase } from "./supabase";

// One profile lookup per signed-in account per page load, not one per event. Keyed on the
// auth user so signing in as someone else on the same tab looks up again.
let cachedProfile: { authUserId: string; profileId: string | null } | null = null;

export function trackEvent(eventName: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const event = {
    eventName,
    metadata,
    createdAt: new Date().toISOString()
  };

  try {
    const key = "booksphere.analytics";
    const current = JSON.parse(window.localStorage.getItem(key) || "[]") as typeof event[];
    window.localStorage.setItem(key, JSON.stringify([event, ...current].slice(0, 250)));
  } catch {
    // Analytics should never break the core product experience.
  }

  if (!supabase) return;
  void (async () => {
    // getSession reads the stored session; getUser asked the auth server on every event and
    // took the auth lock that the nav bars are also waiting on, then a second request looked
    // up the profile - three round trips per page view for a signed-in reader. Attribution
    // is not a security decision here: the insert policy checks user_id against auth.uid()
    // on the server, so a stale session can only lose an event, never mislabel one.
    const { data: sessionData } = await supabase.auth.getSession();
    const authUserId = sessionData.session?.user.id || null;
    let profileId: string | null = null;
    if (authUserId) {
      if (cachedProfile?.authUserId !== authUserId) {
        const { data: profile } = await supabase.from("profiles").select("id").eq("auth_user_id", authUserId).maybeSingle();
        cachedProfile = { authUserId, profileId: profile?.id || null };
      }
      profileId = cachedProfile.profileId;
    }
    await supabase.from("analytics_events").insert({ user_id: profileId, event_name: eventName, metadata });
  })();
}
