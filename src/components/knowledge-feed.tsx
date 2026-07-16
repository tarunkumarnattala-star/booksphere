"use client";

import { useEffect, useState } from "react";
import { KnowledgePost } from "@/lib/types";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";
import { KnowledgeNoteCard } from "./knowledge-note-card";

const LOCAL_KNOWLEDGE_POSTS_KEY = "booksphere.localKnowledgePosts";

type KnowledgeFeedVariant = "grid" | "stream";

function readLocalKnowledgePosts() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KNOWLEDGE_POSTS_KEY) || "[]") as KnowledgePost[];
  } catch {
    window.localStorage.removeItem(LOCAL_KNOWLEDGE_POSTS_KEY);
    return [];
  }
}

export function KnowledgeFeed({ seedPosts, variant = "grid" }: { seedPosts: KnowledgePost[]; variant?: KnowledgeFeedVariant }) {
  const [posts, setPosts] = useState(seedPosts);

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

  if (variant === "stream") {
    return (
      <div className="space-y-5">
        {posts.map((post) => (
          <KnowledgeNoteCard key={post.id} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {posts.map((post) => (
        <KnowledgeNoteCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export { LOCAL_KNOWLEDGE_POSTS_KEY };
