"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      // Stamp "seen" at the moment the read starts, not the moment it finishes. This read
      // is up to six queries; a reply that arrives during it is not in the list about to be
      // rendered, but would be older than a now() stamp - so countUnseen would never count
      // it and it would never carry the New ring. The write is one-way, so that reply
      // would be invisible on this device forever.
      const readStartedAt = new Date().toISOString();
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
      markNotificationsSeen(readStartedAt);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="editorial-page">
      <p className="caption">Your writing</p>
      <h1 className="large-title mt-4 max-w-[16ch]">Replies to you</h1>

      {state === "loading" && <p role="status" className="caption caption-muted mt-8">Loading</p>}

      {state === "unavailable" && <p className="body-copy measure mt-8">Replies need the production database connection.</p>}

      {state === "error" && (
        <p role="alert" className="body-copy measure mt-8 border-l-2 border-[color:var(--color-rose)] pl-5 text-[color:var(--color-rose)]">
          Your replies could not be loaded just now. Load the page again - nothing has been marked as read.
        </p>
      )}

      {state === "signed-out" && (
        <div className="mt-8">
          <p className="body-copy measure">
            Replies to your perspectives are private to your account.
          </p>
          <Link href="/login?next=%2Fnotifications" className="btn-ink mt-8">Sign in</Link>
        </div>
      )}

      {state === "ready" && (
        items.length === 0 ? (
          <p className="body-copy measure mt-8">
            Nothing yet. When somebody responds to a perspective you wrote, it appears here.{" "}
            <Link className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px]" href="/explore">Find a book to write about</Link>.
          </p>
        ) : (
          <ol className="records">
            {items.map((item) => {
              const isNew = !seenBefore || item.createdAt > seenBefore;
              return (
                <li key={item.id} className="record">
                  <p className="caption record-stamp">
                    {isNew ? "New" : relativeTime(item.createdAt)}
                  </p>
                  <div className="min-w-0">
                    <h2 className="record-title">
                      <Link href={item.href} className="transition-colors hover:text-[color:var(--accent)]">
                        {item.authorName} on &ldquo;{item.context}&rdquo;
                      </Link>
                    </h2>
                    <p className="record-text line-clamp-3">{item.body}</p>
                    <p className="record-writer !mt-5">
                      {item.kind === "reply_to_comment" ? "Replied to your reply" : "Replied to your perspective"}
                      {isNew ? ` \u00b7 ${relativeTime(item.createdAt)}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )
      )}
    </div>
  );
}
