create table if not exists book_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  title text not null,
  overview text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, order_index)
);

alter table discussion_posts drop constraint if exists discussion_posts_post_type_check;
alter table discussion_posts add constraint discussion_posts_post_type_check
check (post_type in ('Insight','Question','Application','Disagreement','Quote','Summary','Personal Experience','Connection','Real-Life Result','What Did Not Work','Limitation'));

create table if not exists book_concepts (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  chapter_id uuid references book_chapters(id) on delete set null,
  name text not null,
  explanation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, name)
);

create table if not exists book_ideas (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  title text not null,
  slug text not null,
  short_explanation text not null,
  full_explanation text not null default '',
  why_it_matters text not null default '',
  practical_example text not null default '',
  chapter_id uuid references book_chapters(id) on delete set null,
  concept_id uuid references book_concepts(id) on delete set null,
  source_type text not null default 'editorial' check (source_type in ('editorial','community','author_reference')),
  editorial_status text not null default 'draft' check (editorial_status in ('draft','published','archived')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, slug)
);

create table if not exists perspective_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  chapter_id uuid references book_chapters(id) on delete set null,
  concept_id uuid references book_concepts(id) on delete set null,
  perspective_type text not null check (perspective_type in ('insight','application','disagreement','summary','question','connection','real_life_result','did_not_work','limitation')),
  title text not null check (char_length(trim(title)) >= 4),
  body text not null check (char_length(trim(body)) >= 20),
  quote_reference text,
  connected_book_id uuid references books(id) on delete set null,
  context_type text,
  action_taken text,
  outcome text,
  what_failed text,
  would_change text,
  status text not null default 'published' check (status in ('draft','published','archived','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists useful_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('discussion_post','knowledge_post','perspective_post','book_idea')),
  target_id uuid not null,
  reaction_type text not null check (reaction_type in ('helped_understand','helped_apply','changed_thinking','strong_counterargument','best_summary','worth_full_read')),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id, reaction_type)
);

create table if not exists book_reader_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  status text not null default 'not_read' check (status in ('not_read','want_to_read','currently_reading','read')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists knowledge_connections (
  id uuid primary key default gen_random_uuid(),
  source_book_id uuid not null references books(id) on delete cascade,
  target_book_id uuid not null references books(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('expands_this_idea','challenges_this_idea','applies_this_idea','offers_stronger_evidence','better_for_beginners','better_for_advanced_readers','opposing_framework','practical_companion','historical_foundation')),
  explanation text not null,
  source_type text not null default 'editorial' check (source_type in ('editorial','community')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (source_book_id, target_book_id, relationship_type)
);

create table if not exists reading_progressions (
  id uuid primary key default gen_random_uuid(),
  source_book_id uuid not null references books(id) on delete cascade,
  next_book_id uuid not null references books(id) on delete cascade,
  explanation text not null,
  source_type text not null default 'editorial' check (source_type in ('editorial','behavioral')),
  created_at timestamptz not null default now(),
  unique (source_book_id, next_book_id, source_type)
);

create index if not exists book_chapters_book_idx on book_chapters(book_id, order_index);
create index if not exists book_concepts_book_idx on book_concepts(book_id, name);
create index if not exists book_ideas_book_idx on book_ideas(book_id, editorial_status);
create index if not exists perspective_posts_book_type_idx on perspective_posts(book_id, perspective_type, created_at desc);
create index if not exists perspective_posts_user_idx on perspective_posts(user_id, created_at desc);
create index if not exists perspective_posts_chapter_idx on perspective_posts(chapter_id, created_at desc);
create index if not exists perspective_posts_concept_idx on perspective_posts(concept_id, created_at desc);
create index if not exists useful_reactions_target_idx on useful_reactions(target_type, target_id, reaction_type);
create index if not exists book_reader_status_user_idx on book_reader_status(user_id, status);
create index if not exists knowledge_connections_source_idx on knowledge_connections(source_book_id, relationship_type);
create index if not exists reading_progressions_source_idx on reading_progressions(source_book_id);

alter table book_chapters enable row level security;
alter table book_concepts enable row level security;
alter table book_ideas enable row level security;
alter table perspective_posts enable row level security;
alter table useful_reactions enable row level security;
alter table book_reader_status enable row level security;
alter table knowledge_connections enable row level security;
alter table reading_progressions enable row level security;

create policy "Book chapters are readable" on book_chapters for select using (true);
create policy "Book concepts are readable" on book_concepts for select using (true);
create policy "Published book ideas are readable" on book_ideas for select using (editorial_status = 'published');
create policy "Published perspectives are readable" on perspective_posts for select using (status = 'published');
create policy "Useful reactions are readable" on useful_reactions for select using (true);
create policy "Knowledge connections are readable" on knowledge_connections for select using (true);
create policy "Reading progressions are readable" on reading_progressions for select using (true);

create policy "Users create own perspectives" on perspective_posts
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own perspectives" on perspective_posts
for update to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())))
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own perspectives" on perspective_posts
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Users insert own useful reactions" on useful_reactions
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own useful reactions" on useful_reactions
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));

create policy "Users read own book status" on book_reader_status
for select to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users insert own book status" on book_reader_status
for insert to authenticated
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users update own book status" on book_reader_status
for update to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())))
with check (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
create policy "Users delete own book status" on book_reader_status
for delete to authenticated
using (exists (select 1 from profiles p where p.id = user_id and p.auth_user_id = (select auth.uid())));
