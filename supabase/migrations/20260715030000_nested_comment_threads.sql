alter table public.discussion_comments
  add column if not exists parent_comment_id uuid references public.discussion_comments(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists discussion_comments_parent_idx
  on public.discussion_comments(parent_comment_id, created_at asc);

drop policy if exists "Users update own comments" on public.discussion_comments;
create policy "Users update own comments" on public.discussion_comments
for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = discussion_comments.user_id
      and p.auth_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = discussion_comments.user_id
      and p.auth_user_id = (select auth.uid())
  )
);
