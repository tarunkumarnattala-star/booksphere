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

  const SIGNED_OUT = {
    ok: false as const,
    message: "Log in to save books, recommend titles, follow readers, and join discussions."
  };

  // A single perspective page mounts roughly ten components that each call this on mount -
  // three effects in PostActions, the comment thread, the follow button, the profile action,
  // both navs, the header button, and every trackEvent. Each one used to go straight to
  // getUser(), which supabase-js serialises behind a lock. Measured signed out on a direct
  // load of a permalink, the comment thread took over twenty seconds to resolve, and until
  // it did the page showed placeholder content as though it were real.
  //
  // getSession() is a local read of stored credentials. A definite absence of a session is
  // an immediate no, with no lock contention and no network call. This never *grants* on the
  // stored session alone - getUser() still validates below - so the boundary is unchanged.
  // Same shape as the nav fix in 5a38680.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return SIGNED_OUT;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return SIGNED_OUT;

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
