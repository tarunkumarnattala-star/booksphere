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

**F-02 — nine write paths never executed.** Needs a signed-in session, which needs F-01 or your own
address. Twenty minutes of clicking, and I will diff the tables against the database afterwards.

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

**Production verification after deploy** is recorded at the bottom of this file once the deploy
lands — a green build is not evidence that the behaviour is right.
