# BookSphere Launch Gate

This is the frozen-product checklist. Do not add major features until every blocker here is resolved.

Last QA pass: August 6, 2026. Automated audit re-run clean at the end of that pass.

Production: <https://booksphere-iota.vercel.app> — public, `/api/health` returns `200 healthy` with `database: reachable`.

## How to read this document

Every row is marked with how it was checked, because "it works" and "someone watched it work" are different claims:

- **VERIFIED** — exercised against the live app or production database, with the result recorded.
- **CODE ONLY** — the implementation is present and typechecks, but no one has run it end to end.
- **NOT CHECKED** — genuinely untested.

The single largest gap is that **no write path has been exercised while signed in**. Everything under "Community writes" is CODE ONLY for that reason. See [Blockers](#final-public-launch-blockers).

A caution learned the hard way: this app reports success optimistically. Buttons flip state, counters move, and "Published to your feed" appears whether or not anything reached the database. Do not mark a row VERIFIED from the UI alone — check the table.

A second caution, about the tooling rather than the app. During the August 6 audit the headless browser produced four false alarms: a zero-width viewport made every page look blank and stuck on "Loading BookSphere", `document.body.innerText` under-reported so pages looked empty, synthetic input events did not update React state so search looked broken, and truncated image URLs made every cover look like a 400. Each was disproved by a second source — a screenshot, real keyboard input, the full URL. Confirm a failure two ways before recording it here.

## Core Journey

| Step | Status | How it was checked |
| --- | --- | --- |
| Visit BookSphere | VERIFIED | `/` renders the landing page. It no longer redirects to `/explore` — both calls to action point at `/login?next=/explore`, so first-time visitors enter through beta signup. This gating is intentional; see Settled Decisions. |
| Understand value in 5 seconds | VERIFIED | Landing hero states the product in one line, followed by eight sections of real copy. No placeholder text. |
| Browse books | VERIFIED | Explore, genre shelves, search, and reading paths all render from seed data. All 16 main routes return 200 in production. |
| Open a book | VERIFIED | Book pages render cover, metadata, community signal, sorting, comments, actions, and the read-next shelf. |
| Read discussion | VERIFIED | 51 discussion posts render, including 20 editorial posts across 20 books. Each has its own address at `/discussion/<id>` — all 51 verified reachable — with page metadata carrying the perspective's own title, so a shared link names the argument rather than the book it sits on. The book page still honours `?thread=` for in-page selection. Those are Insight, Question and Disagreement only, attributed to BookSphere Team; none is written as personal experience, because inventing reader outcomes would break the no-fake-users commitment below. |
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
| Schema and migrations applied | PARTLY VERIFIED | 19 migration files present. Four were applied and independently verified during the August 5-6 pass: the signup username fix, the slug join key, the catalog sync, and the moderation policies. The earlier fifteen were applied during setup and are assumed rather than re-checked — the tables and columns they define all respond. |
| Seed data loaded | VERIFIED | 394 books, 7 profiles, 51 discussions, 22 awards, 5 reading paths, 5 editorial picks. The catalog was narrowed to 25 books on August 6 and reversed the same day: a reader who searches for a book and finds nothing is a dead end, which is worse than an empty discussion page. |
| Public reads work | VERIFIED | `books`, `profiles`, `discussion_posts`, `knowledge_posts`, `reading_paths`, `editorial_picks` all readable anonymously. |
| Private tables protected | VERIFIED | `saved_books`, `saved_insights`, and `followed_discussions` return 401 to anonymous callers. RLS is doing its job. |
| Seed catalog resolves to database rows | VERIFIED | Catalog and database now join on an explicit `slug` column rather than matching title and author strings. All 394 catalog books have a database row (re-verified in the August 6 audit), so no book can be browsable yet unable to hold community content. |
| Moderation and analytics readable | VERIFIED | Confirmed August 6 by privilege check and by opening both pages while signed in as a moderator. `has_table_privilege` returns true for authenticated SELECT on `reports` and `analytics_events`, true for DELETE on `reports`, and **false** for anon SELECT — so the grant widened the door for signed-in roles without opening it to the public, and the moderator policy is what restricts rows. Anonymous callers are still refused on both tables across every query shape tried. Worth recording how this was got wrong first: it was marked VERIFIED on the evidence that anonymous callers get 401, but they were already refused before the policies existed. A check that would have passed before the change proves nothing about the change. |
| Users cannot edit another user's content | CODE ONLY | RLS policies exist; never tested with two real accounts. |

## Design

| Item | Status | Notes |
| --- | --- | --- |
| Desktop looks right | VERIFIED | Landing, Explore, book, and reading-path pages reviewed in-browser. |
| Mobile looks right | CODE ONLY | Explore, book, feed and genre pages checked at 375px in a headless browser: no horizontal overflow, no broken images, no nested anchors, bottom nav intact. **Still not tested on a real handset**, so this says nothing about iOS Safari, touch targets under a thumb, or scroll feel. |
| No layout breaks | VERIFIED | Build, types, and lint clean; no overflow at mobile or desktop widths. |
| No placeholder images | VERIFIED | All seed books use real Open Library cover URLs. |
| No lorem ipsum | VERIFIED | None present. |
| No fake real users | VERIFIED | Starter accounts are clearly labelled `BookSphere Team`, `Community Starter`, or `Reader Ops`. |
| No star ratings | VERIFIED | Discovery is by discussion, saves, recommendations, and curation, by design. |

## Correctness

Roughly 1,400 automated assertions against production, re-run clean at the end of the August 6 pass:

| Audit | Scope | Result |
| --- | --- | --- |
| Routes | All 426 sitemap URLs (394 books, 20 genres, 5 paths, 7 static) plus 404 and auth-route checks — 436 assertions. Each page checked for status, complete HTML, and no `undefined`, `NaN` or `[object Object]` reaching the reader. | 0 failures, 0 responses over 4s |
| Internal links | Every link on every page: 882 distinct targets across 431 pages, re-crawled after discussion links were retargeted to permalinks | 0 broken, 0 empty-text |
| Cover images | 66 resolved end-to-end through the image optimiser; all 394 book pages carry a cover | 0 failures |
| Data integrity | Every catalog book has a database row, so no book can be browsable yet unable to hold community content | 394 of 394 |
| Health | `/api/health` | 200 healthy, database reachable |

Link crawling is the check worth keeping. It is the only one that found the uuid-link bug in `7aa48e9`: four book pages returned 200 and rendered perfectly while carrying a link to `/book/<uuid>` that 404'd. Sampling pages would never have surfaced it — the break was inside otherwise healthy pages.

| Item | Status | Notes |
| --- | --- | --- |
| Missing pages return 404 | VERIFIED | Unknown book, genre, reading-path and composer slugs all answer 404 (4 of 4 re-checked). Reading paths were fixed by `dynamicParams = false`, but that only gates prerendered routes: books and genres await Supabase, so they render dynamically and kept answering HTTP 200 with the not-found screen — a soft 404 a crawler indexes as real content. Those are gated in `src/proxy.ts` before the page runs. `/profile` and `/post` stay open because real users and posts appear at runtime. |
| No console errors | VERIFIED | Landing, Explore, book, and reading-path pages are clean, including a full walk of the onboarding tour across four route changes. |
| Onboarding tour hydration | VERIFIED | Fixed in `acee6a9`. The tour marked its highlight target directly, which raced hydration; the marker now lives on `<html>`. |
| Discussion links resolve | VERIFIED | Fixed in `7aa48e9`. Resolving a database book back to the catalog matched on author, so four book pages linked to `/book/<uuid>` and 404'd. Now joins on slug. Re-crawled: 830 links, 0 broken. |
| Valid HTML on reading paths | VERIFIED | Fixed in `2f98de5`. Genre pills nested an `<a>` inside the card's `<a>`. Confirmed in the production HTML: 0 nested anchors, 5 card links intact. |
| Production build | VERIFIED | Exit 0, 834 static pages. Sitemap covers 426 URLs. |
| Types and lint | VERIFIED | `typecheck` and `lint` both exit 0 with no warnings. |
| Reply inbox | CODE ONLY | `/notifications` lists replies to your posts and comments, derived from existing tables with a locally stored last-seen marker, and shows an unread count in the nav. Never seen with real replies, because that needs two signed-in accounts. |
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

## What Shipped (August 5-6)

Recorded because most of it was invisible from the interface: three of these were silently broken and produced no error at all.

| Change | Commit | Why it mattered |
| --- | --- | --- |
| Signup accepted long email addresses | `241f266` | Any address with a local part over 23 characters returned 500 and created no account. Broken since July 15. A large share of invited readers would have been unable to join, with no error to explain it. |
| Production Supabase credentials corrected | — | The live site could not reach its database at all. `/api/health` reported `degraded`. |
| Books join the catalog on a slug | `e7ce883` | Five books, including Zero to One, could hold no community data: no saves, no recommendations, no discussions. The catalog and database were matched on author strings, which drift. |
| Catalog synced to the database | `20260807000000` | 168 browsable books had no database row, so none could host a discussion. Same failure as above, 168 times over. |
| Discussion links stopped pointing at uuids | `7aa48e9` | Four book pages linked to `/book/<uuid>`, a dead end. Found only by crawling every link on every page; each page returned 200 and looked perfect. |
| Onboarding tour hydration | `acee6a9` | The tour wrote to a React-owned node mid-hydration, raising console errors on `/explore`. |
| Valid HTML on reading paths | `2f98de5` | Genre pills nested an `<a>` inside the card's `<a>`, breaking the card's click target. |
| Real 404s for unknown books and genres | `f581f83` | Every mistyped slug answered 200 and was indexable as real content. |
| Moderation queue | `74d6fdc` | Readers could report abuse and nobody could read the reports. |
| Analytics dashboard | `9c62688` | 21 event types were being recorded with no way to read them. |
| Moderator table grants | `ea5f458` | Both admin pages were still unreadable: the policies were correct but the role had no table-level SELECT, so RLS never got a chance to filter. |
| Reply inbox | `2ae70e1` | Nothing brought a reader back. `/notifications` shows replies to your writing, derived from existing tables, with an unread count in the nav. Email replies still need the domain. |
| Starter prompts on empty book pages | `2ae70e1` | An empty book asked for a blank page. It now offers four concrete questions, including "what did you try that did not work" — the scarcest thing a first contributor can leave. |
| Composer leads with lived outcomes | `beda2f9` | Eleven flat post types put Summary beside What Did Not Work as equals. Now grouped so the differentiated kinds lead; Quote dropped from the writable set. |
| Discussion permalinks | `beda2f9` | A perspective had no address, so sharing one really shared the book page it sat on. |
| Catalog 226 to 394 books | `5cb7eea` | Narrowed to 25 earlier the same day and reversed: a reader who searches for a book and finds nothing is a dead end, which is worse than an empty discussion page. |
| CI | `74d6fdc` | Nothing stopped a broken commit reaching production. Typecheck, lint, content audit and build now run on every push. |
| Sitemap and robots | `74d6fdc` | 426 URLs were invisible to search; account and moderation surfaces were indexable. |

## Final Public Launch Blockers

1. **Verify a sending domain in Resend.** Resend SMTP is configured (August 4), which fixed the built-in email service silently dropping magic links on August 3. But until a domain is verified, Resend delivers **only to the account owner's own address** — the first invited beta reader's sign-in link will bounce. Verifying a domain (DNS records, ~30 minutes once a domain exists) is what actually opens sign-in to other people. It also resolves the `booksphere.vercel.app` name collision that already misdirected one QA pass.
2. **Sign in once and exercise the write paths.** This is the one blocker that cannot be cleared by reading code. Create a post, comment, like, save a book, save an insight, and follow a contributor. Confirm each survives a page refresh, then confirm it appears from a second device or browser. Until this is done, every row marked CODE ONLY above is an assumption.
3. **Run real auth QA.** Email magic-link, creating a profile row automatically. The Google button is now hidden behind `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` (default off) because the provider is disabled in Supabase — a visible dead button failed for every user who tried it. To offer Google later: enable the provider in Supabase Auth, set the flag to `true` in Vercel, redeploy, then QA it.
4. **Confirm ownership rules with two accounts.** One account must not be able to edit or delete another's content, and must not be able to read another's saved books, saved insights, or followed discussions.
5. **Test on a real phone.** A 375px viewport is not a handset; it says nothing about touch targets, iOS Safari, or scroll behaviour.

## Settled Decisions

**The landing page stays gated.** Decided August 3, 2026.

`/` funnels every visitor to `/login?next=/explore`. Explore stays reachable by direct URL but is deliberately not discoverable from the homepage. This is the intended shape for the closed beta and should not be "fixed" — if the homepage ever renders Explore again, that is a regression, not an improvement.

Revisit this once the private beta closes. A gated homepage costs organic discovery and search indexing, so it is the right trade only while the goal is a controlled group of invited readers rather than growth.

## Known Limitations

- Browsing uses local seed data for speed; the database backs community features rather than discovery.
- Reports are readable at `/admin/reports` by moderator accounts. Actioning a report — removing content, contacting a user — is still manual.
- Analytics is reviewable at `/admin/analytics` by moderator accounts: lifetime community totals, event volume over 30 and 7 days, an onboarding funnel with per-step drop-off, and events ranked by type. Events only record for signed-in readers, so the event sections stay empty until people are signing in.
- A discussion, post or profile that does not exist answers HTTP 200 with the not-found screen rather than a real 404. Book and genre slugs avoid this because the proxy checks them against the catalog before the route runs; these three are database-backed and cannot be pre-validated the same way. Two fixes were tried and both failed in production: `dynamicParams = false` (only gates prerendered routes) and raising `notFound()` from `generateMetadata` (a malformed id, which never reaches a database lookup, still returns 200 - so the status is committed earlier than any application code). It costs a little SEO on dead links and nothing else. Do not spend more on it without a reproduction that fails in a production build first; dev reports the wrong status for these routes.
- Moderator identities are discoverable: `profiles` is publicly readable by design, so anyone can query which accounts hold the flag. It exposes no capability, only a targeting list.
- There are no notifications, direct messages, payments, AI summaries, or voice features, by design.

## Launch Recommendation

**Private beta:** not yet. Blockers 1 and 2 must be cleared first — sign-in does not currently work, so no community feature has ever been exercised by a real account. Everything else on the list is either verified or acceptable for a small invited group.

**Public launch:** not yet. Blockers 1 through 4 all need to be cleared first, and blocker 5 is a judgement call rather than a gate, and the gated homepage recorded under Settled Decisions needs revisiting — it is right for an invited beta and wrong for open discovery.
