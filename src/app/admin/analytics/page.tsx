"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

type EventRow = { event_name: string; user_id: string | null; created_at: string };
type Totals = { accounts: number | null; posts: number | null; comments: number | null; knowledgePosts: number | null };

const WINDOW_DAYS = 30;
const EVENT_WINDOW_LIMIT = 5000;

// The onboarding tour is the one flow with enough instrumentation to read as a funnel,
// and it is the flow most likely to be quietly losing new readers.
const FUNNEL: Array<{ event: string; label: string }> = [
  { event: "onboarding_shown", label: "Tour offered" },
  { event: "onboarding_started", label: "Tour started" },
  { event: "onboarding_completed", label: "Tour completed" },
  { event: "onboarding_first_action", label: "Took first action" }
];

function since(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export default function AdminAnalyticsPage() {
  const [state, setState] = useState<"loading" | "signed-out" | "not-moderator" | "unavailable" | "ready">("loading");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [totals, setTotals] = useState<Totals>({ accounts: 0, posts: 0, comments: 0, knowledgePosts: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) { setState("unavailable"); return; }
      const auth = await requireProfile();
      if (cancelled) return;
      if (!auth.ok) { setState("signed-out"); return; }

      const { data: me } = await supabase.from("profiles").select("is_moderator").eq("id", auth.profileId).maybeSingle();
      if (cancelled) return;
      if (!me?.is_moderator) { setState("not-moderator"); return; }

      const [eventsResult, accounts, posts, comments, knowledge] = await Promise.all([
        supabase.from("analytics_events").select("event_name,user_id,created_at").gte("created_at", since(WINDOW_DAYS)).order("created_at", { ascending: false }).limit(EVENT_WINDOW_LIMIT),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("discussion_posts").select("id", { count: "exact", head: true }),
        supabase.from("discussion_comments").select("id", { count: "exact", head: true }),
        supabase.from("knowledge_posts").select("id", { count: "exact", head: true })
      ]);
      if (cancelled) return;

      if (eventsResult.error) {
        setError("Events could not be read. Check that the analytics migration has been applied.");
      } else {
        setEvents((eventsResult.data || []) as EventRow[]);
      }
      // This page says "Counts come from the database, not the interface". `|| 0` turned a
      // failed count into a confident "0 Discussions", which is the one reading the operator
      // must not get wrong on launch day. A count we could not take shows as "-".
      const countOrNull = (result: { count: number | null; error: unknown }) =>
        (result.error ? null : result.count ?? 0);
      setTotals({
        accounts: countOrNull(accounts),
        posts: countOrNull(posts),
        comments: countOrNull(comments),
        knowledgePosts: countOrNull(knowledge)
      });
      setState("ready");
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const byName = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_name] = (acc[e.event_name] || 0) + 1;
    return acc;
  }, {});
  const ranked = Object.entries(byName).sort((a, b) => b[1] - a[1]);
  const activeAccounts = new Set(events.map((e) => e.user_id).filter(Boolean)).size;
  const last7 = events.filter((e) => e.created_at >= since(7)).length;
  const funnelCounts = FUNNEL.map((step) => ({ ...step, count: byName[step.event] || 0 }));
  const funnelTop = funnelCounts[0]?.count || 0;

  return (
    <div className="container-page py-10 md:py-14">
      <p className="caption">Moderation</p>
      <h1 className="title-1 mt-2">Analytics</h1>
      <p className="body-copy mt-3 max-w-2xl">
        Events from the last {WINDOW_DAYS} days, plus lifetime community totals. Counts come from the database, not the interface.
      </p>

      {state === "loading" && <p className="body-copy mt-6">Checking access...</p>}
      {state === "unavailable" && <p className="body-copy mt-6">Analytics requires the production database connection.</p>}
      {state === "not-moderator" && <p className="body-copy mt-6">This area is only available to moderators.</p>}
      {state === "signed-out" && (
        <p className="body-copy mt-6">
          Log in with a moderator account to view analytics. <Link className="font-medium underline underline-offset-4" href="/login?next=%2Fadmin%2Fanalytics">Log in</Link>
        </p>
      )}

      {state === "ready" && events.length >= EVENT_WINDOW_LIMIT && (
        <p className="subheadline mt-4">
          Showing the newest {EVENT_WINDOW_LIMIT} events only. Everything below, including the funnel, is computed from that slice and understates the top of the funnel.
        </p>
      )}

      {state === "ready" && (
        <>
          {error && <p role="alert" className="mt-6 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Accounts" value={totals.accounts} hint="lifetime" />
            <Stat label="Book perspectives" value={totals.posts} hint="lifetime" />
            <Stat label="Replies" value={totals.comments} hint="lifetime" />
            <Stat label="Feed perspectives" value={totals.knowledgePosts} hint="lifetime" />
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Events" value={events.length} hint={`last ${WINDOW_DAYS} days`} />
            <Stat label="Events" value={last7} hint="last 7 days" />
            <Stat label="Accounts active" value={activeAccounts} hint={`last ${WINDOW_DAYS} days`} />
            <Stat label="Distinct events" value={ranked.length} hint="types seen" />
          </section>

          <section className="mt-10">
            <h2 className="title-3">Onboarding funnel</h2>
            <p className="subheadline mt-2">Where new readers stop. Each step is the count of that event in the window.</p>
            {funnelTop === 0 ? (
              <p className="body-copy mt-4 rounded-[20px] bg-black/[0.025] p-4">
                No onboarding events recorded yet. This fills in once readers reach the tour.
              </p>
            ) : (
              <ul className="mt-5 grid gap-3">
                {funnelCounts.map((step, i) => {
                  const pct = funnelTop ? Math.round((step.count / funnelTop) * 100) : 0;
                  const prev = i > 0 ? funnelCounts[i - 1].count : null;
                  const dropped = prev !== null && prev > 0 ? prev - step.count : 0;
                  return (
                    <li key={step.event} className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[15px] font-medium text-[color:var(--color-text-primary)]">{step.label}</span>
                        <span className="text-sm font-semibold">{step.count} <span className="font-normal text-[color:var(--color-text-muted)]">({pct}%)</span></span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
                        <div className="h-full rounded-full bg-[color:var(--color-text-primary)]" style={{ width: `${pct}%` }} />
                      </div>
                      {dropped > 0 && <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">{dropped} did not continue from the previous step.</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="title-3">Events by type</h2>
            {ranked.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-[20px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
                <BarChart3 size={19} className="text-[color:var(--color-text-muted)]" />
                <p className="body-copy">
                  No events in the last {WINDOW_DAYS} days. Events record for every visitor, signed in or not, so this staying empty means nobody has opened the site - not that nobody has signed in.
                </p>
              </div>
            ) : (
              <ul className="mt-5 grid gap-2">
                {ranked.map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between gap-4 rounded-[16px] bg-white px-4 py-3 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
                    <span className="font-mono text-sm text-[color:var(--color-text-primary)]">{name}</span>
                    <span className="text-sm font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="subheadline mt-10">
            <Link className="font-medium underline underline-offset-4" href="/admin/reports">Go to the moderation queue</Link>
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
      <p className="caption text-[10px]">{label}</p>
      <p className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.03em] text-[color:var(--color-text-primary)]">{value === null ? "-" : value}</p>
      <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">{hint}</p>
    </div>
  );
}
