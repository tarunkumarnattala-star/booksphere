"use client";

import { DiscussionPost, PostType } from "./types";

const LOCAL_DISCUSSIONS_KEY = "booksphere.localDiscussions";

export function getLocalDiscussions(bookId?: string) {
  if (typeof window === "undefined") return [] as DiscussionPost[];
  try {
    const posts = JSON.parse(window.localStorage.getItem(LOCAL_DISCUSSIONS_KEY) || "[]") as DiscussionPost[];
    return bookId ? posts.filter((post) => post.bookId === bookId) : posts;
  } catch {
    return [] as DiscussionPost[];
  }
}

export function addLocalDiscussion(input: { bookId: string; postType: PostType; title: string; body: string; quoteReference?: string }) {
  const post: DiscussionPost = {
    id: `local-${crypto.randomUUID()}`,
    bookId: input.bookId,
    userId: "local-reader",
    postType: input.postType,
    title: input.title.trim(),
    body: input.body.trim(),
    quoteReference: input.quoteReference?.trim() || undefined,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
    saves: 0,
    follows: 0,
    awards: [],
    usefulness: []
  };
  const posts = getLocalDiscussions();
  window.localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify([post, ...posts]));
  window.dispatchEvent(new Event("booksphere-local-discussions-change"));
  return post;
}

export function deleteLocalDiscussion(postId: string) {
  const posts = getLocalDiscussions().filter((post) => post.id !== postId);
  window.localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event("booksphere-local-discussions-change"));
}
