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
    if (!canUseLocalCommunityFallback()) return;
    queueMicrotask(() => {
      setPosts([...readLocalKnowledgePosts(), ...seedPosts]);
    });
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
