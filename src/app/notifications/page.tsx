"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { getLastSeenAt, getReplyNotifications, markNotificationsSeen, type ReplyNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsPage() {
  const [state, setState] = useState<"loading" | "signed-out" | "unavailable" | "error" | "ready">("loading");
  const [items, setItems] = useState<ReplyNotification[]>([]);
  const [seenBefore, setSeenBefore] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) {
        setState("unavailable");
        return;
      }
      const auth = await requireProfile();
      if (cancelled) return;
      if (!auth.ok) {
        setState("signed-out");
        return;
      }
      // Capture the previous mark before clearing it, so replies that arrived since
      // the last visit stay visually distinct while reading this page.
      setSeenBefore(getLastSeenAt());
      const replies = await getReplyNotifications(auth.profileId);
      if (cancelled) return;
      if (!replies.ok) {
        // Do not mark seen here. markNotificationsSeen() is a one-way write, so doing it
        // after a failed read would permanently hide replies that already exist.
        setState("error");
        return;
      }
      setItems(replies.notifications);
      setState("ready");
      markNotificationsSeen();
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container-page py-10 md:py-14">
      <p className="caption">Your activity</p>
      <h1 className="title-1 mt-2">Replies to your writing</h1>

      {state === "loading" && <p className="body-copy mt-6">Loading...</p>}

      {state === "unavailable" && <p className="body-copy mt-6">Replies need the production database connection.</p>}

      {state === "error" && (
        <p role="alert" className="body-copy mt-6">
          Your replies could not be loaded just now. Refresh the page to try again - nothing has been marked as read.
        </p>
      )}

      {state === "signed-out" && (
        <p className="body-copy mt-6">
          <Link className="font-medium underline underline-offset-4" href="/login?next=%2Fnotifications">Log in</Link> to see replies to your perspectives.
        </p>
      )}

      {state === "ready" && (
        items.length === 0 ? (
          <div className="mt-8 flex items-start gap-3 rounded-[24px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
            <Bell size={20} className="mt-0.5 shrink-0 text-[color:var(--color-text-muted)]" />
            <div>
              <p className="body-copy font-medium text-[color:var(--color-text-primary)]">No replies yet</p>
              <p className="body-copy mt-1 text-[15px]">
                When someone responds to a perspective you wrote, it will appear here.{" "}
                <Link className="font-medium underline underline-offset-4" href="/explore">Find a book to write about</Link>.
              </p>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3">
            {items.map((item) => {
              const isNew = !seenBefore || item.createdAt > seenBefore;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`block rounded-[22px] p-5 shadow-[var(--shadow-soft)] ring-1 transition hover:-translate-y-0.5 ${isNew ? "bg-white ring-[color:var(--color-gold)]/35" : "bg-white ring-black/[0.035]"}`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={15} className="shrink-0 text-[color:var(--color-text-muted)]" />
                      <p className="caption">
                        {item.kind === "reply_to_comment" ? "Replied to your comment" : "Replied to your perspective"} · {relativeTime(item.createdAt)}
                      </p>
                      {isNew && <span className="ml-auto rounded-full bg-[color:var(--color-gold)]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-gold)]">New</span>}
                    </div>
                    <p className="mt-2 text-[15px] font-medium text-[color:var(--color-text-primary)]">
                      {item.authorName} on &ldquo;{item.context}&rdquo;
                    </p>
                    <p className="body-copy mt-1 line-clamp-3 text-[15px]">{item.body}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}
