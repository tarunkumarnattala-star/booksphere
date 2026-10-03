"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
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
      className="relative grid size-11 place-items-center rounded-full text-[color:var(--color-text-primary)] transition hover:bg-black/[0.05]"
    >
      <Bell size={18} />
      {unseen > 0 && (
        <span className="absolute right-1.5 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-[color:var(--color-rose)] px-1 text-[10px] font-semibold leading-[18px] !text-white">
          {unseen > 9 ? "9+" : unseen}
        </span>
      )}
    </Link>
  );
}
