create table if not exists saved_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  discussion_post_id uuid not null references discussion_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, discussion_post_id)
);

create table if not exists followed_discussions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  discussion_post_id uuid not null references discussion_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, discussion_post_id)
);

create table if not exists post_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  discussion_post_id uuid not null references discussion_posts(id) on delete cascade,
  award_type text not null check (award_type in ('Changed My Thinking','Practical Advice','Great Summary','Best Explanation','Actionable','Deep Insight')),
  created_at timestamptz not null default now(),
  unique (user_id, discussion_post_id, award_type)
);

create table if not exists reading_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  slug text not null unique,
  created_by uuid references profiles(id) on delete set null,
  is_official boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reading_path_books (
  id uuid primary key default gen_random_uuid(),
  reading_path_id uuid not null references reading_paths(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  order_index integer not null,
  note text,
  unique (reading_path_id, book_id),
  unique (reading_path_id, order_index)
);

create table if not exists editorial_picks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  target_type text not null check (target_type in ('discussion_post','book','reading_path')),
  target_id uuid not null,
  week_start date not null,
  order_index integer not null,
  created_at timestamptz not null default now(),
  unique (week_start, order_index)
);

create index if not exists saved_insights_user_idx on saved_insights(user_id, created_at desc);
create index if not exists saved_insights_post_idx on saved_insights(discussion_post_id, created_at desc);
create index if not exists followed_discussions_user_idx on followed_discussions(user_id, created_at desc);
create index if not exists followed_discussions_post_idx on followed_discussions(discussion_post_id, created_at desc);
create index if not exists post_awards_post_idx on post_awards(discussion_post_id, award_type);
create index if not exists post_awards_user_idx on post_awards(user_id, created_at desc);
create index if not exists reading_path_books_path_idx on reading_path_books(reading_path_id, order_index);
create index if not exists editorial_picks_week_idx on editorial_picks(week_start desc, order_index);

alter table saved_insights enable row level security;
alter table followed_discussions enable row level security;
alter table post_awards enable row level security;
alter table reading_paths enable row level security;
alter table reading_path_books enable row level security;
alter table editorial_picks enable row level security;

drop policy if exists "Saved insights are readable" on saved_insights;
drop policy if exists "Users insert own saved insights" on saved_insights;
drop policy if exists "Users delete own saved insights" on saved_insights;
drop policy if exists "Followed discussions are readable" on followed_discussions;
drop policy if exists "Users insert own followed discussions" on followed_discussions;
drop policy if exists "Users delete own followed discussions" on followed_discussions;
drop policy if exists "Post awards are readable" on post_awards;
drop policy if exists "Users insert own post awards" on post_awards;
drop policy if exists "Users delete own post awards" on post_awards;
drop policy if exists "Reading paths are readable" on reading_paths;
drop policy if exists "Reading path books are readable" on reading_path_books;
drop policy if exists "Editorial picks are readable" on editorial_picks;

create policy "Saved insights are readable" on saved_insights for select using (true);
create policy "Users insert own saved insights" on saved_insights
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own saved insights" on saved_insights
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Followed discussions are readable" on followed_discussions for select using (true);
create policy "Users insert own followed discussions" on followed_discussions
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own followed discussions" on followed_discussions
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Post awards are readable" on post_awards for select using (true);
create policy "Users insert own post awards" on post_awards
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own post awards" on post_awards
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Reading paths are readable" on reading_paths for select using (true);
create policy "Reading path books are readable" on reading_path_books for select using (true);
create policy "Editorial picks are readable" on editorial_picks for select using (true);
