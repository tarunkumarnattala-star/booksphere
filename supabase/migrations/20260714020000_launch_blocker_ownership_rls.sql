create index if not exists discussion_posts_search_status_idx
on discussion_posts(status, created_at desc);

create index if not exists discussion_posts_title_search_idx
on discussion_posts using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, '') || ' ' || coalesce(perspective_type, '')));

create index if not exists follows_following_idx on follows(following_id, created_at desc);
create index if not exists follows_follower_idx on follows(follower_id, created_at desc);

drop policy if exists "Discussions are readable" on discussion_posts;
drop policy if exists "Published discussions are readable" on discussion_posts;
create policy "Published discussions are readable" on discussion_posts
for select using (status = 'published');

drop policy if exists "Authenticated users create discussions" on discussion_posts;
create policy "Authenticated users create discussions" on discussion_posts
for insert to authenticated
with check (
  status = 'published'
  and exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
);

drop policy if exists "Users update own discussions" on discussion_posts;
create policy "Users update own discussions" on discussion_posts
for update to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
);

drop policy if exists "Users delete own discussions" on discussion_posts;
create policy "Users delete own discussions" on discussion_posts
for delete to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
);

drop policy if exists "Useful reactions are readable" on useful_reactions;
create policy "Useful reactions are readable" on useful_reactions
for select using (true);

drop policy if exists "Users insert own useful reactions" on useful_reactions;
create policy "Users insert own useful reactions" on useful_reactions
for insert to authenticated
with check (
  exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
);

drop policy if exists "Users delete own useful reactions" on useful_reactions;
create policy "Users delete own useful reactions" on useful_reactions
for delete to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
);

drop policy if exists "Users update own useful reactions" on useful_reactions;
create policy "Users update own useful reactions" on useful_reactions
for update to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = user_id
      and p.auth_user_id = (select auth.uid())
  )
);
