"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="editorial-page">
      <p className="caption">Moderation</p>
      <h1 className="large-title mt-4">Analytics</h1>
      <p className="body-copy measure mt-5">
        Events from the last {WINDOW_DAYS} days, plus lifetime totals. Counts come from the database, not the interface.
      </p>

      {state === "loading" && <p className="body-copy measure mt-8">Checking access...</p>}
      {state === "unavailable" && <p className="body-copy measure mt-8">Analytics requires the production database connection.</p>}
      {state === "not-moderator" && <p className="body-copy measure mt-8">This area is only available to moderators.</p>}
      {state === "signed-out" && (
        <p className="body-copy measure mt-8">
          Log in with a moderator account to view analytics. <Link className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px]" href="/login?next=%2Fadmin%2Fanalytics">Log in</Link>
        </p>
      )}

      {state === "ready" && events.length >= EVENT_WINDOW_LIMIT && (
        <p className="footnote measure mt-5">
          Showing the newest {EVENT_WINDOW_LIMIT} events only. Everything below, including the funnel, is computed from that slice and understates the top of the funnel.
        </p>
      )}

      {state === "ready" && (
        <>
          {error && <p role="alert" className="footnote mt-5 border-l-2 border-[color:var(--color-rose)] pl-4 text-[color:var(--color-rose)]">{error}</p>}

          {/* "Feed perspectives" called a feed note a perspective, which is the one word
              this product reserves for a contribution about a book. */}
          <dl className="facts mt-8 border-t border-[color:var(--rule-strong)] pt-5">
            <Stat label="Accounts" value={totals.accounts} hint="lifetime" />
            <Stat label="Perspectives" value={totals.posts} hint="lifetime" />
            <Stat label="Replies" value={totals.comments} hint="lifetime" />
            <Stat label="Feed notes" value={totals.knowledgePosts} hint="lifetime" />
          </dl>

          <dl className="facts mt-8 border-t border-[color:var(--rule)] pt-5">
            <Stat label="Events" value={events.length} hint={`last ${WINDOW_DAYS} days`} />
            <Stat label="Events" value={last7} hint="last 7 days" />
            <Stat label="Accounts active" value={activeAccounts} hint={`last ${WINDOW_DAYS} days`} />
            <Stat label="Distinct events" value={ranked.length} hint="types seen" />
          </dl>

          <section className="section-rule">
            <p className="caption">Onboarding funnel</p>
            <p className="body-copy measure mt-4">Where new readers stop. Each step is the count of that event in the window.</p>
            {funnelTop === 0 ? (
              <p className="body-copy measure mt-5">
                No onboarding events recorded yet. This fills in once readers reach the tour.
              </p>
            ) : (
              <ul className="mt-5 border-t border-[color:var(--rule-strong)]">
                {funnelCounts.map((step, i) => {
                  const pct = funnelTop ? Math.round((step.count / funnelTop) * 100) : 0;
                  const prev = i > 0 ? funnelCounts[i - 1].count : null;
                  const dropped = prev !== null && prev > 0 ? prev - step.count : 0;
                  return (
                    <li key={step.event} className="border-b border-[color:var(--rule)] py-4">
                      <div className="flex items-baseline justify-between gap-5">
                        <span className="text-[15px]">{step.label}</span>
                        <span className="numeral text-[15px]">{step.count} <span className="text-[color:var(--ink-50)]">({pct}%)</span></span>
                      </div>
                      <div className="mt-3 h-1.5 w-full bg-[color:var(--band)]">
                        <div className="h-full bg-[color:var(--ink)]" style={{ width: `${pct}%` }} />
                      </div>
                      {dropped > 0 && <p className="footnote mt-2">{dropped} did not continue from the previous step.</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="section-rule">
            <p className="caption">Events by type</p>
            {ranked.length === 0 ? (
              <div className="mt-5">
                <p className="body-copy measure">
                  No events in the last {WINDOW_DAYS} days. Events record for every visitor, signed in or not, so this staying empty means nobody has opened the site - not that nobody has signed in.
                </p>
              </div>
            ) : (
              <ul className="mt-5 border-t border-[color:var(--rule-strong)]">
                {ranked.map(([name, count]) => (
                  <li key={name} className="flex items-baseline justify-between gap-5 border-b border-[color:var(--rule)] py-3">
                    <span className="font-mono text-[13px]">{name}</span>
                    <span className="numeral text-[15px]">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="mt-8 border-t border-[color:var(--rule)] pt-4 footnote">
            <Link className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px]" href="/admin/reports">Go to the moderation queue</Link>
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  return (
    <div>
      <dt className="caption caption-muted">{label}</dt>
      <dd className="numeral !mt-3 !text-[28px] !leading-none">{value === null ? "-" : value}</dd>
      <dd className="footnote !mt-2">{hint}</dd>
    </div>
  );
}
