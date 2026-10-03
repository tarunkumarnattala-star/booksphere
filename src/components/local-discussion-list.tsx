"use client";

import { useEffect, useState } from "react";
import { DiscussionPost } from "@/lib/types";
import { deleteLocalDiscussion, getLocalDiscussions } from "@/lib/local-discussions";
import { DiscussionCard } from "./discussion-card";
import { canUseLocalCommunityFallback } from "@/lib/community-runtime";

export function LocalDiscussionList({ bookId }: { bookId: string }) {
  const [posts, setPosts] = useState<DiscussionPost[]>([]);

  useEffect(() => {
    if (!canUseLocalCommunityFallback()) return;
    function refresh() {
      queueMicrotask(() => setPosts(getLocalDiscussions(bookId)));
    }
    refresh();
    window.addEventListener("booksphere-local-discussions-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("booksphere-local-discussions-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [bookId]);

  if (!posts.length) return null;

  return (
    <section className="mt-[52px]">
      <p className="caption caption-muted">Written on this device, not yet published</p>
      <ol className="records records-tight">
        {posts.map((post) => (
          <DiscussionCard key={post.id} post={post} canDelete onDelete={() => deleteLocalDiscussion(post.id)} />
        ))}
      </ol>
    </section>
  );
}
