"use client";

// One announcement for "the saved shelf changed", used by every save toggle.
// The custom event covers this window; the localStorage write is what makes a `storage`
// event fire in the OTHER tabs, which is the only cross-tab channel available here. /saved
// used to get cross-tab refreshes by accident, because it listened to every storage event
// including the analytics buffer - which also meant a like in another tab blanked the whole
// page. This is the same behaviour, deliberately and narrowly.
export const SAVED_CHANGE_KEY = "booksphere.savedChangedAt";

export function announceSavedChange() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_CHANGE_KEY, String(Date.now()));
  } catch {
    // A full or blocked storage quota must not break saving.
  }
  window.dispatchEvent(new Event("booksphere-saved-change"));
}

function readList(key: string) {
  if (typeof window === "undefined") return [] as string[];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as string[];
  } catch {
    return [] as string[];
  }
}

function writeList(key: string, values: string[]) {
  window.localStorage.setItem(key, JSON.stringify([...new Set(values)]));
  window.dispatchEvent(new Event("booksphere-local-store-change"));
}

export function hasLocalItem(key: string, id: string) {
  return readList(key).includes(id);
}

export function toggleLocalItem(key: string, id: string) {
  const current = readList(key);
  const exists = current.includes(id);
  const next = exists ? current.filter((item) => item !== id) : [...current, id];
  writeList(key, next);
  return !exists;
}

export function getLocalCount(key: string) {
  return readList(key).length;
}

export function getLocalItems(key: string) {
  return readList(key);
}
