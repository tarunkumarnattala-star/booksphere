# BookSphere Launch Gate

This is the frozen-product checklist. Do not add major features until every blocker here is resolved.

Last QA pass: August 6, 2026.

Production: <https://booksphere-iota.vercel.app> — public, `/api/health` returns `200 healthy` with `database: reachable`.

## How to read this document

Every row is marked with how it was checked, because "it works" and "someone watched it work" are different claims:

- **VERIFIED** — exercised against the live app or production database, with the result recorded.
- **CODE ONLY** — the implementation is present and typechecks, but no one has run it end to end.
- **NOT CHECKED** — genuinely untested.

The single largest gap is that **no write path has been exercised while signed in**. Everything under "Community writes" is CODE ONLY for that reason. See [Blockers](#final-public-launch-blockers).

A caution learned the hard way: this app reports success optimistically. Buttons flip state, counters move, and "Published to your feed" appears whether or not anything reached the database. Do not mark a row VERIFIED from the UI alone — check the table.

## Core Journey

| Step | Status | How it was checked |
| --- | --- | --- |
| Visit BookSphere | VERIFIED | `/` renders the landing page. It no longer redirects to `/explore` — both calls to action point at `/login?next=/explore`, so first-time visitors enter through beta signup. This gating is intentional; see Settled Decisions. |
| Understand value in 5 seconds | VERIFIED | Landing hero states the product in one line, followed by eight sections of real copy. No placeholder text. |
| Browse books | VERIFIED | Explore, genre shelves, search, and reading paths all render from seed data. All 16 main routes return 200 in production. |
| Open a book | VERIFIED | Book pages render cover, metadata, community signal, sorting, comments, actions, and the read-next shelf. |
| Read discussion | VERIFIED | 51 discussion posts render, including 20 editorial posts across 20 books. Those are Insight, Question and Disagreement only, attributed to BookSphere Team; none is written as personal experience, because inventing reader outcomes would break the no-fake-users commitment below. |
| Create account | VERIFIED | Fixed and proven on August 5. Signup previously returned 500 for any email whose local part exceeded 23 characters: the profile trigger generated usernames over the 30-character cap in `profiles_launch_content_length`, aborting the whole `auth.users` insert. Broken since July 15. After applying `20260805000000_fix_signup_username_length.sql`, a probe signup with a 33-character local part succeeded and produced a valid profile (`booksphere-qa-probe-tri-a71c6f`, exactly 30 characters, full name preserved). Google remains hidden (provider disabled). |
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
| Seed data loaded | VERIFIED | 394 books, 7 profiles, 51 discussions, 22 awards, 5 reading paths, 5 editorial picks. The catalog was narrowed to 25 books on August 6 and reversed the same day: a reader who searches for a book and finds nothing is a dead end, which is worse than an empty discussion page. |
| Public reads work | VERIFIED | `books`, `profiles`, `discussion_posts`, `knowledge_posts`, `reading_paths`, `editorial_picks` all readable anonymously. |
| Private tables protected | VERIFIED | `saved_books`, `saved_insights`, and `followed_discussions` return 401 to anonymous callers. RLS is doing its job. |
| Seed catalog resolves to database rows | VERIFIED | Catalog and database now join on an explicit `slug` column rather than matching title and author strings. All 391 catalog books have a database row, so every browsable book can host community content. |
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
| Missing pages return 404 | VERIFIED | Book, genre, reading-path and composer routes declare `dynamicParams = false`, so an unknown slug is a real 404 rather than the not-found screen served with HTTP 200, which a crawler would index as a valid page. `/profile` and `/post` stay dynamic because real users and posts are created at runtime. |
| No console errors | VERIFIED | Landing, Explore, book, and reading-path pages are clean, including a full walk of the onboarding tour across four route changes. |
| Onboarding tour hydration | VERIFIED | Fixed in `acee6a9`. The tour marked its highlight target directly, which raced hydration; the marker now lives on `<html>`. |
| Valid HTML on reading paths | VERIFIED | Fixed in `2f98de5`. Genre pills nested an `<a>` inside the card's `<a>`. Confirmed in the production HTML: 0 nested anchors, 5 card links intact. |
| Production build | VERIFIED | Exit 0, 833 static pages. Sitemap covers 426 URLs. |
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

1. **Verify a sending domain in Resend.** Resend SMTP is configured (August 4), which fixed the built-in email service silently dropping magic links on August 3. But until a domain is verified, Resend delivers **only to the account owner's own address** — the first invited beta reader's sign-in link will bounce. Verifying a domain (DNS records, ~30 minutes once a domain exists) is what actually opens sign-in to other people. It also resolves the `booksphere.vercel.app` name collision that already misdirected one QA pass.
2. **Sign in once and exercise the write paths.** This is the one blocker that cannot be cleared by reading code. Create a post, comment, like, save a book, save an insight, and follow a contributor. Confirm each survives a page refresh, then confirm it appears from a second device or browser. Until this is done, every row marked CODE ONLY above is an assumption.
3. **Run real auth QA.** Email magic-link, creating a profile row automatically. The Google button is now hidden behind `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` (default off) because the provider is disabled in Supabase — a visible dead button failed for every user who tried it. To offer Google later: enable the provider in Supabase Auth, set the flag to `true` in Vercel, redeploy, then QA it.
4. **Apply the moderation migration.** `/admin/reports` exists but reads nothing until `supabase/migrations/20260804000000_moderator_reports_access.sql` is run in the SQL editor and `is_moderator` is set to true on the operator's profile row. Until then reports remain write-only.
5. **Confirm ownership rules with two accounts.** One account must not be able to edit or delete another's content, and must not be able to read another's saved books, saved insights, or followed discussions.
6. **Test on a real phone.** A 375px viewport is not a handset; it says nothing about touch targets, iOS Safari, or scroll behaviour.
7. **Add production analytics review.** No dashboard or event review exists yet.

## Settled Decisions

**The landing page stays gated.** Decided August 3, 2026.

`/` funnels every visitor to `/login?next=/explore`. Explore stays reachable by direct URL but is deliberately not discoverable from the homepage. This is the intended shape for the closed beta and should not be "fixed" — if the homepage ever renders Explore again, that is a regression, not an improvement.

Revisit this once the private beta closes. A gated homepage costs organic discovery and search indexing, so it is the right trade only while the goal is a controlled group of invited readers rather than growth.

## Known Limitations

- Browsing uses local seed data for speed; the database backs community features rather than discovery.
- Reports are stored and reviewable at `/admin/reports` by moderator accounts, once the moderator migration is applied. Actioning a report (removing content, contacting a user) is still manual.
- There are no notifications, direct messages, payments, AI summaries, or voice features, by design.

## Launch Recommendation

**Private beta:** not yet. Blockers 1 and 2 must be cleared first — sign-in does not currently work, so no community feature has ever been exercised by a real account. Everything else on the list is either verified or acceptable for a small invited group.

**Public launch:** not yet. Blockers 1 through 6 all need to be cleared first, and the gated homepage recorded under Settled Decisions needs revisiting — it is right for an invited beta and wrong for open discovery.
