# Launch audit 3 — BookSphere

Audited 10–11 August 2026 against production (`https://booksphere-iota.vercel.app`), Supabase
project `dhsophbjhaamucatumqr`, from commit `f0cdbcb`. Five passes. **31 findings, 27 fixed
across 9 commits, 4 flagged for you.** One correction to my own work is recorded at the end,
and one correction to a claim I made in a commit message today.

Every claim is labelled **VERIFIED** (I ran it against production and read the output),
**CODE ONLY** (I read the source and reason it is true — I did not run it) or **NOT CHECKED**.

**What I could not do, stated plainly.** I cannot create an account, sign in, or receive email.
Everything behind authentication is unexercised by me: posting, commenting, saving, following,
reporting, editing a profile, deleting, the moderation queue with real rows, the analytics
dashboard with real data, two-account rules. **Most of what I fixed today is on those paths.**
They are CODE ONLY and they stay CODE ONLY until you click them. That caps this verdict at
AMBER on its own, before any finding.

---

## Verdict

**AMBER.** It ships to the twenty people you already know. It should not go further yet.

Three things hold it there.

1. **No reader has still ever written a perspective.** VERIFIED today: all 50 rows in
   `discussion_posts` belong to profile `11111111` (BookSphere Team), the newest dated
   **5 August**. Six days and two audits later, the composer has still never produced a row.
   That is the product's core action. Today I found and fixed two defects on it that would
   have bitten the first person who tried — no double-submit guard at all, and a written
   draft destroyed by the login wall. Both were found by reading, not by running.

2. **The product was showing engagement that did not exist.** Every perspective page and
   every book page rendered two comments — "BookSphere Team · 12" and "Community Starter ·
   8" — that are not in the database, four lines under the same card reading **0 comments**.
   VERIFIED in the live DOM. Fixed. This is the same family as "every post displayed the
   house account's name", and it is the thing `MARKETING_BRIEF.md` §6 forbids the marketing
   from doing while the product was doing it.

3. **Nothing behind sign-in has been exercised by anyone but you, once, in early August.**
   `likes` 6 rows, `follows` 5, `discussion_comments` 1, `post_awards` 31, `useful_reactions`
   5, `knowledge_posts` 5 (2 real). `reports`, `saved_books`, `saved_insights`,
   `saved_knowledge_posts` and `followed_discussions` are closed to me entirely, so I cannot
   tell you whether any of them has ever had a row.

The engineering has got noticeably better since audit 2 — the two migrations landed and I
verified both live, the metadata work holds across 21 routes, the sitemap is clean, the
console is silent, the image allowlist and the analytics bound are real. What keeps failing
is the same thing every time: **the interface asserts things the database has not confirmed.**
Eleven of today's findings are that shape.

---

## The five things that would have hurt you most

| # | Finding | Status |
| --- | --- | --- |
| 1 | `A3-01` Two comments that do not exist, with like counts, on every perspective | Fixed · VERIFIED before and after |
| 2 | `A3-02` A written perspective destroyed by the login wall | Fixed · CODE ONLY |
| 3 | `A3-03` No double-submit guard on the composer — the core action could publish twice | Fixed · CODE ONLY |
| 4 | `A3-04` A deleted feed post came back, in full, with Edit and Delete | Fixed · CODE ONLY |
| 5 | `A3-05` Like/save/follow counts counted the reader twice | Fixed · CODE ONLY |

---

## P1

### A3-01 — Every perspective displayed two comments that do not exist, with like counts
**VERIFIED before and after · fix VERIFIED live**

`comment-thread.tsx` seeded its initial state with `starterComments(postId)` in **every**
mode, including production. That is server-rendered, so it is in the HTML from first paint.

Read out of the live DOM on `/discussion/9ad618f1-…` and on `/book/high-output-management`:

```
Comments  Top New  Post
BookSphere Team     12   "What is the smallest real-life example that would prove this
                          idea useful?"
Community Starter    8   "A specific scene, decision, or habit is more useful than
                          agreement alone."
```

The card four lines above read `0` comments. The database has **one** row in
`discussion_comments` in total, and it belongs to a feed post:

```
GET /rest/v1/discussion_comments?select=*
-> [{"id":"08b14749…","discussion_post_id":null,"knowledge_post_id":"c28a5397…",
     "body":"I agree","created_at":"2026-08-05T14:43:08Z"}]

GET /rest/v1/discussion_comments?…&discussion_post_id=eq.9ad618f1-…
-> []   HTTP 200
```

So: two invented comments, two invented numbers, and a contradiction with the count on the
same screen. **These were never content.** Their ids are `<postId>-1` and `<postId>-2`, which
are not uuids — so pressing Reply on one sends that string into a uuid column and the insert
fails with `22P02`, every time, for everyone (CODE ONLY). They are a placeholder from before
there was a database.

**Fixed** (`f4c33e6`): the placeholder is now reachable only in the offline preview, which
has no database to read. Production says "Loading comments..." until it knows.
**Verified after deploy, in the live DOM:** `smallest real-life example` 0, `Community
Starter` 0, `Loading comments` 1, then "No comments yet."

**If you want starter prompts back**, it is a one-line revert of the `fallbackComments`
guard — but give them real rows, so they can be replied to and so their counts are true.

### A3-02 — A stranger who writes a perspective loses it at the login wall
**CODE ONLY · P1**

`/book/[id]/create-discussion` renders the composer with no session check, and
`requireProfile()` runs only on submit. Six CTAs on the book page lead there. So the sequence
is: arrive signed out, write two hundred words, press publish, get a "log in" notice, follow
it, come back in a fresh page load — and the form is empty. `grep localStorage
create-discussion-form.tsx` returned nothing. The message "Your draft has been preserved" was
true only for a failed publish, never for the login detour.

This is the highest-effort contribution the product wants, discarded at the last step, on the
one action that has never produced a row.

**Fixed** (`ea0b355`): the draft is written to `localStorage` keyed by book id when the login
notice appears or a publish fails, restored on mount, cleared on success, and the form says
"We kept the draft you started here."

### A3-03 — The composer had no double-submit guard at all
**CODE ONLY · P1**

`create-discussion-form.tsx` had no `publishing` state and the button was never disabled.
`requireProfile()` plus the insert is several seconds on a phone, which is exactly when
someone presses again. The rate-limit trigger allows ten posts an hour, so a second press
published a second identical perspective. The feed composer had a flag but set it **after**
`requireProfile()` — two network round trips during which the button stayed live, and
`knowledge_posts` has no unique constraint and is not covered by the rate-limit trigger.

Fixed in `69a382c`, then hardened again in `afc27f9` after a review found the flag sat
outside the `try/finally`, so a throw would have left Share permanently dead.

### A3-04 — A deleted feed post came back, in full, with Edit and Delete
**CODE ONLY · P1**

`feed-composer.tsx:87` wrote every published post into `localStorage` — including, with a
database configured, the real server row — and nothing pruned that copy on delete.
`/post/[id]` falls back to that store when the server has no row, **ungated**. So: publish,
delete, land on `/feed`, press Back, and the post you just removed renders with its body, its
comment thread and its Delete button. Pressing Edit on it fails with "We could not save your
edit."

`knowledge-feed.tsx` was already gated, which is why nobody noticed the write happening.

**Fixed** (`69a382c`): the store is written only when there is no database, and the fallback
read is gated the same way.

### A3-05 — Like, save and follow counted the reader twice
**CODE ONLY · P1**

The totals handed to `PostActions` already contain the reader's own row — `likes` is a
`count(*)` over the `likes` table whose select policy is `using (true)`, and saves/follows
come from `discussion_engagement_counts`, a view that sees every row. The button then
rendered `likes + (liked ? 1 : 0)`.

So a perspective you had already liked read **one higher than the same card's own
`{post.likes}` two lines above it** (`discussion-card.tsx:69` vs `post-actions.tsx:502`), and
unliking left the number one too high until a reload. `knowledge-post-actions.tsx` already
had this right with a persisted-state delta.

Fixed in `8daee68` using that same shape, then corrected twice in `afc27f9` — see
"Corrections", because the first version was wrong in two ways.

### A3-06 — Following someone never moved a follower count
**CODE ONLY · P1**

`follow-button.tsx` had no `useRouter` at all. Both surfaces that display a follower number —
the profile header (`profile/[username]/page.tsx:97`) and the connections tabs — are
server-rendered and `force-dynamic`. Press Follow: the button says "Following", "Followers
12" stays 12, indefinitely. Fixed (`8daee68`): `router.refresh()` after a successful write,
plus a ref that latches in-flight synchronously — `disabled={syncing}` only engaged two
network calls later, so a double tap got through.

### A3-07 — Saving a feed post wrote a row nothing ever read
**CODE ONLY · P1**

`/saved` queried `saved_books` and `saved_insights` only. `saved_knowledge_posts` had exactly
one reader in the entire codebase, and it was the viewer-state check that decides whether the
button says "Saved". So the button said Saved, the row was really written, and the shelf
denied it existed — the same shape as `A2-13`. Fixed (`da3b45e`): a "My Saved Posts" section,
and the empty-shelf banner counts them.

**Still open (P2):** `KnowledgeNoteCard` has no save control, so a saved feed post can only be
un-saved from a search result. Add or remove is asymmetric.

### A3-08 — One bad request poisoned /saved for the whole session
**CODE ONLY · P1**

`setError("")` appeared nowhere in `saved-client.tsx`, and the error branch returns before
everything else. One transient failure and the page showed only the red box no matter how
many successful refetches followed — and refetches were routine, because the effect listened
on `storage`, which fires for **any** localStorage key changing in another tab.
`trackEvent` writes `booksphere.analytics` on every like, save, share and report, so a like in
a second tab blanked this page to "Loading your saved shelf..." and refetched it.

Fixed (`da3b45e`): the listener is filtered, the error is cleared on every attempt, only the
first load blanks the page, and a run token stops a slower older response overwriting a newer
one. Corrected again in `afc27f9` — filtering the listener silently removed cross-tab refresh,
which the page had been getting by accident; both save paths now write one dedicated key.

### A3-09 — Unsaving from the shelf left the card on the shelf
**CODE ONLY · P1** — `PostActions` deleted the row and updated only its own button, so the
card sat under "My Saved Perspectives" reading "Save" until a reload. Fixed (`da3b45e`,
`afc27f9`).

### A3-10 — Changing your username broke the Profile tab
**CODE ONLY · P1**

Every nav resolves that tab to `/profile/<username>` once on mount and only recomputes it on
a `booksphere-auth-change` event or a Supabase auth-state change. Saving a new username fires
neither. So after the one screen whose entire purpose is changing that value, the Profile tab
answered "Reader not found" until a reload. **This is the same shape as the bug you hit on 10
August** (`5a38680`) and it is exactly what the priority brief asked me to look for. Fixed
(`064c779`): `/settings` now announces the change.

### A3-11 — A transient query failure 404'd a real reader's profile
**CODE ONLY · P1**

Any error in `getCanonicalProfileBundle` returned `null` for the whole bundle. The page then
falls back to the static catalog, which has no row for anyone who actually signed up, and
called `notFound()`. The profile lookup itself had already succeeded — only a secondary query
failed. The connections page did the same, and additionally rendered a confident "No
followers yet" on a failed `follows` read. Fixed (`da3b45e`).

### A3-12 — Liking a comment was undone by posting one
**CODE ONLY · P1**

`toggleCommentLike` updated its own id list but never the row, and the effect that derives
that list from `comment.viewerLiked` re-runs on every `setComments` — which posting, editing
and deleting all do. The heart emptied and the count dropped back while the row stayed in the
database. Fixed (`8daee68`).

### A3-13 — /explore renders the same six books twice, under two different promises
**VERIFIED · flagged, not fixed — see "Four decisions that are yours"**

---

## P2

| ID | Finding | Status |
| --- | --- | --- |
| `A3-14` | **Four names for one object on the most-repeated component in the product.** Counted on the live action bar under every perspective: `post` ×4 (aria: Like this post / Mark why this post was useful / Share this post / Report this post), `insight` ×3 (visible "Save Insight"; aria: Save this insight / Award this insight), `thread` ×2 (visible "Follow thread"; aria: Follow this discussion thread), `contribution` ×1. Ten labels, four nouns, one object — and eight of them are what a screen-reader user hears, the audience least able to infer they all mean the same thing. | Fixed · **VERIFIED in the live DOM** |
| `A3-15` | The live reading room card names a specific perspective and linked to `/book/<id>#discussions`, where the book page opens whichever post it defaults to. You tapped one argument and arrived at another. | Fixed · VERIFIED live |
| `A3-16` | The empty state beside it was gated on the count **before** the card's own null filter, so unresolvable posts produced a heading, a "View all" link and an empty box. | Fixed · CODE ONLY |
| `A3-17` | Saving a book twice made the count permanently wrong: the guard was set after `getSupabaseContext()` (auth call + up to three queries) with the button enabled throughout. Two taps both incremented and both inserted; the second returns `23505`, deliberately treated as success — so the button read "Saved · N+2" over one row. Recommend had the same late guard plus a revert to a stale snapshot. | Fixed · CODE ONLY |
| `A3-18` | **"Suggest this book" did nothing** — a `<button>` with no `onClick`, no form and no handler, and the only control in the one state where a reader has told us exactly what is missing. `genre-book-search.tsx:109` explicitly promises it. | Fixed (emails support with the query) · CODE ONLY |
| `A3-19` | Keyboard selection in the search panel highlighted the wrong row: the panel re-partitions results into two groups and rendered each with a fresh local index against one shared `selectedIndex`, so two rows looked selected and Enter opened neither past the first group. | Fixed · CODE ONLY |
| `A3-20` | A cover that could not be found pulsed forever — nothing set `failed` when the API answered `{coverUrl: null}` or the fetch threw, so the skeleton and its sr-only "Loading cover" ran for the life of the page. And `if (fallbackUrl \|\| failed) return` meant a stored cover that 404s never reached the API fallback at all. | Fixed · CODE ONLY |
| `A3-21` | `/search` fetched 100 discussions and 100 feed posts — full bodies, up to 10,000 characters — and serialised them into the payload on every load, **including with no query**, when the page renders none of it. Top-level nav item, signed-out entry point. | Fixed · **VERIFIED: 112 KB → 32 KB with no query** |
| `A3-22` | `onboarding_shown` fired once per navigation, not once per visitor (the effect keys on `pathname`), so home → explore → genres logged three shows for one person — inflating the top of the only funnel `/admin/analytics` has. | Fixed · CODE ONLY |
| `A3-23` | `/notifications` stamped "seen" at the **end** of a read that is up to six queries. A reply arriving during it is not in the list being rendered but is older than the stamp, so `countUnseen` never counts it — and the write is one-way, so it is invisible on that device forever. The person that hurts is the one whose first reply lands during a slow load. | Fixed · CODE ONLY |
| `A3-24` | A reply to a comment you left on someone else's post was labelled `Jane on "your perspective"` — the title maps only hold your own writing, so an unknown title fell through to a fallback that credits a stranger's post to you. | Fixed · CODE ONLY |
| `A3-25` | Deleting a feed post told its author the link was broken: `onDeleted` set the post to null, rendering "We could not find this knowledge note. It may have been removed, or the link may be incomplete" at the person who had just removed it on purpose. | Fixed · CODE ONLY |
| `A3-26` | The feed composer avatar was a hardcoded `"N"` — your own initial, shown to every reader in the box meant to be theirs. Same family as the house-account attribution bug. | Fixed · **VERIFIED in the live DOM** (signed out now renders a neutral mark) |
| `A3-27` | `toggleUsefulness` had no in-flight guard: two chips tapped quickly both computed from the same pre-first-tap array, so one chip's highlight vanished while its row sat in the database. A late `loadUserState` could also overwrite a like the reader had just made. | Fixed · CODE ONLY |
| `A3-28` | `/feed` merged the editorial seed posts in production. Invisible today only because the seeds share ids with their database rows — past 24 live posts the seed copies re-enter at the bottom with `likes: 0` and no author, contradicting the same post on `/post/[id]`. | Fixed · CODE ONLY |
| `A3-29` | `/search?intent=add` instructed readers to "use **Share Insight** to publish a structured knowledge pill" — a control that no longer exists by that name, and a fifth noun. | Fixed · CODE ONLY |

## P3

- **`A3-30`** `safeReturnPath` now parses instead of prefix-matching. `/\evil.com` and a
  tab-prefixed form both resolve to an external origin under WHATWG parsing. **Not exploitable
  today** — both production sinks concatenate onto a fixed origin — but it was one refactor
  away from an open redirect. Fixed.
- **`A3-31`** `A2-23` closed: the `/explore` search ran `setInterval(syncFromDom, 120)` for as
  long as the page was open — eight wakeups a second on the first screen after login — and
  rebuilt three listeners and the timer on **every keystroke**, because the effect depended on
  `query`. The poll stays (it is what catches an autofill that fires no input event, and a
  synthetic value change has already caused one false alarm here); the last value moved to a
  ref so the effect runs once, and the interval is 500 ms behind the real events. Fixed.
- **`/api/health`** queries the database on every request with `Cache-Control: no-store` and
  no rate limit, so a stranger can drive unbounded queries through it. The query is
  `select id from books limit 1`, so the cost is small — **flagged, not fixed**, because a
  health endpoint that caches is a health endpoint that lies during an incident, and that is
  your call. One line if you want it: `s-maxage=5`.
- **`/search` is in the sitemap** and discussion permalinks are not, although they render
  `index, follow` and are the one artifact designed to travel. Growth note, not a bug.

---

## Backend and data — what I could enumerate

**Both pending migrations are applied. VERIFIED live.**

`20260813000000` (narrow public profile columns):

```
GET /rest/v1/profiles?select=id,username             -> 200
GET /rest/v1/profiles?select=id,username,name,bio,avatar_url -> 401  42501
GET /rest/v1/profiles?select=auth_user_id            -> 401  42501
GET /rest/v1/profiles?select=is_moderator            -> 401  42501
GET /rest/v1/profiles?select=*                       -> 401  42501
```

The moderator roster and the `auth.users` UUID map are no longer public. `A2-27` is closed.

`20260812000000` sections 2 and 4:

```
POST /rest/v1/analytics_events  [2 rows, anonymous]
-> 400  22023  "Anonymous analytics accepts one event per request"
POST /rest/v1/analytics_events  {target_type: 60 chars}
-> 400  23514  analytics_events_shape
```

**Section 1 — the moderator self-promotion hole — is applied by inference, not by
measurement.** The Supabase SQL editor runs a script as one transaction, and section 2's
effects are live, so section 1 (which precedes it in the same file) must have run. I hold
only the anon key, so I cannot read `has_column_privilege`. **Run this and read the row:**

```sql
select has_column_privilege('authenticated','public.profiles','is_moderator','UPDATE')
  as authenticated_can_write_is_moderator;   -- must be false
```

**PostgREST embeds still work under the column-level grant** — I checked, because it was the
obvious way for that migration to have broken `/admin/reports` and the reply inbox:

```
GET /rest/v1/discussion_posts?select=id,author:profiles(name,username) -> 200
GET /rest/v1/discussion_posts?select=id,author:profiles(*)             -> 401
```

Every profiles query in `src/` stays inside the granted columns. No `select("*")` on profiles
anywhere; `avatar_url` is never read.

**What an anonymous caller can read, enumerated table by table** (VERIFIED, row counts as of
the audit):

```
readable:  books 394 · genres 20 · book_genres 531 · discussion_posts 50 ·
           discussion_comments 1 · likes 6 · follows 5 · post_awards 31 ·
           knowledge_posts 5 · book_recommendations 4 · reading_paths 5 ·
           reading_path_books 24 · editorial_picks 5 · badges 7 · useful_reactions 5 ·
           perspective_posts 0 · user_badges 0 · book_chapters 0 · book_concepts 0 ·
           book_ideas 0 · knowledge_connections 0 · reading_progressions 0
closed:    profiles (column-limited) · saved_books · saved_insights ·
           saved_knowledge_posts · followed_discussions · reports ·
           analytics_events · book_reader_status
```

**One upsert I chased and cleared.** `useful_reactions` has both the UPDATE grant and an
UPDATE policy (`20260714020000:83`), so `post-actions.tsx:346` is safe — unlike the four
tables that were bitten. `likes` and `follows` likewise. I am recording this because the
pattern has cost this project three dead features and the next auditor will suspect it again.

**I wrote no rows to production.** Both analytics probes were rejected (400) before any
insert, so there is nothing for you to clean up this time.

---

## Four decisions that are yours

### 1. `/explore` shows the same six books twice — VERIFIED, not fixed

Read out of the live page:

```
"Books to Compare"    Atomic Habits · The Psychology of Money · Deep Work …
"Worth Returning To"  Atomic Habits · The Psychology of Money · Deep Work …
```

Identical, in the same order. `getMostDiscussed()` sorts by `discussionCount` and
`getMostSaved()` by `saveCount`; every catalog book is built with both set to `0`
(`data.ts:792`), every comparator returns 0, `Array#sort` is stable, and `withFallback`
appends nothing new — so both return the catalog in declared order. Editor's Picks shares five
of the same six. **The main discovery page shows one shelf of content three times under three
different promises.**

I did not fix it because every fix changes what a shelf claims, and that is your copy. Three
options:

- point them at selectors with real orderings you already authored —
  `getHiddenGems()` and `getBeginnerEssentials()` — and retitle to match;
- keep the titles and drop one shelf until the counts are real;
- leave it and accept that the first screen after login repeats itself.

### 2. "Good evening" is hardcoded

`explore/page.tsx:51`. It says Good evening at 7am. Any fix is either a hydration risk
(server renders one time, client another) or a copy change, so it is yours. The safe version
is a client-only greeting with a neutral first paint, or a line that makes no time claim.

### 3. Is a feed note a different object from a perspective?

Noun counts from the live text:

| Screen | perspective | insight | thread | discussion | note | post |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 1 | 0 | 0 | 0 | 0 | 0 |
| `/explore` | 23 | 3 | 0 | 3 | 0 | 1 |
| `/book/sapiens` | 13 | 1 | 1 | 3 | 0 | 1 |
| `/feed` | 1 | 0 | 0 | 1 | 4 | 5 |
| `/profile/booksphere-team` | 1 | 4 | 0 | 0 | 0 | 0 |

`/feed` still uses "post" and "note" for a third object, and the profile page calls them
"contributions". A stranger cannot tell whether a feed note is a different thing from a
perspective. That is a product decision, not a copy one. The editorial blurbs in `data.ts`
(`A2-05`) are still untouched and still yours.

### 4. The starter comments, if you want them back

Covered in `A3-01`. One-line revert, but give them real rows.

---

## Verification run after every batch

| Batch | commit | typecheck | lint | audit:content | build |
| --- | --- | --- | --- | --- | --- |
| Counts, follow refresh, comment likes | `8daee68` | 0 | 0 | 0 | 0 |
| Zombie post, double publish, composer nouns | `69a382c` | 0 | 0 | 0 | 0 |
| Saved shelf, profile robustness | `da3b45e` | 0 | 0 | 0 | 0 |
| Username nav, notifications | `064c779` | 0 | 0 | 0 | 0 |
| Action-bar nouns | `07ebbc6` | 0 | 0 | 0 | 0 |
| Explore search poll | `eeed855` | 0 | 0 | 0 | 0 |
| Fabricated comments | `f4c33e6` | 0 | 0 | 0 | 0 |
| Regressions in my own fixes | `afc27f9` | 0 | 0 | 0 | 0 |
| Unreviewed-file sweep | `ea0b355` | 0 | 0 | 0 | 0 |

Every gate was green on the commit that shipped the count regression described below. Green
gates still mean only that it compiles.

---

## Corrections

**Two of my own fixes today were wrong, and an adversarial re-read caught them before you
did.** Recorded because "the fix was green" is how three dead features shipped here.

1. The new count baseline broke on `router.refresh()`. `FollowButton` now calls it and sits on
   the same card as `PostActions`, so a refresh handed the component a fresh server total
   while the client state survived — and the count went one high again, on every card.
   Fixed by resetting the delta when the totals prop changes.
2. The offline-preview branch seeded that baseline from `localStorage`, where the totals come
   from the static catalog and never contained a local like — making a previously-liked post
   render one **low**. A straight regression from correct to wrong.
3. One "the reader has acted" flag covered like, save and follow together, so tapping Save
   inside the load window abandoned the other two for the life of the mount.
4. `toggleUsefulness` took a shared lock that silently swallowed chip taps during any other
   write, on chips with no disabled state.
5. `setPublishing(true)` sat outside the `try/finally`, so a throw would have left Share dead.

**And one claim I made in a commit message today is wrong.** `f4c33e6` says the fabricated
comments sat there "for more than twenty seconds — sampled at 6, 8, 10 … 20 seconds". That
measurement is unreliable: `document.visibilityState` in my browser harness reported
`"hidden"` for the whole session, which starves React's scheduler, and the
`discussion_comments` request fired within ~100 ms of every forced paint and completed in
105 ms. **A real user with a visible tab would not have waited twenty seconds.** The finding
itself does not depend on it — the fabricated comments were the server-rendered initial state,
so they were in the HTML from first paint — but the duration was my instrument, not your
product. This is the seventh time on this project that a tool's behaviour has been mistaken
for the app's.

---

## What is still unverified, and why

| What | Why |
| --- | --- |
| Every fix in `A3-02` … `A3-12`, `A3-16` … `A3-29` | They are behind sign-in and I cannot sign in |
| Creating a perspective, reporting, saving a book, editing a profile, deleting | Same — still zero rows for creating a perspective, VERIFIED |
| `20260812` section 1 (the moderator hole) | Needs SQL access; the SQL to confirm it is above |
| `reports`, `saved_*`, `followed_discussions` row counts | Closed to anonymous callers, correctly |
| Two-account ownership rules | Needs two accounts |
| Email deliverability (`F-01`) | Needs the domain |
| Real-device rendering | 375 px headless only, and the tab reported itself hidden throughout |
| Whether `/admin/reports` and `/admin/analytics` render with real rows | Needs a moderator session |

---

## Still open from earlier audits, unchanged

`F-01` no verified sending domain · no Vercel spend cap · no point-in-time recovery on the
Supabase free tier · monitoring that is visibility, not alerting · a support inbox nobody has
confirmed receives · one moderator with no stated cadence · no test suite · `F-10` missing
records answer 200 (mitigated by `noindex`, VERIFIED on 6 URLs) · `A2-28` implicit auth flow
with `localStorage` sessions.

`/api/health` returns `200 healthy`, `database: reachable` — VERIFIED.
