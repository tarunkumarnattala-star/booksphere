"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { requireProfile } from "@/lib/auth-client";
import { countUnseen, getReplyNotifications } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

export function NotificationBell() {
  const [signedIn, setSignedIn] = useState(false);
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      if (!supabase) return;
      const auth = await requireProfile();
      if (!mounted) return;
      if (!auth.ok) {
        setSignedIn(false);
        setUnseen(0);
        return;
      }
      const replies = await getReplyNotifications(auth.profileId);
      if (!mounted) return;
      setSignedIn(true);
      // A failed poll leaves the badge alone rather than clearing it.
      if (replies.ok) setUnseen(countUnseen(replies.notifications));
    }

    const onSeen = () => setUnseen(0);

    void refresh();
    window.addEventListener("booksphere-notifications-seen", onSeen);
    window.addEventListener("booksphere-auth-change", refresh);
    const { data: listener } = supabase?.auth.onAuthStateChange(() => void refresh()) || { data: null };

    return () => {
      mounted = false;
      window.removeEventListener("booksphere-notifications-seen", onSeen);
      window.removeEventListener("booksphere-auth-change", refresh);
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!signedIn) return null;

  return (
    <Link
      href="/notifications"
      aria-label={unseen ? `Replies to your writing, ${unseen} new` : "Replies to your writing"}
      className="caption caption-muted inline-flex min-h-11 items-center gap-2 transition-colors hover:text-[color:var(--ink)]"
    >
      Replies
      {unseen > 0 && (
        // The count is the reason to look. It is set in the mono label's own size, flush to
        // the word, rather than in a coloured bubble floating over a bell.
        <span className="numeral border-b-2 border-[color:var(--ink)] pb-px text-[color:var(--ink)]">
          {unseen > 9 ? "9+" : unseen}
        </span>
      )}
    </Link>
  );
}
