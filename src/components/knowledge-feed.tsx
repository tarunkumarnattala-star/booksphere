"use client";

import { useEffect, useRef, useState } from "react";
import { KnowledgePost } from "@/lib/types";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";
import { clearFeedPosition, readFeedPosition } from "@/lib/feed-return";
import { KnowledgeNoteCard } from "./knowledge-note-card";

const LOCAL_KNOWLEDGE_POSTS_KEY = "booksphere.localKnowledgePosts";

function readLocalKnowledgePosts() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KNOWLEDGE_POSTS_KEY) || "[]") as KnowledgePost[];
  } catch {
    window.localStorage.removeItem(LOCAL_KNOWLEDGE_POSTS_KEY);
    return [];
  }
}

export function KnowledgeFeed({ seedPosts }: { seedPosts: KnowledgePost[] }) {
  const [posts, setPosts] = useState(seedPosts);
  const restoredPosition = useRef(false);

  useEffect(() => {
    const addPost = (event: Event) => {
      const post = (event as CustomEvent<KnowledgePost>).detail;
      setPosts((current) => [post, ...current.filter((item) => item.id !== post.id)]);
    };
    const updatePost = (event: Event) => {
      const post = (event as CustomEvent<KnowledgePost>).detail;
      setPosts((current) => current.map((item) => item.id === post.id ? post : item));
    };
    const deletePost = (event: Event) => {
      const postId = (event as CustomEvent<string>).detail;
      setPosts((current) => current.filter((item) => item.id !== postId));
    };
    if (canUseLocalCommunityFallback()) {
      queueMicrotask(() => {
        setPosts([...readLocalKnowledgePosts(), ...seedPosts].filter((post, index, all) => all.findIndex((item) => item.id === post.id) === index));
      });
    }
    window.addEventListener("booksphere:knowledge-post-created", addPost);
    window.addEventListener("booksphere:knowledge-post-updated", updatePost);
    window.addEventListener("booksphere:knowledge-post-deleted", deletePost);
    return () => {
      window.removeEventListener("booksphere:knowledge-post-created", addPost);
      window.removeEventListener("booksphere:knowledge-post-updated", updatePost);
      window.removeEventListener("booksphere:knowledge-post-deleted", deletePost);
    };
  }, [seedPosts]);

  useEffect(() => {
    if (restoredPosition.current) return;
    const saved = readFeedPosition();
    if (!saved) return;
    restoredPosition.current = true;

    let cancelled = false;
    let attempts = 0;
    let timer = 0;
    const restore = () => {
      if (cancelled) return;
      window.scrollTo({ top: saved.scrollY, behavior: "auto" });
      attempts += 1;
      const target = document.querySelector(`[data-feed-post-id="${saved.postId}"]`);
      const closeEnough = Math.abs(window.scrollY - saved.scrollY) < 4;
      if ((target && closeEnough) || attempts >= 12) {
        clearFeedPosition();
        return;
      }
      timer = window.setTimeout(restore, 80);
    };
    timer = window.setTimeout(restore, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [posts.length]);

  // One form for both variants: a column of records. A two-column grid of notes of wildly
  // different lengths made a ragged wall of boxes and no reading order.
  return (
    <ol className="records records-tight">
      {posts.map((post) => (
        <KnowledgeNoteCard key={post.id} post={post} />
      ))}
    </ol>
  );
}

export { LOCAL_KNOWLEDGE_POSTS_KEY };
