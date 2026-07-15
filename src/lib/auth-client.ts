"use client";

import { getLocalProfile } from "./local-session";
import { COMMUNITY_UNAVAILABLE_MESSAGE, canUseLocalCommunityFallback } from "./community-runtime";
import { supabase } from "./supabase";

export type AuthResult =
  | { ok: true; profileId: string; authUserId: string; local?: boolean }
  | { ok: false; message: string };

export async function requireProfile(): Promise<AuthResult> {
  if (!supabase) {
    if (canUseLocalCommunityFallback()) {
      const localProfile = getLocalProfile();
      if (localProfile) {
        return { ok: true, profileId: localProfile.id, authUserId: localProfile.authUserId, local: true };
      }
      return {
        ok: false,
        message: "Log in to save books, recommend titles, follow readers, and join discussions. For beta preview, email login creates a local test account."
      };
    }
    return {
      ok: false,
      message: COMMUNITY_UNAVAILABLE_MESSAGE
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return {
      ok: false,
      message: "Log in to save books, recommend titles, follow readers, and join discussions."
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile?.id) {
    return {
      ok: false,
      message: "Your account is signed in, but the profile is not ready yet. Refresh once and try again."
    };
  }

  return { ok: true, profileId: profile.id as string, authUserId: userData.user.id };
}
