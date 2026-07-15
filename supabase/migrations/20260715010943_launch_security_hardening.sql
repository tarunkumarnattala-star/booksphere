-- Keep private library state private and make Data API privileges explicit.
drop policy if exists "Saved books are readable" on public.saved_books;
drop policy if exists "Users read own saved books" on public.saved_books;
create policy "Users read own saved books" on public.saved_books
for select to authenticated
using (exists (select 1 from public.profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

drop policy if exists "Saved insights are readable" on public.saved_insights;
drop policy if exists "Users read own saved insights" on public.saved_insights;
create policy "Users read own saved insights" on public.saved_insights
for select to authenticated
using (exists (select 1 from public.profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

drop policy if exists "Followed discussions are readable" on public.followed_discussions;
drop policy if exists "Users read own followed discussions" on public.followed_discussions;
create policy "Users read own followed discussions" on public.followed_discussions
for select to authenticated
using (exists (select 1 from public.profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

drop policy if exists "Comments are readable" on public.discussion_comments;
drop policy if exists "Published discussion comments are readable" on public.discussion_comments;
create policy "Published discussion comments are readable" on public.discussion_comments
for select using (exists (
  select 1 from public.discussion_posts post
  where post.id = discussion_post_id and post.status = 'published'
));

grant usage on schema public to anon, authenticated, service_role;
revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.profiles, public.books, public.genres, public.book_genres,
  public.discussion_posts, public.discussion_comments, public.knowledge_posts,
  public.likes, public.book_recommendations, public.follows,
  public.badges, public.user_badges, public.post_awards,
  public.reading_paths, public.reading_path_books, public.editorial_picks,
  public.book_chapters, public.book_concepts, public.book_ideas,
  public.perspective_posts, public.useful_reactions,
  public.knowledge_connections, public.reading_progressions
to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on
  public.discussion_posts, public.discussion_comments, public.knowledge_posts,
  public.likes, public.saved_books, public.book_recommendations, public.follows,
  public.saved_insights, public.followed_discussions, public.post_awards,
  public.perspective_posts, public.useful_reactions, public.book_reader_status
to authenticated;
grant insert on public.reports, public.analytics_events to authenticated;
grant all privileges on all tables in schema public to service_role;

alter default privileges in schema public revoke all on tables from anon, authenticated;
revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- Database-enforced limits protect the public API even when clients bypass the UI.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

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

drop trigger if exists discussion_posts_rate_limit on public.discussion_posts;
create trigger discussion_posts_rate_limit before insert on public.discussion_posts
for each row execute function private.enforce_community_rate_limit();

drop trigger if exists discussion_comments_rate_limit on public.discussion_comments;
create trigger discussion_comments_rate_limit before insert on public.discussion_comments
for each row execute function private.enforce_community_rate_limit();

drop trigger if exists reports_rate_limit on public.reports;
create trigger reports_rate_limit before insert on public.reports
for each row execute function private.enforce_community_rate_limit();
