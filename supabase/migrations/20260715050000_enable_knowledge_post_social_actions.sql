alter table public.discussion_comments
  alter column discussion_post_id drop not null,
  add column if not exists knowledge_post_id uuid references public.knowledge_posts(id) on delete cascade;

alter table public.discussion_comments
  drop constraint if exists discussion_comments_single_parent_target;

alter table public.discussion_comments
  add constraint discussion_comments_single_parent_target check (
    num_nonnulls(discussion_post_id, knowledge_post_id) = 1
  );

create index if not exists discussion_comments_knowledge_post_idx
  on public.discussion_comments(knowledge_post_id, created_at desc);

drop policy if exists "Published discussion comments are readable" on public.discussion_comments;
create policy "Published community comments are readable" on public.discussion_comments
for select
using (
  exists (
    select 1 from public.discussion_posts post
    where post.id = discussion_comments.discussion_post_id
      and post.status = 'published'
  )
  or exists (
    select 1 from public.knowledge_posts post
    where post.id = discussion_comments.knowledge_post_id
  )
);
