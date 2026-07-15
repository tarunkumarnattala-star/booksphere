alter table discussion_posts add column if not exists perspective_type text;
alter table discussion_posts add column if not exists chapter_id uuid references book_chapters(id) on delete set null;
alter table discussion_posts add column if not exists concept_id uuid references book_concepts(id) on delete set null;
alter table discussion_posts add column if not exists connected_book_id uuid references books(id) on delete set null;
alter table discussion_posts add column if not exists context_type text;
alter table discussion_posts add column if not exists action_taken text;
alter table discussion_posts add column if not exists outcome text;
alter table discussion_posts add column if not exists what_failed text;
alter table discussion_posts add column if not exists would_change text;
alter table discussion_posts add column if not exists status text not null default 'published';

alter table discussion_posts drop constraint if exists discussion_posts_post_type_check;
alter table discussion_posts add constraint discussion_posts_post_type_check
check (post_type in ('Insight','Question','Application','Disagreement','Quote','Summary','Personal Experience','Connection','Real-Life Result','What Did Not Work','Limitation'));

alter table discussion_posts drop constraint if exists discussion_posts_perspective_type_check;
alter table discussion_posts add constraint discussion_posts_perspective_type_check
check (perspective_type is null or perspective_type in ('insight','application','disagreement','summary','question','connection','real_life_result','did_not_work','limitation'));

alter table discussion_posts drop constraint if exists discussion_posts_status_check;
alter table discussion_posts add constraint discussion_posts_status_check
check (status in ('draft','published','archived','removed'));

update discussion_posts set perspective_type = case post_type
  when 'Application' then 'application'
  when 'Disagreement' then 'disagreement'
  when 'Summary' then 'summary'
  when 'Question' then 'question'
  when 'Connection' then 'connection'
  when 'Real-Life Result' then 'real_life_result'
  when 'What Did Not Work' then 'did_not_work'
  when 'Limitation' then 'limitation'
  else 'insight'
end
where perspective_type is null;

create index if not exists discussion_posts_perspective_idx on discussion_posts(book_id, perspective_type, status, created_at desc);
create index if not exists discussion_posts_user_status_idx on discussion_posts(user_id, status, created_at desc);
create index if not exists discussion_posts_chapter_status_idx on discussion_posts(chapter_id, status, created_at desc);
create index if not exists discussion_posts_concept_status_idx on discussion_posts(concept_id, status, created_at desc);

drop policy if exists "Discussions are readable" on discussion_posts;
drop policy if exists "Published discussions are readable" on discussion_posts;
create policy "Published discussions are readable" on discussion_posts
for select using (status = 'published');

drop policy if exists "Authenticated users create discussions" on discussion_posts;
create policy "Authenticated users create discussions" on discussion_posts
for insert to authenticated
with check (
  status = 'published'
  and exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid()))
);
