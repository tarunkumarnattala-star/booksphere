-- Editing and deleting a post both fail on production while creating one succeeds.
-- Every failing action is an UPDATE; the working one is an INSERT. Deleting is a soft
-- delete - it sets status to 'removed' - so it is an UPDATE too, which is why "delete"
-- and "edit" fail together and posting does not.
--
-- Three things can break UPDATE for a signed-in reader and leave INSERT untouched, and
-- each has a repair that is a no-op when that piece was already right. Rather than spend
-- another round trip identifying which one it is at launch hour, this repairs all three.
-- Every statement is idempotent and none of them widens access beyond the post's author.

-- 1. The table-level grant. The launch hardening pass revoked everything from
--    authenticated and granted privileges back one table at a time. A policy cannot open
--    a table the role has no privilege on - this exact gap made the moderator policies
--    inert (20260808010000) and the anonymous analytics policy inert (20260809000000).
grant update on public.discussion_posts to authenticated;

-- 2. The row policy. If 20260714020000_launch_blocker_ownership_rls.sql never reached
--    production there is no update policy at all, and RLS then matches zero rows and
--    raises nothing - a silent no-op that looks exactly like a delete that "did not work".
--    Both clauses are ownership only: a reader may change their own post and no other.
drop policy if exists "Users update own discussions" on public.discussion_posts;
create policy "Users update own discussions" on public.discussion_posts
for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
);

-- 3. The trigger function. discussion_posts_set_updated_at is `before update` only, so
--    losing execute on it would break every UPDATE while leaving INSERT working - which
--    is precisely the observed shape. The hardening pass revoked it from authenticated.
--    Granting it back opens nothing: the function is a trigger function, and Postgres
--    refuses to call one outside a trigger, so there is no way to invoke it directly.
grant execute on function public.set_updated_at() to authenticated;

-- Read the row this prints. All three must be true. The editor's success banner has twice
-- reported a migration as applied when nothing had changed.
select
  has_table_privilege('authenticated', 'public.discussion_posts', 'UPDATE') as grant_ok,
  exists (
    select 1 from pg_policies
    where tablename = 'discussion_posts' and policyname = 'Users update own discussions'
  ) as policy_ok,
  has_function_privilege('authenticated', 'public.set_updated_at()', 'EXECUTE') as trigger_fn_ok;
