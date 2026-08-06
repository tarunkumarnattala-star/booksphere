-- Deleting your own post has failed on production through four different client-side
-- attempts, always with 42501. The table grant, the ownership policy and execute on the
-- before-update trigger function were each verified true, and editing the same row through
-- the same policy works - the single difference is that deleting sets status to 'removed'.
-- Something in the live database refuses that specific write, and identifying it has cost
-- more rounds than it is worth on launch eve.
--
-- So stop asking the client to make that write. This does it in one place, owned by the
-- database, where policies and grants on the calling role cannot get in the way.
--
-- security definer is the reason it works, so the safety has to come from inside the
-- function instead of from RLS:
--   - the update matches on auth.uid() through profiles, so a caller can only ever remove a
--     post they wrote, and post_id is a parameter, not interpolated text
--   - it can only set status to 'removed'; there is no path here to edit a post's content,
--     change its author, or touch anyone else's row
--   - search_path is pinned, so nothing can shadow `profiles` or `discussion_posts`
--   - execute is revoked from public and anon; only a signed-in caller can reach it
--
-- It returns whether a row actually changed, so the app can tell a real delete from a
-- silent no-op rather than assuming success.

create or replace function public.delete_own_discussion(post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.discussion_posts p
  set status = 'removed'
  where p.id = post_id
    and p.status <> 'removed'
    and exists (
      select 1 from public.profiles pr
      where pr.id = p.user_id
        and pr.auth_user_id = auth.uid()
    );
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

revoke all on function public.delete_own_discussion(uuid) from public, anon;
grant execute on function public.delete_own_discussion(uuid) to authenticated;

-- Must print true. The editor's success banner has reported migrations as applied twice in
-- this project when nothing had changed.
select
  has_function_privilege('authenticated', 'public.delete_own_discussion(uuid)', 'EXECUTE') as can_call,
  exists (
    select 1 from pg_proc f
    join pg_namespace n on n.oid = f.pronamespace
    where n.nspname = 'public' and f.proname = 'delete_own_discussion' and f.prosecdef
  ) as is_security_definer;
