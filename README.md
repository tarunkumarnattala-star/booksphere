# BookSphere

BookSphere is a premium MVP for a book-centered knowledge network: Reddit-style discussions for books and ideas, Apple-style discovery, editorial reading paths, saved insights, contributor following, and community usefulness signals.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. If that port is busy, Next will print the available local URL.

For production preview:

```bash
npm run build
npm run start -- -H 127.0.0.1 -p 3001
```

If a stale local `.next` lock blocks a build in the Codex sandbox, use the temporary build directory supported by `next.config.ts`:

```bash
NEXT_DIST_DIR=.next-build-check npm run build
NEXT_DIST_DIR=.next-build-check npm run start -- -H 127.0.0.1 -p 3006
```

## Environment Variables

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_APP_NAME=BookSphere
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

The application does not require a Supabase service-role key. Do not add one to the web deployment.

Production community features require:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains supported)

If Supabase is not configured in production, community write actions are disabled and users see “Community publishing is temporarily unavailable.” Local demo persistence is only allowed during development.

## Book Cover Fetching

Book covers are handled by [covers.ts](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/src/lib/covers.ts) and [route.ts](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/src/app/api/book-cover/route.ts).

Priority:

1. Use `cover_url` from seed data or Supabase.
2. Try Google Books API using ISBN or title/author.
3. Try Open Library Covers API using ISBN.
4. Try Open Library search as a fallback.
5. Show a quiet premium loading placeholder if no cover is available.

The cover resolver is intentionally read-only. Curated cover URLs should be added through reviewed seed data or an authenticated administrative workflow, never a public API request.

## Updating Seed Books

Local MVP seed data lives in [data.ts](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/src/lib/data.ts).

Supabase seed data lives in [seed.sql](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/supabase/seed.sql).

For each book, keep:

- `title`
- `author`
- `genre`
- `description`
- `isbn` when available
- `cover_url` when available
- `why_it_matters`
- `discussion_count`
- `insight_count`
- editorial flags such as `is_editors_pick`, `is_beginner_essential`, `is_hidden_gem`, and `is_trending_seed`

## Community Discovery Model

BookSphere is discussion-first, not ratings-first. The homepage now starts with what thoughtful readers are discussing today. Discovery surfaces are based on curation, usefulness, saves, comments, awards, and recency:

- Editor’s Picks
- Trending Discussions
- Five Discussions Worth Reading
- Reading Paths
- Most Discussed
- Most Saved
- Most Recommended
- Beginner Essentials
- Hidden Gems
- Recently Added

The app-level ranking helpers live in [data.ts](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/src/lib/data.ts):

- `getEditorsPicks(genre?)`
- `getTrendingDiscussions(genre?)`
- `getMostDiscussed(genre?)`
- `getMostSaved(genre?)`
- `getMostRecommended(genre?)`
- `getBeginnerEssentials(genre?)`
- `getHiddenGems(genre?)`
- `getRecentlyAdded(genre?)`
- `sortDiscussions(posts, sort)`
- `getTrendingDiscussionPosts()`
- `getEditorialDiscussionPicks()`
- `getReadingPathsForGenre(genre)`
- `getOftenReadNext(bookId)`

Discussion sorting supports `Hot`, `New`, `Rising`, `Top Today`, `Top Week`, `Top Month`, `Top All Time`, and `Controversial`. Canonical structured contributions use `discussion_posts`; Supabase-backed likes, comments, saved insights, followed discussions, and usefulness reactions are used when Supabase is configured. Development without Supabase may use clearly local demo persistence.

## New Community Tables

The Reddit-inspired MVP layer adds these Supabase tables in [20260701000000_reddit_community_features.sql](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/supabase/migrations/20260701000000_reddit_community_features.sql):

- `saved_insights`
- `followed_discussions`
- `post_awards`
- `reading_paths`
- `reading_path_books`
- `editorial_picks`

RLS rules allow public reads for public content and allow authenticated users to create/delete only their own saves, follows, and awards. Official reading paths and editorial picks are read-only from the public client.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` once on a new project to create the base schema.
3. Apply every migration in `supabase/migrations` in timestamp order. The final launch hardening migration makes Data API grants explicit, protects private saved activity, and adds database rate limits.
4. Run [seed.sql](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/supabase/seed.sql).
5. Enable Google Auth in Supabase.
6. Add email magic-link auth in Supabase Auth settings.
7. Add local and production redirect URLs:
   - `http://127.0.0.1:3020/explore`
   - `https://your-domain.com/explore`
8. Add the environment variables above in the hosting platform.

## Launch Checklist

Use this before sharing the MVP publicly.

### Environment

- `NEXT_PUBLIC_APP_NAME` is set to the launch name.
- `NEXT_PUBLIC_APP_URL` is the final HTTPS production origin.
- `NEXT_PUBLIC_SUPPORT_EMAIL` is a monitored address on a verified domain.
- `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local` and Vercel.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set in `.env.local` and the hosting platform.
- No service-role key is present in the web deployment.

### Supabase

- Run `supabase/schema.sql`, then apply all files in `supabase/migrations` to the production project.
- Run [seed.sql](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/supabase/seed.sql) after schema creation.
- Confirm RLS is enabled on every public table.
- Confirm public users can read books, genres, profiles, discussions, and knowledge posts.
- Confirm signed-in users can save books, save insights, follow discussions, award posts, recommend books, follow readers, report content, and create their own posts.
- Confirm users cannot edit or delete another user’s content.
- Confirm saved books, saved insights, followed discussions, reader status, reports, and analytics cannot be read by another account.
- Enable Google login.
- Enable email magic-link login.
- Add the Vercel production URL and local URL to Auth redirect settings.

### Seed Data

- Keep starter accounts clearly labeled as `BookSphere Team`, `Community Starter`, or another transparent internal account.
- Do not add fake real-person accounts.
- Do not add copyrighted book excerpts.
- Keep book descriptions original and short.
- Mark editorial shelves with the fields in the `books` table:
  - `is_editors_pick`
  - `editors_pick_order`
  - `is_beginner_essential`
  - `beginner_order`
  - `is_hidden_gem`
  - `hidden_gem_order`
  - `is_trending_seed`
  - `trending_seed_order`

### Local QA

```bash
npm install
npm run audit:content
npm run audit:launch
npm run typecheck
npm run lint
NEXT_DIST_DIR=.next-launch-check npm run build
NEXT_DIST_DIR=.next-launch-check npm run start -- -H 127.0.0.1 -p 3006
```

Check these routes:

- `/explore`
- `/genres`
- `/genre/business`
- `/book/the-psychology-of-money`
- `/book/the-psychology-of-money/create-discussion`
- `/search?q=investment`
- `/search?q=geners`
- `/feed`
- `/saved`
- `/path/startups-101`
- `/create`
- `/profile/booksphere-team`
- `/login`
- `/settings`
- `/privacy`
- `/terms`
- `/api/health` returns HTTP 200 and `status: healthy`

### Test Account Setup

- Create one Google-login test account.
- Create one email magic-link test account.
- Confirm both accounts create a profile row automatically.
- Save and unsave a book.
- Save and unsave an insight.
- Follow and unfollow a discussion.
- Award a discussion post.
- Recommend and change to `Not for me`.
- Follow and unfollow a contributor.
- Create a discussion post with a useful title and body.
- Try creating an empty post and confirm the app blocks it gracefully.

### Vercel Deployment

- Connect the repository to Vercel.
- Add the environment variables listed above.
- Use the default build command: `npm run build`.
- Use the default start behavior for Next.js.
- Confirm the deployed URL is added to Supabase Auth redirect URLs.
- Open the deployed `/explore`, `/search?q=investment`, and `/book/the-psychology-of-money` pages after deployment.


### Beta Preview Mode

When Supabase is not configured, BookSphere supports a local beta account so testers can still exercise the core loop on one device:

- email login creates a local test account
- save book, recommend book, save insight, follow discussion, awards, comments, reports, and locally-created insights persist in browser storage
- locally-created insights appear at the top of the related book page and can be deleted by the local user

This is for QA and early demos only. Production disables this fallback and requires Supabase-backed identity and persistence.

### Known MVP Limitations

- Browsing currently uses local seeded data for fast MVP discovery.
- Community actions use Supabase in production and local browser persistence only in development preview mode.
- Reports are stored securely, but moderation is handled through Supabase until an admin dashboard is built.
- There are no notifications, DMs, payments, AI summaries, or voice features by design.

### Future Improvements

- Move discovery shelves from local seed data to Supabase queries.
- Add analytics events for new users, posts, comments, likes, active books, active genres, and returning users.
- Add a lightweight moderation queue for reports.
- Add better personalized recommendations after real engagement data exists.

## Main Routes

- `/` and `/explore`
- `/genre/[slug]`
- `/book/[id]`
- `/book/[id]/create-discussion`
- `/search`
- `/feed`
- `/saved`
- `/path/[slug]`
- `/create`
- `/profile/[username]`
- `/settings`
- `/login`

## Design Direction

The UI is built around:

- Editorial-first discovery
- Horizontal scroll shelves
- Large book covers
- Massive whitespace
- Apple-style typography hierarchy
- Minimal borders and invisible UI chrome
- Soft rounded cards
- Clean white/off-white backgrounds
- Mobile bottom navigation

Design tokens live in [globals.css](/Users/mrtee/Documents/Codex/2026-06-29/you-are-a-senior-full-stack/src/app/globals.css): typography scale, color system, spacing rhythm, radius, shadow, and motion tokens.
