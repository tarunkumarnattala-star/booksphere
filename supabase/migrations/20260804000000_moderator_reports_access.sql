-- Reports were write-only: an insert policy existed but no select policy at all,
-- so a user could report abuse and no one -- including the operator -- could read
-- it through the app. Add a per-profile moderator flag and let moderators read
-- reports. The flag can only be granted in the Supabase dashboard (no client
-- write path exists), so users cannot promote themselves.

alter table profiles add column if not exists is_moderator boolean not null default false;

drop policy if exists "Moderators can read reports" on reports;
create policy "Moderators can read reports" on reports
for select to authenticated
using (
  exists (
    select 1 from profiles p
    where p.auth_user_id = (select auth.uid())
      and p.is_moderator
  )
);

-- Moderators can clear a handled report.
drop policy if exists "Moderators can delete reports" on reports;
create policy "Moderators can delete reports" on reports
for delete to authenticated
using (
  exists (
    select 1 from profiles p
    where p.auth_user_id = (select auth.uid())
      and p.is_moderator
  )
);
