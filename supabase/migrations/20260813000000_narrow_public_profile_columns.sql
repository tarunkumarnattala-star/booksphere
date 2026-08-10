-- A stranger with nothing but the publishable key could read every column of every profile.
-- Verified on production, anonymously, in one request:
--
--   GET /rest/v1/profiles?select=username,is_moderator&is_moderator=eq.true
--     -> [{"username":"tarunkumarnattala-3427dc","is_moderator":true}]
--
-- That is the moderator roster, published. Anyone deciding whether to abuse this site could
-- first ask who would see the report. The same request shape exposes auth_user_id, which
-- links a public profile to its authentication identity - a join nobody outside needs.
--
-- The select policy is `using (true)`, which is correct: profiles are public. The mistake is
-- that "profile is public" was read as "every column is public". Names, usernames and bios
-- are the public part. Whether someone is a moderator, and which auth identity they are, are
-- not.
--
-- Column-level privileges are the right tool here, not a policy change. They are checked
-- before RLS, so publishing stays exactly as open as it was for the columns that belong to
-- the reader, and closed for the ones that belong to the operator.

revoke select on public.profiles from anon;
grant select (id, name, username, bio, created_at) on public.profiles to anon;

-- authenticated keeps auth_user_id and is_moderator because the app filters on them for the
-- signed-in reader's own row - auth-client.ts resolves a profile by auth_user_id, and both
-- admin screens check is_moderator on their own id. A member can therefore still read those
-- two columns for other members. That is a smaller and more ordinary exposure than a public
-- one, it requires an account, and closing it needs a view or an RPC rather than a grant.
-- Recorded rather than quietly left: it is the next step, not this one.
revoke select on public.profiles from authenticated;
grant select (id, name, username, bio, created_at, auth_user_id, is_moderator)
  on public.profiles to authenticated;

-- Must print exactly the columns above and nothing more. Read the rows; this project has had
-- the editor report success twice while changing nothing.
select
  grantee,
  string_agg(column_name, ', ' order by column_name) as readable_columns
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and privilege_type = 'SELECT'
  and grantee in ('anon', 'authenticated')
group by grantee
order by grantee;
