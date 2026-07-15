alter table public.knowledge_posts
add column if not exists reference_title text;

alter table public.knowledge_posts
drop constraint if exists knowledge_posts_launch_content_length;

alter table public.knowledge_posts
add constraint knowledge_posts_launch_content_length check (
  char_length(trim(title)) between 4 and 180 and
  char_length(trim(body)) between 20 and 2000 and
  char_length(coalesce(topic, '')) <= 80 and
  char_length(coalesce(reference_title, '')) <= 200
);

grant select on public.knowledge_posts to anon, authenticated;
grant insert, update, delete on public.knowledge_posts to authenticated;
