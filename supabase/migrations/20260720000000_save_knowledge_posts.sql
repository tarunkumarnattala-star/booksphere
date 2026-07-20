create table if not exists public.saved_knowledge_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  knowledge_post_id uuid not null references public.knowledge_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_knowledge_posts_user_post_key unique (user_id, knowledge_post_id)
);

create index if not exists saved_knowledge_posts_user_idx
  on public.saved_knowledge_posts(user_id, created_at desc);

create index if not exists saved_knowledge_posts_post_idx
  on public.saved_knowledge_posts(knowledge_post_id, created_at desc);

alter table public.saved_knowledge_posts enable row level security;

drop policy if exists "Users read own saved knowledge posts" on public.saved_knowledge_posts;
create policy "Users read own saved knowledge posts"
on public.saved_knowledge_posts for select
to authenticated
using (
  exists (
    select 1 from public.profiles profile
    where profile.id = saved_knowledge_posts.user_id
      and profile.auth_user_id = (select auth.uid())
  )
);

drop policy if exists "Users insert own saved knowledge posts" on public.saved_knowledge_posts;
create policy "Users insert own saved knowledge posts"
on public.saved_knowledge_posts for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles profile
    where profile.id = saved_knowledge_posts.user_id
      and profile.auth_user_id = (select auth.uid())
  )
);

drop policy if exists "Users delete own saved knowledge posts" on public.saved_knowledge_posts;
create policy "Users delete own saved knowledge posts"
on public.saved_knowledge_posts for delete
to authenticated
using (
  exists (
    select 1 from public.profiles profile
    where profile.id = saved_knowledge_posts.user_id
      and profile.auth_user_id = (select auth.uid())
  )
);

revoke all on table public.saved_knowledge_posts from anon;
grant select, insert, delete on table public.saved_knowledge_posts to authenticated;
grant all on table public.saved_knowledge_posts to service_role;
