-- Records which book-page prompt a perspective was written from, so a prompt that has
-- been answered can make way for a different angle for the next reader.
-- Nullable: most perspectives are written without a prompt, and older rows have none.

alter table public.discussion_posts
  add column if not exists starter_prompt_id text;

alter table public.discussion_posts
  drop constraint if exists discussion_posts_starter_prompt_id_format;

-- <book slug>:<angle><n>, e.g. atomic-habits:use1. Bounded so the column cannot be used to
-- store arbitrary text.
alter table public.discussion_posts
  add constraint discussion_posts_starter_prompt_id_format
  check (
    starter_prompt_id is null
    or (char_length(starter_prompt_id) <= 120
        and starter_prompt_id ~ '^[a-z0-9-]+:(use|see|ask|argue|link)[0-9]$')
  );

create index if not exists discussion_posts_book_starter_prompt_idx
  on public.discussion_posts (book_id, starter_prompt_id)
  where starter_prompt_id is not null;
