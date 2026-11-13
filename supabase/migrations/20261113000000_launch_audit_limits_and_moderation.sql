-- Pre-launch audit, 2026-11-13. Paste the whole file into the Supabase SQL editor and run it
-- once. Every section is safe to re-run. The selects at the end must print the values in
-- their EXPECT lines - the editor's success banner is not proof on its own in this project.
--
-- 1. Feed posts get the same posting limit discussion posts already have.
-- 2. Analytics stops being unlimited for anyone who is signed in.
-- 3. Nobody but the house can call themselves BookSphere.
-- 4. New accounts stop publishing the first half of their email address.
-- 5. Moderators can take content down from /admin/reports.
-- 6. Feed posts and comments can be reported.
-- 7. The QA probe account is deleted, as asked on launch day.


-- =====================================================================================
-- 1. Posting limit on the Feed
--
-- private.enforce_community_rate_limit covered discussion_posts (10 an hour), comments (40 an
-- hour) and reports (20 a day). knowledge_posts - the Feed - had no trigger at all, so one
-- signed-in account could publish without limit into the most visible page on the site.
-- The function is restated whole; the three existing branches are unchanged.
-- =====================================================================================

create or replace function private.enforce_community_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_auth_user uuid := auth.uid();
  recent_count integer;
  allowed_count integer;
  window_start timestamptz;
begin
  if current_auth_user is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if tg_table_name = 'discussion_posts' then
    allowed_count := 10;
    window_start := now() - interval '1 hour';
    select count(*) into recent_count
    from public.discussion_posts item
    join public.profiles p on p.id = item.user_id
    where p.auth_user_id = current_auth_user and item.created_at >= window_start;
  elsif tg_table_name = 'knowledge_posts' then
    allowed_count := 10;
    window_start := now() - interval '1 hour';
    select count(*) into recent_count
    from public.knowledge_posts item
    join public.profiles p on p.id = item.user_id
    where p.auth_user_id = current_auth_user and item.created_at >= window_start;
  elsif tg_table_name = 'discussion_comments' then
    allowed_count := 40;
    window_start := now() - interval '1 hour';
    select count(*) into recent_count
    from public.discussion_comments item
    join public.profiles p on p.id = item.user_id
    where p.auth_user_id = current_auth_user and item.created_at >= window_start;
  elsif tg_table_name = 'reports' then
    allowed_count := 20;
    window_start := now() - interval '1 day';
    select count(*) into recent_count
    from public.reports item
    join public.profiles p on p.id = item.reporter_id
    where p.auth_user_id = current_auth_user and item.created_at >= window_start;
  else
    return new;
  end if;

  if recent_count >= allowed_count then
    raise exception using errcode = 'P0001', message = 'Rate limit exceeded. Please try again later.';
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_community_rate_limit() from public, anon, authenticated;

drop trigger if exists knowledge_posts_rate_limit on public.knowledge_posts;
create trigger knowledge_posts_rate_limit before insert on public.knowledge_posts
for each row execute function private.enforce_community_rate_limit();


-- =====================================================================================
-- 2. Analytics bound for signed-in callers
--
-- limit_anonymous_analytics returned at once whenever auth.uid() was set, so a single Google
-- sign-in removed both bounds: bulk inserts and unlimited volume, into a table nothing can
-- delete from, on a 500 MB free database. Now every API caller gets one row per request,
-- anonymous rows share the existing 600-a-minute ceiling, and each account gets 60 a minute
-- of its own - far above what browsing produces. The SQL editor (no API role) is untouched.
-- =====================================================================================

create index if not exists analytics_events_user_created_idx
  on public.analytics_events (user_id, created_at desc);

create or replace function public.limit_anonymous_analytics()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
  row_user uuid;
begin
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') then
    return null;
  end if;

  if (select count(*) from inserted) > 1 then
    raise exception using errcode = '22023', message = 'Analytics accepts one event per request';
  end if;

  select user_id into row_user from inserted;

  if row_user is null then
    select count(*) into recent
    from public.analytics_events
    where user_id is null
      and created_at >= now() - interval '1 minute';
    if recent > 600 then
      raise exception using errcode = '22023', message = 'Analytics rate limit exceeded';
    end if;
  else
    select count(*) into recent
    from public.analytics_events
    where user_id = row_user
      and created_at >= now() - interval '1 minute';
    if recent > 60 then
      raise exception using errcode = '22023', message = 'Analytics rate limit exceeded';
    end if;
  end if;

  return null;
end;
$$;
revoke all on function public.limit_anonymous_analytics() from public, anon, authenticated;
-- The trigger from 20260812000000 already calls this function; restated so this file stands
-- alone if that one was never run.
drop trigger if exists analytics_events_anon_bound on public.analytics_events;
create trigger analytics_events_anon_bound
after insert on public.analytics_events
referencing new table as inserted
for each statement execute function public.limit_anonymous_analytics();


-- =====================================================================================
-- 3. The house names are reserved
--
-- The app treated anything signed "BookSphere Team" as the house, and any reader could type
-- that into Settings. The app now goes by account id; this stops the name itself being
-- borrowed. On sign-up a reserved name quietly becomes "Reader" (failing there would abort
-- the whole sign-up); on edit it is refused, and Settings explains why.
-- =====================================================================================

create or replace function public.reserve_house_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  flat_name text := lower(regexp_replace(coalesce(new.name, ''), '[^a-zA-Z0-9]', '', 'g'));
  flat_username text := lower(regexp_replace(coalesce(new.username, ''), '[^a-zA-Z0-9]', '', 'g'));
  reserved text[] := array['communitystarter', 'readerops', 'admin', 'administrator', 'moderator', 'support'];
begin
  if new.id in (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  ) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if flat_name like '%booksphere%' or flat_name = any(reserved) then
      new.name := 'Reader';
    end if;
    if flat_username like '%booksphere%' or flat_username = any(reserved) then
      new.username := 'reader-' || left(replace(gen_random_uuid()::text, '-', ''), 12);
    end if;
    return new;
  end if;

  if (new.name is distinct from old.name and (flat_name like '%booksphere%' or flat_name = any(reserved)))
     or (new.username is distinct from old.username and (flat_username like '%booksphere%' or flat_username = any(reserved))) then
    raise exception using errcode = 'P0001', message = 'That name is reserved';
  end if;
  return new;
end;
$$;
revoke all on function public.reserve_house_identity() from public, anon, authenticated;

drop trigger if exists profiles_reserve_house_identity on public.profiles;
create trigger profiles_reserve_house_identity
before insert or update on public.profiles
for each row execute function public.reserve_house_identity();


-- =====================================================================================
-- 4. New accounts stop publishing their email address
--
-- The sign-up trigger built the public username from the email's local part, and for email
-- sign-ups the display name too: tarun.k.2000@gmail.com became "tarun-k-2000-d82c5c" on a
-- public page, which with "gmail.com" appended is the address. Every one of the six real
-- accounts today is shaped like that. New accounts get "reader-" and twelve random characters,
-- and the name Google provides (or "Reader"). Both can be changed in Settings.
--
-- Existing accounts are NOT changed here - renaming them breaks any profile link already
-- shared. If you want them changed too, run the commented block under it.
-- =====================================================================================

create or replace function public.create_profile_for_auth_user()
returns trigger as $$
declare
  base_name text;
begin
  base_name := left(trim(coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    ''
  )), 80);
  if char_length(base_name) < 2 then
    base_name := 'Reader';
  end if;

  insert into public.profiles (auth_user_id, name, username, avatar_url)
  values (
    new.id,
    base_name,
    'reader-' || left(replace(new.id::text, '-', ''), 12),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Optional - renames every existing reader whose username came from their email. Their old
-- profile links will 404 afterwards. Remove the two dashes at the start of each line to run.
-- update public.profiles
-- set username = 'reader-' || left(replace(auth_user_id::text, '-', ''), 12)
-- where auth_user_id is not null
--   and id not in ('11111111-1111-1111-1111-111111111111',
--                  '22222222-2222-2222-2222-222222222222',
--                  '33333333-3333-3333-3333-333333333333')
--   and username !~ '^reader-[0-9a-f]{12}$';


-- =====================================================================================
-- 5. Moderators can take content down
--
-- /admin/reports could only dismiss a report; the reported post stayed up, and removing it
-- meant the table editor. This is the one function the "Take down" button calls. It checks
-- is_moderator itself, so granting it to every signed-in user is safe - for anyone else it
-- does nothing and returns false. A perspective is hidden the same way its author's own
-- delete hides it (status 'removed'); a feed post or comment is deleted. Every report about
-- that target is cleared with it. Returns true when the target is no longer visible.
-- =====================================================================================

create or replace function public.moderate_remove_content(p_target_type text, p_target_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and is_moderator
  ) then
    return false;
  end if;

  if p_target_type = 'discussion_post' then
    update public.discussion_posts set status = 'removed'
    where id = p_target_id and status <> 'removed';
  elsif p_target_type = 'knowledge_post' then
    delete from public.knowledge_posts where id = p_target_id;
  elsif p_target_type = 'discussion_comment' then
    delete from public.discussion_comments where id = p_target_id;
  else
    return false;
  end if;

  delete from public.reports where target_type = p_target_type and target_id = p_target_id;

  return case p_target_type
    when 'discussion_post' then not exists (
      select 1 from public.discussion_posts where id = p_target_id and status <> 'removed')
    when 'knowledge_post' then not exists (
      select 1 from public.knowledge_posts where id = p_target_id)
    else not exists (
      select 1 from public.discussion_comments where id = p_target_id)
  end;
end;
$$;
revoke all on function public.moderate_remove_content(text, uuid) from public, anon;
grant execute on function public.moderate_remove_content(text, uuid) to authenticated;


-- =====================================================================================
-- 6. Feed posts and comments can be reported
--
-- The Feed now has a Report button that files target_type 'knowledge_post'. Restated so the
-- live table accepts it whatever constraint it was first created with. NOT VALID: existing
-- rows are not re-checked, only new reports.
-- =====================================================================================

alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('discussion_post', 'discussion_comment', 'knowledge_post', 'profile')) not valid;


-- =====================================================================================
-- 7. Delete the QA probe account
--
-- The route already 404s, but the row was still returned by every profile list. It owns no
-- posts, comments or likes. Deleting the sign-in user cascades to the profile.
-- =====================================================================================

delete from auth.users
where id = (select auth_user_id from public.profiles where username = 'booksphere-qa-probe-tri-a71c6f');
-- In case the profile was never linked to a sign-in user.
delete from public.profiles where username = 'booksphere-qa-probe-tri-a71c6f';


-- =====================================================================================
-- Verification. Each line must print what its EXPECT says.
-- =====================================================================================

-- EXPECT: knowledge_posts_rate_limit, O
select tgname, tgenabled from pg_trigger
where tgrelid = 'public.knowledge_posts'::regclass and tgname = 'knowledge_posts_rate_limit';

-- EXPECT: profiles_reserve_house_identity, O
select tgname, tgenabled from pg_trigger
where tgrelid = 'public.profiles'::regclass and tgname = 'profiles_reserve_house_identity';

-- EXPECT: analytics_events_anon_bound, O
select tgname, tgenabled from pg_trigger
where tgrelid = 'public.analytics_events'::regclass and tgname = 'analytics_events_anon_bound';

-- EXPECT: can_call = true, anon_can_call = false
select
  has_function_privilege('authenticated', 'public.moderate_remove_content(text, uuid)', 'EXECUTE') as can_call,
  has_function_privilege('anon', 'public.moderate_remove_content(text, uuid)', 'EXECUTE') as anon_can_call;

-- EXPECT: 0
select count(*) as qa_probe_rows from public.profiles where username = 'booksphere-qa-probe-tri-a71c6f';

-- EXPECT: true - the sign-up trigger no longer reads the email address
select position('split_part' in pg_get_functiondef('public.create_profile_for_auth_user()'::regprocedure)) = 0
  as signup_ignores_email;
