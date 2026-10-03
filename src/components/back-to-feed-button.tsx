"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <button type="button" onClick={goBack} className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">
      <ArrowLeft size={16} />
      Back to feed
    </button>
  );
}
