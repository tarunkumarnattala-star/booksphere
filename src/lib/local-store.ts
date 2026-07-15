"use client";

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
