create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  username text not null unique,
  avatar_url text,
  bio text default '',
  created_at timestamptz not null default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text not null,
  isbn text,
  cover_url text,
  published_year integer,
  why_matters text default '',
  why_it_matters text default '',
  discussion_count integer not null default 0,
  insight_count integer not null default 0,
  readers_count integer not null default 0,
  is_editors_pick boolean not null default false,
  editors_pick_order integer,
  is_beginner_essential boolean not null default false,
  beginner_order integer,
  is_hidden_gem boolean not null default false,
  hidden_gem_order integer,
  is_trending_seed boolean not null default false,
  trending_seed_order integer,
  created_at timestamptz not null default now()
);

create unique index if not exists books_title_author_unique on books (lower(title), lower(author));

create table if not exists genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists book_genres (
  book_id uuid not null references books(id) on delete cascade,
  genre_id uuid not null references genres(id) on delete cascade,
  primary key (book_id, genre_id)
);

create table if not exists discussion_posts (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  post_type text not null check (post_type in ('Insight','Question','Application','Disagreement','Quote','Summary','Personal Experience')),
  title text not null check (char_length(trim(title)) >= 4),
  body text not null check (char_length(trim(body)) >= 20),
  quote_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists discussion_comments (
  id uuid primary key default gen_random_uuid(),
  discussion_post_id uuid references discussion_posts(id) on delete cascade,
  parent_comment_id uuid references discussion_comments(id) on delete set null,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) >= 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists knowledge_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 4),
  body text not null check (char_length(trim(body)) >= 20),
  topic text,
  created_at timestamptz not null default now()
);

alter table discussion_comments
  add column if not exists knowledge_post_id uuid references knowledge_posts(id) on delete cascade;

alter table discussion_comments
  drop constraint if exists discussion_comments_single_parent_target;
alter table discussion_comments
  add constraint discussion_comments_single_parent_target check (
    num_nonnulls(discussion_post_id, knowledge_post_id) = 1
  );

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('discussion_post','discussion_comment','knowledge_post')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists saved_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists book_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  recommended boolean not null,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (follower_id <> following_id),
  unique (follower_id, following_id)
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null
);

create table if not exists user_badges (
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  primary key (user_id, badge_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('discussion_post','discussion_comment','knowledge_post','profile')),
  target_id uuid not null,
  reason text not null check (char_length(trim(reason)) >= 3),
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  event_name text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists books_title_author_idx on books using gin (to_tsvector('english', title || ' ' || author || ' ' || description));
create index if not exists books_counts_idx on books(discussion_count desc, insight_count desc);
create index if not exists books_editorial_idx on books(is_editors_pick, editors_pick_order);
create index if not exists books_beginner_idx on books(is_beginner_essential, beginner_order);
create index if not exists books_hidden_gems_idx on books(is_hidden_gem, hidden_gem_order);
create index if not exists books_trending_seed_idx on books(is_trending_seed, trending_seed_order);
create index if not exists discussion_posts_book_idx on discussion_posts(book_id, created_at desc);
create index if not exists discussion_comments_post_idx on discussion_comments(discussion_post_id, created_at desc);
create index if not exists discussion_comments_parent_idx on discussion_comments(parent_comment_id, created_at asc);
create index if not exists discussion_comments_knowledge_post_idx on discussion_comments(knowledge_post_id, created_at desc);
create index if not exists knowledge_posts_user_idx on knowledge_posts(user_id, created_at desc);
create index if not exists likes_target_idx on likes(target_type, target_id);
create index if not exists saved_books_book_idx on saved_books(book_id, created_at desc);
create index if not exists saved_books_user_idx on saved_books(user_id, created_at desc);
create index if not exists book_recommendations_book_idx on book_recommendations(book_id, recommended);
create index if not exists book_recommendations_user_idx on book_recommendations(user_id, created_at desc);
create index if not exists follows_follower_idx on follows(follower_id);
create index if not exists analytics_events_name_idx on analytics_events(event_name, created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists discussion_posts_set_updated_at on discussion_posts;
create trigger discussion_posts_set_updated_at
before update on discussion_posts
for each row execute function set_updated_at();

create or replace function create_profile_for_auth_user()
returns trigger as $$
begin
  insert into public.profiles (auth_user_id, name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Reader'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1), 'reader'), '[^a-zA-Z0-9_]+', '-', 'g')) || '-' || left(replace(new.id::text, '-', ''), 6),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function create_profile_for_auth_user();

alter table profiles enable row level security;
alter table books enable row level security;
alter table genres enable row level security;
alter table book_genres enable row level security;
alter table discussion_posts enable row level security;
alter table discussion_comments enable row level security;
alter table knowledge_posts enable row level security;
alter table likes enable row level security;
alter table saved_books enable row level security;
alter table book_recommendations enable row level security;
alter table follows enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table reports enable row level security;
alter table analytics_events enable row level security;

drop policy if exists "Public profiles are readable" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Books are readable" on books;
drop policy if exists "Genres are readable" on genres;
drop policy if exists "Book genres are readable" on book_genres;
drop policy if exists "Badges are readable" on badges;
drop policy if exists "User badges are readable" on user_badges;
drop policy if exists "Discussions are readable" on discussion_posts;
drop policy if exists "Comments are readable" on discussion_comments;
drop policy if exists "Knowledge posts are readable" on knowledge_posts;
drop policy if exists "Authenticated users create discussions" on discussion_posts;
drop policy if exists "Users update own discussions" on discussion_posts;
drop policy if exists "Users delete own discussions" on discussion_posts;
drop policy if exists "Authenticated users create comments" on discussion_comments;
drop policy if exists "Users update own comments" on discussion_comments;
drop policy if exists "Users delete own comments" on discussion_comments;
drop policy if exists "Authenticated users create knowledge posts" on knowledge_posts;
drop policy if exists "Users update own knowledge posts" on knowledge_posts;
drop policy if exists "Users delete own knowledge posts" on knowledge_posts;
drop policy if exists "Likes are readable" on likes;
drop policy if exists "Users manage own likes" on likes;
drop policy if exists "Users insert own likes" on likes;
drop policy if exists "Users update own likes" on likes;
drop policy if exists "Users delete own likes" on likes;
drop policy if exists "Saved books are readable" on saved_books;
drop policy if exists "Users read own saved books" on saved_books;
drop policy if exists "Users insert own saved books" on saved_books;
drop policy if exists "Users delete own saved books" on saved_books;
drop policy if exists "Book recommendations are readable" on book_recommendations;
drop policy if exists "Users insert own book recommendations" on book_recommendations;
drop policy if exists "Users update own book recommendations" on book_recommendations;
drop policy if exists "Users delete own book recommendations" on book_recommendations;
drop policy if exists "Follows are readable" on follows;
drop policy if exists "Users manage own follows" on follows;
drop policy if exists "Users insert own follows" on follows;
drop policy if exists "Users update own follows" on follows;
drop policy if exists "Users delete own follows" on follows;
drop policy if exists "Authenticated users create reports" on reports;
drop policy if exists "Users create analytics events" on analytics_events;

create policy "Public profiles are readable" on profiles for select using (true);
create policy "Users can update own profile" on profiles
for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

create policy "Books are readable" on books for select using (true);
create policy "Genres are readable" on genres for select using (true);
create policy "Book genres are readable" on book_genres for select using (true);
create policy "Badges are readable" on badges for select using (true);
create policy "User badges are readable" on user_badges for select using (true);
create policy "Discussions are readable" on discussion_posts for select using (true);
create policy "Comments are readable" on discussion_comments for select using (
  exists (select 1 from discussion_posts post where post.id = discussion_comments.discussion_post_id)
  or exists (select 1 from knowledge_posts post where post.id = discussion_comments.knowledge_post_id)
);
create policy "Knowledge posts are readable" on knowledge_posts for select using (true);

create policy "Authenticated users create discussions" on discussion_posts
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own discussions" on discussion_posts
for update to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())))
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own discussions" on discussion_posts
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Authenticated users create comments" on discussion_comments
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own comments" on discussion_comments
for update to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())))
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own comments" on discussion_comments
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Authenticated users create knowledge posts" on knowledge_posts
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own knowledge posts" on knowledge_posts
for update to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())))
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own knowledge posts" on knowledge_posts
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Likes are readable" on likes for select using (true);
create policy "Users insert own likes" on likes
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own likes" on likes
for update to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())))
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own likes" on likes
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Users read own saved books" on saved_books
for select to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users insert own saved books" on saved_books
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own saved books" on saved_books
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Book recommendations are readable" on book_recommendations for select using (true);
create policy "Users insert own book recommendations" on book_recommendations
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own book recommendations" on book_recommendations
for update to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())))
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own book recommendations" on book_recommendations
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Follows are readable" on follows for select using (true);
create policy "Users insert own follows" on follows
for insert to authenticated
with check (follower_id <> following_id and exists (select 1 from profiles p where p.id = follower_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own follows" on follows
for update to authenticated
using (exists (select 1 from profiles p where p.id = follower_id and p.auth_user_id = (select auth.uid())))
with check (follower_id <> following_id and exists (select 1 from profiles p where p.id = follower_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own follows" on follows
for delete to authenticated
using (exists (select 1 from profiles p where p.id = follower_id and p.auth_user_id = (select auth.uid())));

create policy "Authenticated users create reports" on reports
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = reporter_id and p.auth_user_id = (select auth.uid())));
create policy "Users create analytics events" on analytics_events
for insert to authenticated
with check (user_id is null or exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));


-- Reddit-inspired community MVP features
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
drop policy if exists "Users read own saved insights" on saved_insights;
drop policy if exists "Users insert own saved insights" on saved_insights;
drop policy if exists "Users delete own saved insights" on saved_insights;
drop policy if exists "Followed discussions are readable" on followed_discussions;
drop policy if exists "Users read own followed discussions" on followed_discussions;
drop policy if exists "Users insert own followed discussions" on followed_discussions;
drop policy if exists "Users delete own followed discussions" on followed_discussions;
drop policy if exists "Post awards are readable" on post_awards;
drop policy if exists "Users insert own post awards" on post_awards;
drop policy if exists "Users delete own post awards" on post_awards;
drop policy if exists "Reading paths are readable" on reading_paths;
drop policy if exists "Reading path books are readable" on reading_path_books;
drop policy if exists "Editorial picks are readable" on editorial_picks;

create policy "Users read own saved insights" on saved_insights
for select to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users insert own saved insights" on saved_insights
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own saved insights" on saved_insights
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Users read own followed discussions" on followed_discussions
for select to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
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
