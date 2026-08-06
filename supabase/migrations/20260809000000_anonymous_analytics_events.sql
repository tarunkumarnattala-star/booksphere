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
--
-- `not valid` on purpose. A plain ADD CONSTRAINT validates every existing row, and a single
-- pre-existing row over either bound makes the statement fail - which in the Supabase SQL
-- editor rolls back the whole paste, silently taking the grant above with it. That failure
-- mode cost two rounds of "the migration ran" when nothing had. The point of the constraint
-- is to bound what anonymous callers can write from here on, and `not valid` enforces that
-- on every new insert. Old rows predate the anonymous write path and are not the risk.
alter table public.analytics_events drop constraint if exists analytics_events_shape;
alter table public.analytics_events add constraint analytics_events_shape check (
  char_length(event_name) between 1 and 80
  and char_length(metadata::text) <= 2000
) not valid;
