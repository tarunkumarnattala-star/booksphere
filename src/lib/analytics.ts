"use client";

import { supabase } from "./supabase";

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
    const { data: authData } = await supabase.auth.getUser();
    let profileId: string | null = null;
    if (authData.user) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("auth_user_id", authData.user.id).maybeSingle();
      profileId = profile?.id || null;
    }
    await supabase.from("analytics_events").insert({ user_id: profileId, event_name: eventName, metadata });
  })();
}
