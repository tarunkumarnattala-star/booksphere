-- Posts, feed posts and comments are dated by the server, not by whoever writes them.
--
-- Every list on the site is newest first. Signed-in users hold insert and update on these
-- tables, column by column unrestricted, and the app never sends created_at - but nothing
-- stopped anyone else from sending it. One request with "created_at": "2099-01-01" pinned a
-- post to the top of the Feed and of its book page for good, above everything written after
-- it, and an edit could re-date an old post the same way.
--
-- For calls through the API the time of writing is now() and an edit keeps the original.
-- Security invoker on purpose, as in freeze_profile_privileges: current_user must be the real
-- caller. The SQL editor and the security-definer functions are not affected, so the seeded
-- editorial keeps its dates and a moderator take-down still works.
--
-- Paste into the Supabase SQL editor and run once. Safe to re-run.

create or replace function public.server_owns_created_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.created_at := now();
    else
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.server_owns_created_at() from public, anon, authenticated;

drop trigger if exists discussion_posts_server_owns_created_at on public.discussion_posts;
create trigger discussion_posts_server_owns_created_at
before insert or update on public.discussion_posts
for each row execute function public.server_owns_created_at();

drop trigger if exists knowledge_posts_server_owns_created_at on public.knowledge_posts;
create trigger knowledge_posts_server_owns_created_at
before insert or update on public.knowledge_posts
for each row execute function public.server_owns_created_at();

drop trigger if exists discussion_comments_server_owns_created_at on public.discussion_comments;
create trigger discussion_comments_server_owns_created_at
before insert or update on public.discussion_comments
for each row execute function public.server_owns_created_at();

-- EXPECT: 3
select count(*) as dated_by_server
from pg_trigger
where tgname like '%_server_owns_created_at' and tgenabled = 'O';
