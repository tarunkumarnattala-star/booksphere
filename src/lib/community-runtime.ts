import { isSupabaseConfigured } from "./supabase";

export const COMMUNITY_UNAVAILABLE_MESSAGE = "Community publishing is temporarily unavailable.";

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

export function canUseLocalCommunityFallback() {
  return !isProductionRuntime() && !isSupabaseConfigured;
}

export function canWriteCommunityData() {
  return isSupabaseConfigured || canUseLocalCommunityFallback();
}
