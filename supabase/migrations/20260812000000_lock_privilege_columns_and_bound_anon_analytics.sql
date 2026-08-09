-- Launch audit 2 (2026-08-09). Two holes and one clean-up. Run this whole file in the
-- Supabase SQL editor.
--
-- READ THIS FIRST. The editor's green banner has lied twice on this project: a migration
-- reported as applied while nothing changed, both times. Every section below ends with a
-- select that prints the state you should see. Read the rows. If a row does not match the
-- comment above it, the migration did not apply and you must run it again.

-- =====================================================================================
-- 1. P0 - any signed-in reader can make themselves a moderator.
--
-- 20260804000000 says in its own header: "The flag can only be granted in the Supabase
-- dashboard (no client write path exists), so users cannot promote themselves."
-- That is false, and it has been false since the moment the flag was added.
--
-- Three things combine:
--   20260715010943:42  grant select, update on public.profiles to authenticated;  <- no column list
--   20260804000000:7   alter table profiles add column is_moderator ...           <- covered by that grant
--   schema.sql:289-292 the UPDATE policy checks WHICH ROW, never WHICH COLUMNS
--
-- /settings only sends name, username and bio - but the UI is not the boundary. PostgREST
-- is, and it accepts any column the role holds UPDATE on:
--
--   PATCH /rest/v1/profiles?auth_user_id=eq.<my-uuid>   {"is_moderator": true}
--
-- is_moderator is the only gate on /admin/reports and /admin/analytics, and it carries
-- DELETE on reports (20260808010000). So any account can read every abuse report - each
-- one joined to its reporter's name and @username - and delete the reports filed against
-- them. Someone reporting harassment can be identified and silenced by the person they
-- reported.
--
-- Verified live on 2026-08-09 with the anon key alone: the moderator roster is public.
--   GET /rest/v1/profiles?select=username,is_moderator&is_moderator=eq.true
--   -> [{"username":"tarunkumarnattala-3427dc","is_moderator":true}]
-- So an attacker does not have to guess which flag to set or who already holds it.
--
-- The fix is a column-level grant. Column privileges are checked before RLS, so the row
-- ownership policy is untouched and keeps doing its job. /settings keeps working - it
-- writes exactly name, username and bio.
-- =====================================================================================

revoke update on public.profiles from authenticated;
grant update (name, username, bio, avatar_url) on public.profiles to authenticated;

-- Defence in depth, so that re-running an old blanket grant cannot silently reopen this.
-- security invoker on purpose: current_user must be the real caller, not the owner.
create or replace function public.freeze_profile_privileges()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.is_moderator := old.is_moderator;
    new.auth_user_id := old.auth_user_id;
    new.id           := old.id;
  end if;
  return new;
end;
$$;

revoke all on function public.freeze_profile_privileges() from public, anon, authenticated;

drop trigger if exists profiles_freeze_privileges on public.profiles;
create trigger profiles_freeze_privileges
before update on public.profiles
for each row execute function public.freeze_profile_privileges();

-- EXPECT: exactly four rows - avatar_url, bio, name, username. If is_moderator appears,
-- or if this returns nothing, section 1 did not apply.
select column_name
from information_schema.column_privileges
where grantee = 'authenticated'
  and table_schema = 'public'
  and table_name = 'profiles'
  and privilege_type = 'UPDATE'
order by column_name;

-- EXPECT: false.
select has_column_privilege('authenticated', 'public.profiles', 'is_moderator', 'UPDATE')
  as authenticated_can_write_is_moderator;

-- =====================================================================================
-- 2. P1 - analytics_events is unbounded free storage for anonymous callers.
--
-- anon holds INSERT with check (user_id is null), which is correct and deliberate. What is
-- missing is any bound on volume. Verified against production on 2026-08-09 using nothing
-- but the publishable key that ships in every page of the site:
--
--   * 200 rows in a single request            -> 201
--   * 30 sequential single-row inserts        -> 201 every time, no throttling of any kind
--   * a 5,000-row / 315 KB request            -> accepted and processed; it failed only
--                                                because the last row deliberately broke
--                                                the CHECK, not on size or row count
--
-- metadata is capped at 2000 characters, so a single request can carry roughly 10 MB.
-- The Supabase free tier is 500 MB. That is about 50 requests to fill the database, after
-- which every write fails - including the profile trigger, which means nobody can sign up.
-- Nothing alerts on it and no spend cap covers it.
--
-- Two bounds, neither of which touches the grant or the policy:
--   * one row per statement for anonymous callers, which removes the bulk vector entirely
--   * a ceiling on anonymous rows per minute
-- target_type is also added to the shape constraint - it was the one text column the
-- original constraint forgot, so it was unbounded.
-- =====================================================================================

alter table public.analytics_events drop constraint if exists analytics_events_shape;
alter table public.analytics_events add constraint analytics_events_shape check (
  char_length(event_name) between 1 and 80
  and char_length(metadata::text) <= 2000
  and char_length(coalesce(target_type, '')) <= 40
) not valid;

create or replace function public.limit_anonymous_analytics()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
begin
  if auth.uid() is not null then
    return null;
  end if;

  -- The product inserts one event at a time. A bulk insert from an anonymous caller is
  -- not a use of this app.
  if (select count(*) from inserted) > 1 then
    raise exception using errcode = '22023', message = 'Anonymous analytics accepts one event per request';
  end if;

  select count(*) into recent
  from public.analytics_events
  where user_id is null
    and created_at >= now() - interval '1 minute';

  if recent > 600 then
    raise exception using errcode = '22023', message = 'Analytics rate limit exceeded';
  end if;

  return null;
end;
$$;

revoke all on function public.limit_anonymous_analytics() from public, anon, authenticated;

drop trigger if exists analytics_events_anon_bound on public.analytics_events;
create trigger analytics_events_anon_bound
after insert on public.analytics_events
referencing new table as inserted
for each statement execute function public.limit_anonymous_analytics();

-- EXPECT: one row, analytics_events_anon_bound, tgenabled = 'O'.
select tgname, tgenabled
from pg_trigger
where tgrelid = 'public.analytics_events'::regclass
  and not tgisinternal;

-- =====================================================================================
-- 3. Clean-up of this audit's own probe rows.
--
-- Proving section 2 required writing to the table, and neither anon nor authenticated has
-- DELETE on analytics_events, so I could not remove them myself. 231 rows: 1 audit_probe,
-- 200 audit_bulk_probe, 30 audit_rate_probe. Left in place they would be the highest-volume
-- event on /admin/analytics and would misreport your launch numbers.
-- =====================================================================================

delete from public.analytics_events
where event_name in ('audit_probe', 'audit_bulk_probe', 'audit_rate_probe', 'size_probe');

-- EXPECT: 0.
select count(*) as leftover_probe_rows
from public.analytics_events
where event_name in ('audit_probe', 'audit_bulk_probe', 'audit_rate_probe', 'size_probe');

-- =====================================================================================
-- 4. Two security-definer functions pin search_path to public rather than ''.
-- Not the classic unpinned hole - they are pinned - but pinned to the one schema most
-- likely to be writable, and inconsistent with the other definer functions in this schema
-- which already use ''. Both bodies schema-qualify every reference, so this is free.
-- =====================================================================================

alter function public.create_profile_for_auth_user() set search_path = '';
alter function public.delete_own_discussion(uuid) set search_path = '';

-- EXPECT: search_path=" for all four rows.
select p.proname, p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prosecdef
  and n.nspname in ('public', 'private')
order by p.proname;

-- =====================================================================================
-- 5. Confirm the anti-spam trigger survived 20260807010000, which disabled it to seed the
-- editorial discussions and re-enabled it 149 lines later. If that paste ever half-applied,
-- rate limiting on posts and comments is currently off and nothing would show it.
--
-- EXPECT: discussion_posts_rate_limit with tgenabled = 'O'. If it reads 'D', run
--   alter table public.discussion_posts enable trigger discussion_posts_rate_limit;
-- =====================================================================================

select tgname, tgenabled
from pg_trigger
where tgrelid = 'public.discussion_posts'::regclass
  and not tgisinternal
order by tgname;
