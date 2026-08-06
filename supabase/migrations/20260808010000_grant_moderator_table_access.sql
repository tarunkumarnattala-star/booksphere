-- The moderator policies added in 20260804000000 and 20260808000000 were inert.
--
-- The launch hardening pass revoked everything from anon and authenticated, then
-- re-granted narrowly, and for these two tables it granted INSERT only:
--
--   grant insert on public.reports, public.analytics_events to authenticated;
--
-- Row-level security filters rows *after* a role clears the table-level grant, so a
-- policy alone cannot open a table the role has no SELECT on. A moderator hit
-- "permission denied for table" exactly as an anonymous caller does, and both admin
-- pages showed their error state instead of data.
--
-- Grant the table-level privilege the policies depend on. This widens table access to
-- every authenticated role, which is how Postgres is meant to be used here: the GRANT
-- is the door, the policy is the lock. Non-moderators clear the grant and then match no
-- rows, so they still read nothing.

grant select on public.reports, public.analytics_events to authenticated;
grant delete on public.reports to authenticated;
