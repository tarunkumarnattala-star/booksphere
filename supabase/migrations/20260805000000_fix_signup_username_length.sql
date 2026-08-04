-- Signup has been broken since 2026-07-15 for any email whose local part is
-- longer than 23 characters (including plus-tagged addresses). The profile
-- trigger builds username as "<email local part>-<6 chars>" with no length
-- bound, while the launch-hardening constraint requires
-- username ~ '^[a-z0-9_-]{3,30}$'. When the generated username exceeds 30
-- characters the constraint rejects the profile insert, which aborts the
-- entire auth.users transaction: the user gets a 500 and no account exists.
--
-- Clamp the generated values to what the constraint accepts. The 6-character
-- uuid suffix is preserved for uniqueness, so the slug portion is capped at 23.

create or replace function create_profile_for_auth_user()
returns trigger as $$
declare
  base_name text;
  base_username text;
begin
  base_name := left(trim(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Reader')), 80);
  if char_length(base_name) < 2 then
    base_name := 'Reader';
  end if;

  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1), 'reader'),
    '[^a-zA-Z0-9_]+', '-', 'g'
  ));
  base_username := trim(both '-' from left(base_username, 23));
  if char_length(base_username) < 3 then
    base_username := 'reader';
  end if;

  insert into public.profiles (auth_user_id, name, username, avatar_url)
  values (
    new.id,
    base_name,
    base_username || '-' || left(replace(new.id::text, '-', ''), 6),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
