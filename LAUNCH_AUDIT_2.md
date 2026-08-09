# Launch audit 2 — BookSphere

Audited 9 August 2026 against production (`https://booksphere-iota.vercel.app`), Supabase
project `dhsophbjhaamucatumqr`, from commit `b32737d`. Nine passes. 29 findings. 22 fixed and
pushed across six commits; 4 need the SQL editor and are written as a migration; 3 are flagged
for you to decide.

Every claim below is labelled **VERIFIED** (I ran it against production and recorded the
output), **CODE ONLY** (I read it and reason it is true — I did not run it) or **NOT CHECKED**.

**What I could not do, stated plainly.** I cannot create an account or sign in. Everything
behind authentication — posting, commenting, saving, following, reporting, editing a profile,
the moderation queue with real rows, the analytics dashboard with real data, two-account
ownership rules — is unexercised by me. Several fixes below are on those paths. They are
CODE ONLY and they stay CODE ONLY until you click them. I also did not submit the login form:
it sends mail to a real address and submitting forms on your behalf is not mine to do.

---

## Verdict

**DELAY.** By two items now, not one.

The first is unchanged and is yours: no verified sending domain, so nobody but you can receive
a sign-in link (`F-01`). The second is new and is a P0 I found today: **any signed-in reader
can make themselves a moderator with a single HTTP request**, which gives them every abuse
report, the identity of every reporter, and the ability to delete the reports filed against
them. That is a two-line SQL fix, it is written for you in
`supabase/migrations/20260812000000_lock_privilege_columns_and_bound_anon_analytics.sql`, and
it must land before the first invited reader arrives — not after, because the exploit becomes
live at the exact moment F-01 is fixed and people can sign in.

There is a third thing that is not a bug but decides whether this is a product: **no reader
has ever written a perspective.** All 50 published rows in `discussion_posts` belong to profile
`11111111` (BookSphere Team). VERIFIED by direct query. The composer has never once produced a
row. That is the core action of the product and it has not been proven to work.

The engineering is genuinely good, and the security discipline after `20260715010943` is
careful — anonymous callers are locked out of every write path on every table except the one
you deliberately opened, which I confirmed table by table. What keeps failing is not the
architecture. It is that this app reports success while writing nothing, and six more instances
of exactly that are in this report.

---

## The eight things that will hurt you most

| # | Finding | Status |
| --- | --- | --- |
| 1 | `A2-07` Any signed-in reader can make themselves a moderator | **Migration written — you must run it** |
| 2 | `F-01` No verified sending domain (carried) | **Yours** |
| 3 | `A2-19` Zero reader-authored posts have ever existed | **Evidence, not a fix** |
| 4 | `A2-03` Reply notifications and the moderation queue both linked to a dead page | Fixed · destination verified broken first |
| 5 | `A2-18` `/_next/image` was an unmetered image-transformation endpoint for strangers | Fixed · verified |
| 6 | `A2-01` Every shared link presented itself as the homepage | Fixed · verified |
| 7 | `A2-08b` Anonymous callers can bulk-insert 5,000 analytics rows per request | **Migration written** · hole verified |
| 8 | `A2-02` The desktop nav sent signed-out visitors to the editorial account | Fixed · twice |

---

## P0

### A2-07 — Any signed-in reader can make themselves a moderator
**Severity P0 · ingredients VERIFIED · exploit CODE ONLY (needs a session I cannot create)**

`20260804000000_moderator_reports_access.sql` says in its own header:

> *"The flag can only be granted in the Supabase dashboard (no client write path exists), so
> users cannot promote themselves."*

That is false, and has been since the flag was added. Three things combine:

```
20260715010943:42   grant select, update on public.profiles to authenticated;   <- no column list
20260804000000:7    alter table profiles add column is_moderator ...            <- covered by that grant
schema.sql:289-292  the UPDATE policy checks WHICH ROW, never WHICH COLUMNS
```

`/settings` sends only name, username and bio — but the UI is not the boundary. PostgREST is,
and it accepts any column the role holds UPDATE on:

```
PATCH /rest/v1/profiles?auth_user_id=eq.<my-uuid>
{"is_moderator": true}
```

**Who it hurts, concretely.** Someone reports a harassing post. `is_moderator` is the only gate
on `/admin/reports`, which shows every report joined to the reporter's real name and @username,
and it carries DELETE on `reports` (`20260808010000`). The person who was reported promotes
themselves, reads who reported them, and deletes the report. There is no audit trail.

**Verified live with nothing but the anon key that ships in every page:**

```
GET /rest/v1/profiles?select=username,is_moderator&is_moderator=eq.true
-> [{"username":"tarunkumarnattala-3427dc","is_moderator":true}]

GET /rest/v1/profiles?select=username,auth_user_id
-> every profile's auth.users UUID, including yours
```

So an attacker does not have to guess which flag to set or who already holds it. The roster is
public.

**The fix** — in the migration, section 1. A column-level grant, because column privileges are
checked *before* RLS, so the row-ownership policy is untouched and `/settings` keeps working:

```sql
revoke update on public.profiles from authenticated;
grant update (name, username, bio, avatar_url) on public.profiles to authenticated;
```

plus a `security invoker` trigger that freezes `is_moderator`, `auth_user_id` and `id` for
`anon` and `authenticated`, so re-running an old blanket grant cannot silently reopen it.

**Blast radius:** none I can find. `/settings` writes exactly those three columns
(`settings/page.tsx:102`). Verify after running:
`select has_column_privilege('authenticated','public.profiles','is_moderator','UPDATE')` → `false`.

---

### A2-19 — No reader has ever written a perspective
**Severity P0 (as evidence) · VERIFIED**

```
GET /rest/v1/discussion_posts?select=id,user_id,post_type,created_at
-> 50 rows
   by user: Counter({'11111111-1111-1111-1111-111111111111': 50})
   by type: Counter({'Insight': 39, 'Disagreement': 6, 'Question': 5})
```

Every published post is BookSphere Team. Not one row has ever come out of the composer.
`LAUNCH_GATE.md` reported 51; there are 50, so one was soft-deleted — consistent with the
delete test in `a1ce916`, which means delete has run once and create still has not.

For contrast, these paths *do* have a real row behind them: `discussion_comments` (1, Aug 5),
`likes` (6, most recent **today** 06:11), `follows` (5), `book_recommendations` (4, most recent
today 06:10), `knowledge_posts` (1 real). So you were clicking around this morning and those
worked. Creating a perspective, saving a book, saving an insight, reporting a post and editing
a profile still have no row behind them, ever.

**This is not a bug report. It is the reason the launch checklist step 3 matters more than
everything else in this document.** Two of today's fixes are on write paths that have never
run once.

---

## P1 — fixed and verified

### A2-03 — The reply inbox and the moderation queue both linked to a dead page
**VERIFIED broken on production before the fix · fix is CODE ONLY**

`/post/[id]` is the **knowledge-post** route. `notifications.ts:112` built every reply link as
`/post/${row.discussion_post_id || row.knowledge_post_id}` — so a reply to a *perspective* sent
a `discussion_post` id to the knowledge-post route.

**Evidence.** I opened a real discussion-post id on that route in a browser:

```
https://booksphere-iota.vercel.app/post/9ad618f1-c2dd-43c8-83f9-ed914f3821b3
-> "NOTE UNAVAILABLE — We could not find this knowledge note.
    It may have been removed, or the link may be incomplete."

https://booksphere-iota.vercel.app/discussion/9ad618f1-c2dd-43c8-83f9-ed914f3821b3
-> the perspective, correctly
```

**Who it hurts.** `AUDIT.md` section D says the entire retention story is: *write something →
someone replies → you return.* The link that closes that loop landed on an error card. And
because every report is filed with `target_type: "discussion_post"`
(`post-actions.tsx:299`), `/admin/reports` "View target" sent the moderator to the same dead
page for effectively every row in the queue — you could not see what you were being asked to
moderate.

**Fix** (`93c6bdb`): route by which column is populated, and split the two cases in
`targetHref`. A perspective goes to `/discussion/<id>`, a feed note to `/post/<id>`.

---

### A2-01 — Every shared link presented itself as the homepage
**VERIFIED before and after**

The root layout sets `openGraph.title`, `openGraph.description` and `openGraph.url` to fixed
strings. Next inherits a parent's `openGraph` object into every child that does not define its
own, and a page-level `title` does **not** flow into `openGraph.title`. So the per-page titles
that landed on 6 August fixed the browser tab and did nothing at all for the link card.

**Before** — identical on `/`, `/explore`, `/book/sapiens`, `/genre/psychology`,
`/path/startups-101`, `/profile/booksphere-team`, `/post/<id>` and the discussion permalink:

```
og:title       BookSphere - Understand books through people
og:description Discover the best books. Read what thoughtful people learned from them...
og:url         https://booksphere-iota.vercel.app
```

`og:url` is the worst of the three. Consumers that treat it as the canonical identity of the
object collapse every one of those onto the homepage — which defeats the entire reason
discussion permalinks were built in `beda2f9`.

`FIXED.md` records F-05 as closed on the evidence that `og:image` and `twitter:card` were
present. Both were. The title beside them was not checked.

**After** (VERIFIED, 21 routes): every route carries its own `og:title` and its own `og:url`,
and every page now has a `<link rel="canonical">`, which it did not before.

### A2-01b — and the fix broke `og:image` on every book page, which I caught on production
**VERIFIED**

Defining `openGraph` in a page's metadata stops Next attaching the file-convention
`opengraph-image` for that route. My first commit gave every page its own og:title and in the
same move **stripped `og:image` from every book page, genre page, profile and reading path.**
The discussion permalink survived only because that segment has its own `opengraph-image.tsx`.

Typecheck, lint, the content audit and the build were all green on the commit that broke it.
The only thing that caught it was reading the deployed HTML.

**Fix** (`330d4c4`): `pageMetadata` names the card explicitly and defaults to the site card;
the discussion route names its own. The card no longer depends on merge order. Verified: all
11 routes checked carry an `og:image`, the discussion permalink keeps its per-perspective card,
and both card routes still return real PNGs (62 KB and 59 KB, `image/png`).

---

### A2-18 — `/_next/image` was an unmetered image endpoint for anyone on the internet
**VERIFIED**

`next.config.ts` allowlisted `placehold.co`, `images.unsplash.com` and
`lh3.googleusercontent.com`. All three serve arbitrary paths, so each is an infinite source of
distinct image URLs — and each distinct URL is a Vercel image transformation you pay for.

**Evidence, on production, before the fix:**

```
/_next/image?url=https%3A%2F%2Fplacehold.co%2F600x400%2Fpng%3Ftext%3Daudit<random>&w=1920&q=75
  #1 -> 200 image/png 1981 bytes  x-vercel-cache: MISS
  #2 -> 200 image/png 2065 bytes  x-vercel-cache: MISS
  #3 -> 200 image/png 2144 bytes  x-vercel-cache: MISS

control: url=https://example.com/x.png -> 400          (the allowlist works)
widths accepted per source: 32,48,64,96,128,256,384,640,750,828,1080,1200,1920,2048,3840  (15)
```

So one invented URL is 15 billable transformations, and there is no rate limit and **no Vercel
spend cap set** (`LAUNCH_CHECKLIST` step 4 is still unchecked).

**Nothing used them.** No reference anywhere in `src/`; every book cover in the database is
Open Library (100) or null (294); every `avatar_url` is null and `avatar_url` is never rendered
through `next/image` at all; Google auth is disabled. `covers.ts` can only ever return an Open
Library or a Google Books URL.

**Fix** (`8e4feaa`): allowlist narrowed to `covers.openlibrary.org`, `books.google.com`,
`books.googleusercontent.com`; CSP `img-src` narrowed to match. Verified after deploy:
placehold.co → **400**, a real Open Library cover → **200 image/jpeg 16 KB**, and `/explore`
still carries 95 `<img>` tags and 1,004 `_next/image` URLs, all Open Library, rendering
correctly in the browser.

---

### A2-02 — The desktop nav sent signed-out visitors to the editorial account. Twice.
**VERIFIED at both stages**

`FIXED.md` records this as fixed on 6 August: *"Profile tab led to the editorial account when
signed out … nav now `/login?next=%2Ffeed`"*. The **mobile bottom nav** was fixed. `top-nav.tsx`
was not. At 1440 px, signed out:

```
visible Profile link in <header> -> /profile/booksphere-team
```

A stranger tapping the tab that should be theirs landed on BookSphere's own profile, Follow
button and all, with the tab lit as though it were them.

**Then the fix did not take, and that is the more useful half of this finding.** I changed the
`navItems` array and the initial state, deployed, and checked with curl:

```
/explore server HTML: 0 occurrences of /profile/booksphere-team, 2 of /login?next=%2Ffeed
no deployed JS chunk contained the old href
```

Reading the live DOM said otherwise. `refreshProfileHref` still contained two
`setProfileHref("/profile/booksphere-team")` calls, so the server sent the correct href and
**hydration set it straight back.** The server HTML was not evidence. Only the running page was.

**Fix** (`9933aff`). VERIFIED in the live DOM after hydration: both Profile links now read
`/login?next=%2Ffeed`. A third, unused copy of the nav in `lib/config.ts` still carried the
original bug and was updated too — that is the obvious way for this to come back a third time.

---

### A2-06 / A2-09 / A2-10 / A2-11 — Six more writes that report success while changing nothing
**CODE ONLY — these are all behind sign-in**

This is the project's signature failure and it is still here in six places.

| Where | What happens | Fix |
| --- | --- | --- |
| `settings/page.tsx:102` | `.update()` with no `.select()` returns 204 and `error: null` whether it wrote one row or zero. If the ownership clause matches nothing, the screen says saved and then `router.replace`s to a username that was never stored — **the user is shown a 404 as confirmation that their profile saved.** | read the row back, navigate with `data.username` |
| `admin/reports/page.tsx:79` | Dismissing a report deletes zero rows just as silently. The queue looks cleared; the report survives to the next page load. | `.select("id")`, restore on empty |
| `knowledge-posts.ts:131` | Deleting your own feed post. Author watches it vanish and is redirected; the post is still public. | `.select("id")`, explicit permission error |
| `contributions.ts:586` | Same for deleting a comment. | same |
| `saved_books`, `saved_insights`, `followed_discussions`, `post_awards` | `.upsert()` on four tables that have INSERT and DELETE policies and **no UPDATE policy**. upsert compiles to `INSERT ... ON CONFLICT DO UPDATE`, so the first real conflict — a second tab, a double tap, a click before the viewer state resolves — is refused by RLS. | `.insert()`, treat `23505` as already-there, the shape `05c409f` established for `reports` |

`deleteSupabaseContribution` was already hardened this way (it uses an RPC that returns whether
a row changed). These five paths never got the same treatment. Fixed in `93c6bdb`.

---

### A2-13 — `/saved` dropped saved books on the floor
**Data drift VERIFIED · code path CODE ONLY**

`saved-client.tsx:71` matched the database row back to the catalog on **the author string** —
the exact failure `books.slug` was added to eliminate in `20260806000000`, whose own header
cites it.

```
database:  {"title":"Zero to One","author":"Peter Thiel","slug":"zero-to-one"}
catalog:   ["Zero to One", "Peter Thiel and Blake Masters", 2014, ...]     data.ts:160
same for   Never Split the Difference (Chris Voss / Chris Voss and Tahl Raz)
           Outlive (Peter Attia / Peter Attia and Bill Gifford)
```

A reader saves *Zero to One*, the row is written, `/saved` silently discards it. If those were
their only saves, the page then tells them *"Your saved shelf is ready. Save a book … to make
this page personal"* — their data is in the database and the interface denies it exists.

Fixed by reusing `localBookForDbBook`, which already solved this correctly for book pages.

---

### A2-14 — A failed notifications read looked like an empty inbox, and permanently cleared the badge
**CODE ONLY**

`getReplyNotifications` never inspected `.error`. Any failure yielded empty maps and the page
rendered **"No replies yet"** — indistinguishable from a genuinely empty inbox. Worse, the page
then called `markNotificationsSeen()` unconditionally, which is a one-way write: `countUnseen`
filters on `createdAt > lastSeen`, so every reply that already existed became invisible in the
badge, on that device, permanently.

The person this hurts is the one whose first reply arrives during a transient blip — exactly
the person whose return depends on that signal.

Fixed: the function returns `{ ok, notifications }`, the page renders a real error state and
does not mark seen, and the bell leaves the badge alone on a failed poll. The three queries
that feed `.in()` are now bounded to 200 rows so a prolific writer cannot build a URL long
enough to be rejected by a proxy.

---

### A2-08b — Anonymous callers can bulk-insert unbounded analytics rows
**VERIFIED · migration written, you must run it**

`analytics_events` is the one table anonymous callers can write to, deliberately and correctly.
What is missing is any bound on volume. With nothing but the publishable key that ships in
every page:

```
200 rows in a single request              -> 201
30 sequential single-row inserts          -> 201, 201, ... no throttling of any kind
a 5,000-row / 315 KB request              -> accepted and processed; it failed only because
                                             the last row deliberately broke the CHECK
```

`metadata` is capped at 2,000 characters, so one request can carry roughly 10 MB. The Supabase
free tier is 500 MB. **That is about 50 requests to fill the database**, after which every
write fails — including the profile-creation trigger, which means nobody can sign up. Nothing
alerts on it and no spend cap covers it.

Section 2 of the migration bounds anonymous callers to one row per statement (which removes
the bulk vector entirely) plus a per-minute ceiling, without touching the grant or the policy.
It also adds `target_type` to the shape constraint — the one text column the original
constraint forgot, so it was unbounded.

**I had to write 231 rows to prove this**, and no role holds DELETE on that table, so I could
not remove them. Section 3 of the migration deletes them. Run it before you read
`/admin/analytics`, or `audit_bulk_probe` will be your top event.

---

### A2-20 — `/saved` had no inbound link anywhere in the app
**VERIFIED by grep across all of `src/`**

Every "Save book" and "Save insight" button on the site writes to a page reachable only by
typing the URL. The only reference to `/saved` in the entire codebase was `robots.ts`
disallowing it. Fixed: it is now on the owner's own profile beside Edit profile.

---

## P2

| ID | Finding | Status |
| --- | --- | --- |
| `A2-04` | Eight route groups still served the site-wide title, two of them in the sitemap: `/path/*`, `/profile/*`, `/profile/*/connections`, `/post/*`, `/saved`, `/create`, `/settings`, `/notifications`, `/admin/*`, `/book/*/create-discussion`. The 6 August title fix covered books, genres and static pages and stopped there. | Fixed · VERIFIED across 21 routes |
| `A2-12` | The composer and the database accept 4 characters; the edit form demanded 20. Any feed post between those bounds was **uneditable forever** — the same bug fixed for discussion posts in `9fdb42b` and missed here. Both now read one exported constant. | Fixed · CODE ONLY |
| `A2-15` | `/saved` rendered an error banner, "your shelf is ready" and a shelf of editorial books simultaneously. `/admin/analytics` turned a failed count into a confident **"0"** on a page whose own copy reads *"Counts come from the database, not the interface"*; failed counts now show "-". The 5,000-row event cap is now disclosed instead of silently understating the funnel. | Fixed |
| `A2-16` | `/privacy` named Supabase only. **Resend receives every reader's email address on every sign-in link** and was not disclosed at all; Vercel was "its hosting provider". Both named now. "Remove your own community activity" also corrected — `delete_own_discussion` sets `status = 'removed'`, it does not erase. | Fixed |
| `A2-17` | The report reason was duplicated into `analytics_events`, which **no role can delete**, so it outlived the report a moderator could dismiss, and was mirrored into the reporter's own `localStorage`. Only the target id is recorded now. | Fixed |
| `A2-08` | `/notifications` and `/create` were crawlable and marked `index, follow`. All account and moderation surfaces now carry `noindex` and are in robots.txt. | Fixed · VERIFIED |
| `A2-05` | Four names for one object on `/explore`, still. See below. | Partly fixed · rest flagged |
| `A2-21` | `/explore` displays **"💡 0 reader insights" twelve times** on the first screen after login. `insightCount` is seeded `0` for every book and this label never hydrates from the real aggregate. The first screen advertises emptiness a dozen times. | **Flagged — your call** |
| `A2-22` | A signed-out stranger gets the full feed composer, with an avatar bubble, and is only told to sign in *after* writing and pressing Share. The draft is then lost on navigation. That is the highest-friction contribution the product wants, discarded at the last step. | **Flagged** |
| `F-10` | Missing discussions/posts/profiles still answer **200**. I did not attempt a third fix. But the practical harm — search engines indexing pages that do not exist — is now solved: every dead URL carries `noindex` (VERIFIED on 6 URLs) while real pages stay `index, follow`. | Mitigated |

### A2-05 — the noun count, since the pitch is conceptual clarity

Counted in the live text of each screen:

| Screen | perspective | insight | thread | discussion | note | post |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 1 | — | — | — | — | — |
| `/explore` | 13 | 10 | 8 | 7 | — | 1 |
| `/book/sapiens` | 13 | 6 | 1 | 3 | — | 1 |
| `/feed` | 1 | — | — | 1 | 4 | 5 |

`F-07` settled on **perspective**. I fixed the two pure UI labels that contradicted it
("Open thread" on the editorial card and in search results). I did **not** touch the rest,
because it is your prose and the brief says to flag rather than decide. What remains, with the
exact change I would make:

- `data.ts:1578` — `💡 ${book.insightCount} reader insights` → `reader perspectives`. This is
  also `A2-21`; it renders "0" twelve times on `/explore`.
- `explore/page.tsx:101` — "Human-curated **insights** that show the idea, application,
  question, or disagreement behind a book" → "perspectives". The sentence names *Insight* as
  one of four kinds in the same breath as using it for the container.
- `data.ts:1368-1376` — three editorial blurbs ("A practical **thread** about turning ideas
  into behavior"). Your voice; your call.
- `data.ts:1577` — "Reader **discussion**" as a signal label.
- `/feed` uses "post" and "note" for a third object. Whether a feed note is a different thing
  from a perspective is a product decision, not a copy one — but a stranger cannot currently
  tell, and that is the finding.

---

## P3

- **`A2-23`** `hero-inline-search.tsx:48` runs `window.setInterval(syncFromDom, 120)` for as
  long as `/explore` is open, and tears it down and recreates it on every keystroke.
  `onChange`, `onInput` and `onKeyUp` already cover real input. Eight wakeups a second on the
  first screen after login is measurable battery on a phone. (It predates the audits — it is in
  the initial commit — so it is not a leftover from the synthetic-input false alarm.)
- **`A2-24`** `/explore` fires **12 client round-trips to `/api/book-cover`** because 294 of 394
  books have `cover_url = null` in the database and resolve lazily. Three covers were still
  pulsing after full load. The catalog has 100 Open Library URLs that were never written to the
  database. Backfilling `books.cover_url` would remove those requests entirely.
- **`A2-25`** `perspective_posts` has three write policies and no write grant
  (`20260715012508:35` revoked it and never restored it, unlike `knowledge_posts`). The app
  never touches the table, so nothing is broken today — it is a trap for the next feature, the
  same shape as the three bugs that already bit you.
- **`A2-26`** `create_profile_for_auth_user()` and `delete_own_discussion(uuid)` pin
  `search_path = public` while the other two definer functions in this schema use `''`. Both
  bodies schema-qualify everything, so the change is free. In the migration, section 4.
- **`A2-27`** `profiles` is world-readable including `auth_user_id` and `is_moderator`, so
  anonymous callers can harvest every account's `auth.users` UUID and the full moderator roster
  (VERIFIED above). Neither is a credential; both are reconnaissance, and the roster is the
  target list for `A2-07`. Narrowing it to a column-level SELECT grant is safe but touches a
  boundary — **flagged, not done.**
- **`A2-28`** `supabase.ts:9` uses default options: implicit flow, so magic-link tokens land in
  the URL fragment, and the session persists in `localStorage`. With `script-src 'unsafe-inline'`
  any XSS is a full session takeover. `flowType: 'pkce'` is the right answer, but it changes the
  auth callback and auth is your launch blocker — **flagged, not done, do it after launch.**
- **`A2-29`** `safeReturnPath` (`login-form.tsx:11`) rejects `//` but not `/\`. Low risk because
  Supabase enforces its own redirect allow-list; don't put a wildcard there.

---

## Pass 5 — performance and cost, with a correction

**`F-06` was overstated and should be re-scoped.** `/explore` is 828 KB of HTML — but that is
the *decompressed* figure. Over the wire:

```
/explore   raw 827,605 bytes   brotli 55,306 bytes   95 <img>   1,004 image URLs
```

**55 KB transferred, not 826 KB.** The cost is not bandwidth on 3G, it is that 589 KB of the
828 KB is inline script the phone must parse, and the RSC payload serialises **all 394 books**
(394 × `whyMatters`, 394 × `publishedYear`, 501 × `isbn`, 501 × `coverUrl`) to render **7
distinct book links**. The culprit is one line — `<HeroInlineSearch books={books} />` at
`explore/page.tsx:62` — passing the whole catalog into a client component so the search box can
filter it.

That reframes the fix: it is not "restructure what the server passes across a page composed of
many components" (which is why it was correctly deferred). It is "give the search box a
projection of `{id, title, author, genres}` instead of the whole `Book`". Smaller and more
surgical than `DEFERRED.md` assumed. I still did not do it, because it needs `searchBooks` and
`SearchResultsPanel` to agree on a narrower type and there is no test suite behind that.

Real transferred weight, measured: `/` 6 KB · `/feed` 9 KB · `/genres` 14 KB ·
`/genre/psychology` 20 KB · `/book/sapiens` 18 KB · `/explore` 55 KB. Only `/explore` is an
outlier, and it is 5× the next page.

Cost surfaces: the cover API is properly bounded (catalog allowlist, length caps, 30-day cache)
— re-confirmed. The image optimiser was not (`A2-18`, fixed). `analytics_events` was not
(`A2-08b`, migration).

## Pass 6 — growth and retention

The distribution mechanics were broken in two places and both are now fixed: shared links all
claimed to be the homepage (`A2-01`), and the reply link that closes the only retention loop
led to an error page (`A2-03`). Those were not small; the reply inbox was built in `2ae70e1`
specifically because *"nothing brought a reader back"*, and its one link did not work.

What remains is structural and not a bug: email replies still need the domain, so the loop only
fires for someone already visiting. There is no digest, no streak, no unfinished state. And the
gated homepage (`/` funnels everyone to `/login`) closes the only free distribution channel a
founder with no budget has — organic search and LLM citation. That is a settled decision and
correct for a 100-person beta; it should be revisited the moment the beta is not the goal.

## Pass 9 — launch operations

Unchanged from `LAUNCH_CHECKLIST.md` and all still open: **no Vercel spend cap** (which
`A2-18` made materially worse than it looked), **no point-in-time recovery** on the Supabase
free tier, monitoring that is visibility rather than alerting, a support inbox nobody has
confirmed receives, and one moderator with no stated cadence. `/api/health` returns
`200 healthy`, `database: reachable` — VERIFIED.

---

## Verification run after every batch

| Batch | commit | typecheck | lint | audit:content | build |
| --- | --- | --- | --- | --- | --- |
| Baseline | `b32737d` | 0 | 0 | 0 | 0 |
| Metadata, nav, nouns, robots | `cf3fba7` | 0 | 0 | 0 | 0 (835 pages) |
| Silent writes, dead links | `93c6bdb` | 0 | 0 | 0 | 0 |
| og:image restore | `330d4c4` | 0 | 0 | 0 | 0 |
| Migration, privacy, report payload | `cb8eb9c` | 0 | 0 | 0 | 0 |
| Image allowlist | `8e4feaa` | 0 | 0 | 0 | 0 |
| Nav hydration fix | `9933aff` | 0 | 0 | 0 | 0 |

Every gate was green on the commit that shipped `A2-01b`, which broke the social card on every
book page. Green gates are not evidence of anything except that it compiles.

## What is still unverified, and why

| What | Why |
| --- | --- |
| All five remaining write paths (create a post, save a book, save an insight, report, edit profile) | I cannot sign in |
| Every fix in `A2-06`, `A2-09`, `A2-10`, `A2-11`, `A2-12`, `A2-13`, `A2-14` | Same — they are all behind auth |
| The `A2-07` exploit itself | Needs a session; the three ingredients are verified in source and the moderator roster is verified public |
| Whether the migration applies | I have the anon key only. No service role, no SQL access, no Supabase CLI |
| Two-account ownership rules | Needs two accounts |
| Email deliverability | Needs `F-01` |
| Real-device rendering | 375 px headless only |
