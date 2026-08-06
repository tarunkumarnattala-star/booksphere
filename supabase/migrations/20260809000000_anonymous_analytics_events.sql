-- Anonymous visitors could not record a single event: the insert policy on
-- analytics_events was `to authenticated`, so every event fired before sign-in failed with
-- 401 and was swallowed by the fire-and-forget call in src/lib/analytics.ts.
--
-- That left the whole acquisition funnel dark. Arrivals, landing views, and clicks on
-- "Join the Private Beta" all happen before anyone is authenticated, so on launch day the
-- questions that matter - how many came, how many converted, where the rest stopped - had
-- no data behind them. Only post-activation behaviour was ever measured.
--
-- Anonymous rows are allowed only with a null user_id, so an anonymous caller can never
-- attribute an event to a real account.

drop policy if exists "Anonymous visitors create analytics events" on analytics_events;
create policy "Anonymous visitors create analytics events" on analytics_events
for insert to anon
with check (user_id is null);

grant insert on public.analytics_events to anon;

-- The table is now writable by unauthenticated callers, so bound what a row can contain.
-- Without this an anonymous client could push arbitrarily large metadata and turn the
-- events table into free storage.
alter table public.analytics_events drop constraint if exists analytics_events_shape;
alter table public.analytics_events add constraint analytics_events_shape check (
  char_length(event_name) between 1 and 80
  and char_length(metadata::text) <= 2000
);
