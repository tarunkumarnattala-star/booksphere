import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// The database's write limits (private.enforce_community_rate_limit) raise P0001 with this
// message. Without telling it apart, someone who hits the limit sees "please try again" and
// does exactly that, into the same wall.
export function isRateLimited(error: { code?: string | null; message?: string | null } | null | undefined) {
  return error?.code === "P0001" && Boolean(error.message?.includes("Rate limit"));
}

export const RATE_LIMITED_MESSAGE = "You have posted a lot in the last hour. Give it a little while and try again - your text is still here.";
