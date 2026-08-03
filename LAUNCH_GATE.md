# BookSphere Launch Gate

This is the frozen-product checklist. Do not add major features until every blocker here is resolved.

Last QA pass: August 3, 2026.

Production: <https://booksphere-iota.vercel.app> — public, `/api/health` returns `200 healthy` with `database: reachable`.

## How to read this document

Every row is marked with how it was checked, because "it works" and "someone watched it work" are different claims:

- **VERIFIED** — exercised against the live app or production database, with the result recorded.
- **CODE ONLY** — the implementation is present and typechecks, but no one has run it end to end.
- **NOT CHECKED** — genuinely untested.

The single largest gap is that **no write path has been exercised while signed in**. Everything under "Community writes" is CODE ONLY for that reason. See [Blockers](#final-public-launch-blockers).

## Core Journey

| Step | Status | How it was checked |
| --- | --- | --- |
| Visit BookSphere | VERIFIED | `/` renders the landing page. It no longer redirects to `/explore` — both calls to action point at `/login?next=/explore`, so first-time visitors enter through beta signup. This gating is intentional; see Settled Decisions. |
| Understand value in 5 seconds | VERIFIED | Landing hero states the product in one line, followed by eight sections of real copy. No placeholder text. |
| Browse books | VERIFIED | Explore, genre shelves, search, and reading paths all render from seed data. All 16 main routes return 200 in production. |
| Open a book | VERIFIED | Book pages render cover, metadata, community signal, sorting, comments, actions, and the read-next shelf. |
| Read discussion | VERIFIED | 30 discussion posts exist in the production database and render. |
| Create account | NOT CHECKED | Google and email magic-link flows have never been run against production. |
| Post insight | CODE ONLY | Writes to `discussion_posts` via `createSupabaseContribution`. Never executed while authenticated. |
| Get engagement | CODE ONLY | Likes, saves, follows, awards, reports, and comments all write to Supabase. Never executed while authenticated. |
| Return tomorrow | NOT CHECKED | Requires a signed-in session persisted across devices. |

## Community Writes

Every action below is wired to Supabase. `localStorage` is used **only** as a development fallback, gated behind `canUseLocalCommunityFallback()`, which is false whenever Supabase is configured.

| Action | Destination | Implementation | Status |
| --- | --- | --- | --- |
| Create discussion | `discussion_posts` | `createSupabaseContribution` | CODE ONLY |
| Comment, edit, delete | `discussion_comments` | `createSupabaseComment` and siblings | CODE ONLY |
| Like | `likes` | `toggleSupabaseLike` | CODE ONLY |
| Save insight | `saved_insights` | `toggleSupabaseSaveInsight` | CODE ONLY |
| Follow discussion | `followed_discussions` | `toggleSupabaseFollowDiscussion` | CODE ONLY |
| Award a post | `post_awards` | upsert in `post-actions.tsx` | CODE ONLY |
| Report content | `reports` | upsert in `post-actions.tsx` | CODE ONLY |
| Save book, recommend | `saved_books`, `book_recommendations` | `book-community-actions.tsx` | CODE ONLY |
| Knowledge post CRUD | `knowledge_posts` | `knowledge-posts.ts` | CODE ONLY |

## Database

| Item | Status | Notes |
| --- | --- | --- |
| Schema and migrations applied | VERIFIED | All 14 migrations present; tables respond. |
| Seed data loaded | VERIFIED | 226 books, 6 profiles, 30 discussions, 22 awards, 5 reading paths, 5 editorial picks. |
| Public reads work | VERIFIED | `books`, `profiles`, `discussion_posts`, `knowledge_posts`, `reading_paths`, `editorial_picks` all readable anonymously. |
| Private tables protected | VERIFIED | `saved_books`, `saved_insights`, and `followed_discussions` return 401 to anonymous callers. RLS is doing its job. |
| Seed catalog resolves to database rows | VERIFIED | All 222 seed books resolve: 217 by exact title and author, 5 by the title-only fallback added in `e4b945d`. Zero unresolvable. |
| Users cannot edit another user's content | CODE ONLY | RLS policies exist; never tested with two real accounts. |

## Design

| Item | Status | Notes |
| --- | --- | --- |
| Desktop looks right | VERIFIED | Landing, Explore, book, and reading-path pages reviewed in-browser. |
| Mobile looks right | CODE ONLY | Checked at a 375px viewport with no horizontal overflow. **Not tested on a real handset.** |
| No layout breaks | VERIFIED | Build, types, and lint clean; no overflow at mobile or desktop widths. |
| No placeholder images | VERIFIED | All seed books use real Open Library cover URLs. |
| No lorem ipsum | VERIFIED | None present. |
| No fake real users | VERIFIED | Starter accounts are clearly labelled `BookSphere Team`, `Community Starter`, or `Reader Ops`. |
| No star ratings | VERIFIED | Discovery is by discussion, saves, recommendations, and curation, by design. |

## Correctness

| Item | Status | Notes |
| --- | --- | --- |
| No console errors | VERIFIED | Landing, Explore, book, and reading-path pages are clean, including a full walk of the onboarding tour across four route changes. |
| Onboarding tour hydration | VERIFIED | Fixed in `acee6a9`. The tour marked its highlight target directly, which raced hydration; the marker now lives on `<html>`. |
| Valid HTML on reading paths | VERIFIED | Fixed in `2f98de5`. Genre pills nested an `<a>` inside the card's `<a>`. Confirmed in the production HTML: 0 nested anchors, 5 card links intact. |
| Production build | VERIFIED | Exit 0, 493 static pages. |
| Types and lint | VERIFIED | `typecheck` and `lint` both exit 0 with no warnings. |
| Health endpoint | VERIFIED | Production returns `200 healthy`, `database: reachable`. |

## Environment

| Item | Status | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | VERIFIED | Set in Vercel. |
| `NEXT_PUBLIC_APP_URL` | VERIFIED | Set in Vercel Production. Must be the https origin; `audit:launch` rejects anything else. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | VERIFIED | `booksphere.support@gmail.com`, rendering as a mailto on `/privacy` and `/terms`. |
| `NEXT_PUBLIC_SUPABASE_URL` and key | VERIFIED | Corrected on 2026-08-03; the previous production values were stale and left the database unreachable. |
| No service-role key in the web deployment | VERIFIED | Only the publishable key is present, by design. |
| Preview environment | CODE ONLY | Supabase values were refreshed, but no preview deployment has been loaded to confirm. |

Remember that `NEXT_PUBLIC_*` variables are inlined at **build** time. Changing one in Vercel has no effect until the next deploy.

## Final Public Launch Blockers

1. **Sign in once and exercise the write paths.** This is the one blocker that cannot be cleared by reading code. Create a post, comment, like, save a book, save an insight, and follow a contributor. Confirm each survives a page refresh, then confirm it appears from a second device or browser. Until this is done, every row marked CODE ONLY above is an assumption.
2. **Run real auth QA.** Google login and email magic-link, each creating a profile row automatically.
3. **Confirm ownership rules with two accounts.** One account must not be able to edit or delete another's content, and must not be able to read another's saved books, saved insights, or followed discussions.
4. **Test on a real phone.** A 375px viewport is not a handset; it says nothing about touch targets, iOS Safari, or scroll behaviour.
5. **Add production analytics review.** No dashboard or event review exists yet.

## Settled Decisions

**The landing page stays gated.** Decided August 3, 2026.

`/` funnels every visitor to `/login?next=/explore`. Explore stays reachable by direct URL but is deliberately not discoverable from the homepage. This is the intended shape for the closed beta and should not be "fixed" — if the homepage ever renders Explore again, that is a regression, not an improvement.

Revisit this once the private beta closes. A gated homepage costs organic discovery and search indexing, so it is the right trade only while the goal is a controlled group of invited readers rather than growth.

## Known Limitations

- Browsing uses local seed data for speed; the database backs community features rather than discovery.
- Reports are stored, but moderation happens in the Supabase dashboard until an admin view exists.
- There are no notifications, direct messages, payments, AI summaries, or voice features, by design.

## Launch Recommendation

**Private beta:** yes, once blocker 1 is cleared. Everything else on the list is either verified or acceptable for a small invited group.

**Public launch:** not yet. Blockers 1 through 4 all need to be cleared first, and the gated homepage recorded under Settled Decisions needs revisiting — it is right for an invited beta and wrong for open discovery.
