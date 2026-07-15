"use client";

const LOCAL_PROFILE_KEY = "booksphere.localProfile";

export type LocalProfile = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
};

export function getLocalProfile(): LocalProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalProfile;
  } catch {
    window.localStorage.removeItem(LOCAL_PROFILE_KEY);
    return null;
  }
}

export function createLocalProfile(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const name = cleanEmail.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Reader";
  const profile: LocalProfile = {
    id: "local-reader",
    authUserId: "local-auth-user",
    email: cleanEmail,
    name
  };
  window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("booksphere-auth-change"));
  return profile;
}

export function clearLocalProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_PROFILE_KEY);
  window.dispatchEvent(new Event("booksphere-auth-change"));
}
