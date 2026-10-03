"use client";

import { useRouter } from "next/navigation";
import { readFeedPosition } from "@/lib/feed-return";

export function BackToFeedButton() {
  const router = useRouter();

  function goBack() {
    if (readFeedPosition() && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/feed");
  }

  return (
    <button type="button" onClick={goBack} className="caption caption-muted inline-flex min-h-11 items-center transition-colors hover:text-[color:var(--ink)]">
      Back to the feed
    </button>
  );
}
