# Fixed — Pre-Launch Pass 2

Four P1 findings fixed in four batches. Both P0s are yours, not mine — see the end.
Worked on `main` deliberately: your verification loop is push → deploy → check production, and a
branch would have broken that tonight. Every batch is an isolated commit and reverts cleanly.

---

## F-03 — Anonymous visitors generate no analytics · `5b91283`

**Was:** two separate faults, and fixing either alone would have changed nothing.
The insert policy on `analytics_events` was `to authenticated`, so any event before sign-in failed
with 401 and was swallowed by the fire-and-forget call in `analytics.ts`. And nothing instrumented an
arrival at all — every existing event came from a deliberate action, all of which happen after
sign-in.

**Now:** anonymous inserts are allowed with a null `user_id`, and a `PageViewTracker` in the root
layout records one `page_viewed` event per pathname.

**Why it mattered:** on launch day the only questions worth asking are how many arrived, how many
clicked through, and where the rest stopped. None of them had data behind them.

**Guardrails:** anonymous rows must have a null `user_id`, so an anonymous caller cannot attribute an
event to a real account. A check constraint bounds `event_name` to 80 characters and `metadata` to
2000, because a table writable by unauthenticated callers is otherwise free storage. Page views
record the pathname only — search params carry reader queries and do not belong in an events table.

**Verified:** typecheck, lint, build all exit 0. **Needs the migration run** — see the checklist.

---

## F-05 — Shared links had no social card · `a9f01e1`

**Was:** no `og:image` on any page — confirmed 0 on `/`, `/book/sapiens`, and a discussion permalink.

**Now:** two generated cards. A site card carrying the landing promise, and a per-discussion card
carrying the perspective itself — its type, title, author and book.

**Why it mattered:** discussion permalinks were built so a single perspective could travel. A bare
link travels badly, so the feature and its distribution were pulling against each other.

**Notes:** built with `next/og`, which ships inside Next — no new dependency, per your rules. The
Twitter card moved from `summary` to `summary_large_image`; leaving it would have shown a thumbnail
beside text rather than the card.

**Verified:** both routes return `image/png`, 62 KB and 56 KB.

---

## F-07 — Six names for one object · `50247b1`

**Was → Now**, user-visible text on the book page:

| Before | After |
| --- | --- |
| Share Insight | Share a perspective |
| New perspective | Share a perspective |
| Ask readers | Ask a question |
| Reader insights *(tab)* | Perspectives |
| Reader views *(tab)* | Perspective map |
| Open threads *(tab)* | *(removed — see below)* |
| "Open a thread to see the summary, question, application, disagreement, or lesson behind the book." | "Open a perspective to see what a reader applied, questioned, challenged, or learned." |

**A second bug surfaced while doing it.** Unifying the labels revealed that on a book with no
knowledge preview, the Explore row rendered three tabs pointing at two destinations — the first and
third were both `#discussions` under different names, so a reader clicking what looked like a third
option landed where they had already been. Both preview anchors only exist when the book has a
preview. The row now renders two tabs in that case and three otherwise.

**Verified in the browser, both states:** no duplicate labels, no duplicate targets, every anchor
resolves in the DOM.

---

## F-04 — No error monitoring · `6042439`

**Was:** a route failure existed only in the reader's own console. A page could break for everyone
and leave no trace an operator would ever find.

**Now:** the route error boundary records message, digest and path through `analytics_events`, which
surfaces in `/admin/analytics`. A `global-error.tsx` was added as well — `error.tsx` cannot catch a
failure in the root layout, and that case previously fell through to Next's unstyled default. The new
boundary renders its own `html` and `body` (the layout that provides them is what failed) and imports
nothing beyond React, because a boundary that depends on the app fails with it. It carries the
support address so a reader who hits it has somewhere to go.

**Be clear about what this is:** visibility, not alerting. Nothing pages you. You have to look. A
real monitoring service is the right answer and is recorded in `DEFERRED.md`.

**Verified:** typecheck, lint, content audit, build all exit 0. 835 static pages.

---

## Not fixed — both P0s, because neither is mine

**F-01 — no verified sending domain.** Needs a purchase and DNS records. This is the launch: until
it clears, an invited reader requests a link that never arrives and concludes the product is broken.

**F-02 — write paths unproven.** Narrowed on August 6 by diffing every table. Four of the nine
already have a real row behind them (sign up, comment, like, follow — all written August 5 by the
`booksphere-qa-probe-tri` account), so the audit's "nine unproven" was too pessimistic. Five remain,
and two of those have never succeeded even once: **creating a post** (all 51 rows in
`discussion_posts` are editorial seeds, none written through the composer) and **reporting a post**
(`reports` is empty — zero rows, ever, despite the moderation chain shipping this week). Details and
order in `LAUNCH_CHECKLIST.md` step 3.

Everything I built tonight is downstream of these. Analytics will record arrivals from people who
cannot sign up; social cards will spread links to a product nobody can join.

---

## Verification run after every batch

| Batch | typecheck | lint | build | extra |
| --- | --- | --- | --- | --- |
| F-03 | 0 | 0 | 0 | — |
| F-05 | 0 | 0 | 0 | both OG routes return real PNGs |
| F-07 | 0 | 0 | 0 | browser check, both book states |
| F-04 | 0 | 0 | 0 | content audit 0; 835 pages |

Each batch is its own commit, so any one of them can be reverted without touching the others.

## Verified in production after the deploy landed

A green build is not evidence the behaviour is right, so all four were checked again on
`booksphere-iota.vercel.app`.

| Finding | Check | Result |
| --- | --- | --- |
| F-03 | `page_viewed` present in the deployed layout chunk | shipped |
| F-03 | anonymous insert with null `user_id` | **201** |
| F-03 | anonymous insert attributed to a real account | rejected by RLS, not by a missing grant |
| F-03 | oversized `event_name` and `metadata` | both rejected, `23514` |
| F-03 | anonymous select / update / delete on the same table | 401, 401, 401 — write-only, as intended |
| F-03 | anonymous insert into `profiles`, `discussion_posts` | 401 both — the grant did not widen anything else |
| F-03 | end-to-end on the live site, signed out | client posts `{"user_id":null,"event_name":"page_viewed",…}` → **201** |
| F-04 | `client_error` present in the deployed error chunk | shipped |
| F-05 | `/opengraph-image` | 200, `image/png`, 62 KB |
| F-05 | `/discussion/<id>/opengraph-image` | 200, `image/png`, 49 KB |
| F-05 | both cards opened and read | render correctly — the post card shows INSIGHT, the perspective's own title, "BookSphere Team · The Hard Thing About Hard Things" |
| F-05 | `og:image` and `twitter:card` on the permalink | present, `summary_large_image` |
| F-07 | six old labels on `/book/sapiens` | all 0 occurrences |
| F-07 | new labels | "Share a perspective" ×4, "Perspectives" ×2, "Perspective map" ×2 |

All four findings are closed in production.

**On how F-03 was confirmed.** The browser's network recorder showed no request to Supabase at all,
which looked like the tracker silently failing. It was not — the recorder does not capture
cross-origin fetches. Patching `window.fetch` in the page showed the real traffic: a POST carrying
`user_id: null` returning 201, from a session with no auth token. Absence of evidence in a tool is
not evidence of absence, and this is the fifth time in this project that a tool's silence read as a
bug.

**A bonus the probe surfaced:** `page_viewed` was never the only event being rejected. Existing
product events that fire before sign-in — `onboarding_shown` among them — were failing the same way
and now succeed. The funnel was darker than the audit said.

**One correction.** I predicted the migration kept rolling back because an existing row violated the
new size constraint. `rows_that_broke_it` came back `0`, so that was wrong — no row ever broke it.
Why the first two runs had no effect is unexplained; the likeliest reading is that the paste ran in
a different editor tab than the one showing results. The `not valid` change is still worth keeping,
since it removes that failure mode permanently, but it is not what fixed this.

---

## Found by clicking, not by auditing — August 6

Five more bugs surfaced within minutes of walking the app as a real signed-in reader. None
were caught by typecheck, lint, build, three green audits, or ~1,400 production assertions.
Recorded because the pattern matters more than the individual fixes.

| Bug | Effect | Commit |
| --- | --- | --- |
| **Every post attributed to the house account** | `getProfileById` ended in `\|\| profiles[0]`, which is BookSphere Team. Every real reader's id is a database uuid and never in the seeded list, so every perspective displayed under the editorial name — and the Follow button and profile link beneath it pointed there too. | `6d387f4` |
| **Reporting permanently broken** | `.upsert()` compiles to `INSERT ... ON CONFLICT DO UPDATE`, which Postgres refuses to plan without UPDATE privilege. `authenticated` has insert/select/delete on `reports` and no update. Zero rows had ever been written. Fixed with a plain insert, treating 23505 as "already reported" — granting update would have let a reporter rewrite a report after a moderator read it. | `05c409f` |
| **Saving a feed post permanently broken** | `saved_knowledge_posts` has the identical grant shape and the identical upsert. Never worked. Would not have been found by clicking, since it is on another screen. | `05c409f` |
| **Short posts could never be edited** | The edit path demanded title ≥ 8 and body ≥ 80; the composer and the database require 4 and 20. Anything published between those bounds was frozen forever, rejected client-side before any update was attempted. | `9fdb42b` |
| **The whole UPDATE path was refused** | Editing and deleting both failed while creating worked. Repaired the table grant, the ownership policy and execute on the before-update trigger function together, rather than spend another round trip identifying which. Editing works now; deleting does not. | `20260810000000` |

**The lesson worth keeping.** Three of these were dead for every user, not merely untested, and
each looked identical from the outside to a feature nobody had tried yet. An empty table is not
evidence of an unused path. Walk the product as a user before believing any audit, including mine.
