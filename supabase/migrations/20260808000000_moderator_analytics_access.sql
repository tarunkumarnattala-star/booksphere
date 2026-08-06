-- analytics_events has an insert policy and no select policy, so the app has been
-- writing events that nobody can read - the same write-only shape reports had. Give
-- moderators read access so the data is actually reviewable.
--
-- Reuses the is_moderator flag from 20260804000000 rather than inventing a second
-- notion of operator, so there is one place to grant and revoke.

drop policy if exists "Moderators can read analytics" on analytics_events;
create policy "Moderators can read analytics" on analytics_events
for select to authenticated
using (
  exists (
    select 1 from profiles p
    where p.auth_user_id = (select auth.uid())
      and p.is_moderator
  )
);

-- Events accumulate forever and are only ever read in aggregate over a recent window,
-- so index the column every dashboard query filters and orders on.
create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc);
create index if not exists analytics_events_name_created_idx on analytics_events (event_name, created_at desc);
