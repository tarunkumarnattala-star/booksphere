-- Public engagement totals without exposing the identities behind private saves or follows.
create or replace view public.discussion_engagement_counts
with (security_barrier = true)
as
select
  post.id as discussion_post_id,
  count(distinct saved.id)::bigint as saves_count,
  count(distinct followed.id)::bigint as follows_count
from public.discussion_posts post
left join public.saved_insights saved on saved.discussion_post_id = post.id
left join public.followed_discussions followed on followed.discussion_post_id = post.id
where post.status = 'published'
group by post.id;

revoke all on public.discussion_engagement_counts from public, anon, authenticated;
grant select on public.discussion_engagement_counts to anon, authenticated, service_role;

create or replace view public.book_engagement_counts
with (security_barrier = true)
as
select
  book.id as book_id,
  count(distinct saved.id)::bigint as saves_count,
  count(distinct recommendation.id) filter (where recommendation.recommended)::bigint as recommends_count,
  count(distinct recommendation.id) filter (where not recommendation.recommended)::bigint as not_for_me_count
from public.books book
left join public.saved_books saved on saved.book_id = book.id
left join public.book_recommendations recommendation on recommendation.book_id = book.id
group by book.id;

revoke all on public.book_engagement_counts from public, anon, authenticated;
grant select on public.book_engagement_counts to anon, authenticated, service_role;

-- Features not exposed by the launch UI remain read-only through the public client.
revoke insert, update, delete on public.knowledge_posts, public.perspective_posts from authenticated;

alter table public.profiles drop constraint if exists profiles_launch_content_length;
alter table public.profiles add constraint profiles_launch_content_length
check (char_length(trim(name)) between 2 and 80 and char_length(coalesce(bio, '')) <= 280 and username ~ '^[a-z0-9_-]{3,30}$');

alter table public.discussion_posts drop constraint if exists discussion_posts_launch_content_length;
alter table public.discussion_posts add constraint discussion_posts_launch_content_length
check (char_length(title) <= 180 and char_length(body) <= 10000 and char_length(coalesce(quote_reference, '')) <= 500);

alter table public.discussion_posts drop constraint if exists discussion_posts_launch_structured_length;
alter table public.discussion_posts add constraint discussion_posts_launch_structured_length
check (
  char_length(coalesce(context_type, '')) <= 500 and
  char_length(coalesce(action_taken, '')) <= 500 and
  char_length(coalesce(outcome, '')) <= 500 and
  char_length(coalesce(what_failed, '')) <= 500 and
  char_length(coalesce(would_change, '')) <= 500
);

alter table public.discussion_comments drop constraint if exists discussion_comments_launch_content_length;
alter table public.discussion_comments add constraint discussion_comments_launch_content_length
check (char_length(body) <= 4000);

alter table public.reports drop constraint if exists reports_launch_content_length;
alter table public.reports add constraint reports_launch_content_length
check (char_length(reason) <= 500);

with ranked_reports as (
  select id, row_number() over (
    partition by reporter_id, target_type, target_id
    order by created_at desc, id desc
  ) as duplicate_rank
  from public.reports
)
delete from public.reports report
using ranked_reports ranked
where report.id = ranked.id and ranked.duplicate_rank > 1;

create unique index if not exists reports_reporter_target_unique
on public.reports (reporter_id, target_type, target_id);

create or replace function private.cleanup_polymorphic_engagement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.likes
  where target_id = old.id
    and target_type = case tg_table_name
      when 'discussion_posts' then 'discussion_post'
      when 'discussion_comments' then 'discussion_comment'
      when 'knowledge_posts' then 'knowledge_post'
    end;

  delete from public.useful_reactions
  where target_id = old.id
    and target_type = case tg_table_name
      when 'discussion_posts' then 'discussion_post'
      when 'knowledge_posts' then 'knowledge_post'
    end;
  return old;
end;
$$;

revoke all on function private.cleanup_polymorphic_engagement() from public, anon, authenticated;

drop trigger if exists discussion_posts_cleanup_engagement on public.discussion_posts;
create trigger discussion_posts_cleanup_engagement after delete on public.discussion_posts
for each row execute function private.cleanup_polymorphic_engagement();

drop trigger if exists discussion_comments_cleanup_engagement on public.discussion_comments;
create trigger discussion_comments_cleanup_engagement after delete on public.discussion_comments
for each row execute function private.cleanup_polymorphic_engagement();

drop trigger if exists knowledge_posts_cleanup_engagement on public.knowledge_posts;
create trigger knowledge_posts_cleanup_engagement after delete on public.knowledge_posts
for each row execute function private.cleanup_polymorphic_engagement();
