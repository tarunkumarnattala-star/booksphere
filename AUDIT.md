# Pre-Launch Audit — BookSphere

Audited August 6, 2026 against production (`https://booksphere-iota.vercel.app`) and commit `4e204c2`.
Audit only: nothing in this pass was modified except this file.

---

## A. Verdict

**DELAY — by one item, not by a list.**

The engineering is in good shape. Roughly 1,400 automated assertions pass against production with
zero failures, the security model is sound, and the product renders correctly everywhere I could
reach it. That is not the problem.

The problem is that **nobody except you can create an account tomorrow.** Resend has no verified
sending domain, so magic links are delivered only to the address that owns the Resend account.
Every invited reader will request a link that never arrives, and the product will look broken rather
than gated. Nine community write paths have consequently never been executed by a real session, so
posting, commenting, liking, saving and following are unproven — not suspected broken, genuinely
unknown.

A launch where no one can sign up and where the core loop has never been run once is a demo. The fix
is a domain purchase and about thirty minutes of DNS, which is why this is DELAY-by-one-item rather
than DELAY-because-it-is-not-ready.

Ship the moment F-01 and F-02 clear. Everything else on this list can follow.

---

## B. The ten things that will most hurt you

| # | Finding | One-sentence fix | Est. |
| --- | --- | --- | --- |
| 1 | `F-01` No one but you can receive a login link | Buy a domain, verify it in Resend, change the sender | 30 min + purchase |
| 2 | `F-02` Nine write paths never executed by a real session | Sign in once and perform all nine, then diff the tables | 20 min |
| 3 | `F-03` Anonymous visitors generate zero analytics | Allow anon inserts on `analytics_events`, or add a lightweight page-view beacon | 45 min |
| 4 | `F-04` No error monitoring of any kind | Wire Sentry (or equivalent) to the app and to a channel you actually read | 30 min |
| 5 | `F-05` No `og:image` on any page | Add a static OG image, or generate per-book with `next/og` | 30 min–2 hr |
| 6 | `F-06` `/explore` ships 826 KB of HTML to render 7 books | Stop passing whole book objects into client props; send only what renders | 1–2 hr |
| 7 | `F-07` Six names for the same object on the book page | Pick one word for a contribution and use it everywhere | 45 min |
| 8 | `F-08` Search input has no accessible name | Add a visually hidden `<label>` or `aria-label` | 5 min |
| 9 | `F-09` No skip link | Add a skip-to-content link as the first focusable element | 15 min |
| 10 | `F-10` Soft 404s on `/discussion`, `/post`, `/profile` | Known limitation; two fixes already failed — do not retry blind | — |

---

## C. Findings

| ID | Sev | Area | Evidence | What's wrong | Why it matters | Fix | Effort | Risk of fixing now |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | **P0** | Auth / delivery | Resend has no verified domain; confirmed with operator | Magic links deliver only to the Resend account owner's address | Every invited reader hits a link that never arrives. This is the launch. | Buy domain, verify in Resend, update sender | 30 min + purchase | None — config only |
| F-02 | **P0** | Community writes | `LAUNCH_GATE.md` "Community Writes" table: 9 rows CODE ONLY | No write path has ever run under a real session | Posting, commenting, liking, saving, following are unproven. Two of today's bugs were invisible until the database was checked. | Sign in, perform all nine, diff tables | 20 min | None — verification only |
| F-03 | **P1** | Measurement | `schema.sql:389` `for insert to authenticated`; live anon insert → **401** | Anonymous visitors generate no events at all | On day 2 you cannot answer how many arrived, how many clicked Join, or where they bounced. The entire acquisition funnel is dark; only post-activation is measured. | Allow anon insert with `user_id is null`, or add a server-side page-view beacon | 45 min | Low — additive policy |
| F-04 | **P1** | Ops | No Sentry/Bugsnag/Rollbar/Datadog in `package.json` or `src` (the earlier "rollbar" match was inside `scrollbar`) | Production errors are invisible | If something breaks at 9am tomorrow you find out from a user, or never. `error.tsx` logs to the browser console only. | Add Sentry; route to a channel you read | 30 min | Low |
| F-05 | **P1** | Growth | `og:image` count is 0 on `/`, `/book/sapiens`, `/discussion/<id>` | Shared links render with no image card | Discussion permalinks were just built so perspectives can travel. Without an image they travel badly — bare links get materially fewer clicks. | Static OG image now; per-book `next/og` later | 30 min–2 hr | Low |
| F-06 | **P1** | Performance | `/explore` = 825,942 bytes HTML, 1.06 s, but only 7 distinct books and 95 images rendered; 50 RSC push calls | Far more data is serialised into the RSC payload than the page displays | Persona 1 (mid-range phone, 3G) waits seconds before anything is usable. This is the first screen after login. | Pass only the fields the components render, not whole book objects | 1–2 hr | **Medium — do not attempt tonight** |
| F-07 | **P1** | Copy / IA | `src/app/book/[id]/page.tsx` — "Share Insight", "New perspective", "Ask readers", "Open threads", "Reader insights", "Reader views" | Six names for one object on one screen | The product's whole pitch is conceptual clarity. A first-time reader cannot tell whether an insight, a perspective and a thread are three things or one. | Choose one noun ("perspective") and apply it | 45 min | Low — copy only |
| F-08 | **P2** | Accessibility | `/explore` hero search input: no label, no `aria-label`, placeholder only | Screen reader announces an unnamed edit field | WCAG 2.2 AA 4.1.2. Persona 5 cannot tell what the field is for. | Visually hidden `<label>` | 5 min | None |
| F-09 | **P2** | Accessibility | No skip link found in the DOM | Keyboard users tab through 3 navs and long grids to reach content | WCAG 2.2 Level A 2.4.1. | Skip-to-content link | 15 min | None |
| F-10 | **P2** | SEO | `/discussion/<missing>`, `/post/<missing>`, `/profile/<missing>` all return **200** | Dead links answer 200 with the not-found screen | Search engines may index nonexistent pages. Minor while the site has no dead links. | Unresolved. `dynamicParams=false` and `notFound()` in `generateMetadata` both failed in production. | — | — |
| F-11 | **P2** | Testing | No `test` script; zero test files | Nothing but CI's typecheck/lint/build guards a change | Every regression is caught by hand. Today that meant a full link crawl to find one broken link. | Add tests for `resolveDbBook` and the slug contract first | 2 hr | Low |
| F-12 | **P3** | Privacy | `/privacy` lists Supabase only | Resend and Vercel receive personal data and are not named | Sub-processor disclosure is expected under GDPR-style regimes. | Name all three | 10 min | None |

### Verified sound — not findings

Recorded so they are not re-audited: RLS ownership (every update/delete policy checks
`auth_user_id = auth.uid()`, updates carry `with check`, so no IDOR at the data layer); the cover
endpoint (input caps, catalog allowlist, 30-day cache, upstream timeouts — cost is bounded); no
fabricated metrics anywhere (all seeded counts are `0`, displayed counts hydrate from real
aggregates); global `:focus-visible` ring at `globals.css:99`; security headers complete (CSP, HSTS
preload, `X-Frame-Options: DENY`, nosniff, referrer, permissions); heading order clean with one `h1`;
every image has `alt`; no unnamed icon buttons; landmarks and `lang` present; rate-limit triggers
active on posts, comments and reports.

---

## D. Concept and retention

**Is it differentiated?** Yes, and precisely. The landing page states it better than most products
ever manage: *ratings tell you if people liked the book, summaries tell you what the author said,
BookSphere shows what happened next.* The scarce asset is a reader's account of applying an idea —
especially one that failed. That cannot be synthesised, which is exactly why it is defensible against
the real competitor, which is not Goodreads but a chat model.

The composer now leads with lived outcomes, and the empty-book prompt asks *what did you try that did
not work* — the single most valuable and least-collected thing on the internet. The concept and the
interface now argue for the same thing, which was not true this morning.

**Does anyone come back?** Not yet, and this is the honest weakness. There is a reply inbox, so
writing has a return path — but it only pulls someone back if they are already visiting, because
email notifications need the same domain as F-01. There is no digest, no streak, no unfinished state
pulling a reader forward. The loop is: write something → someone replies → you return. Every link in
that chain except the first is currently unproven.

**The cold-start position is fine and you are right about it.** 51 discussions across 20 books, 50 of
them editorial. Seeding under a labelled account is how this category starts; the distinction that
matters is that yours are labelled BookSphere Team rather than invented people. Keep that line — it is
the difference between seeding a conversation and staging one, and it is unrecoverable once crossed.

**What would change the odds most:** the first ten *real* posts. Not more features. The product is
now good enough to hold a conversation; it does not yet have one.

---

## E. Could not verify

| What | Why | What I would need |
| --- | --- | --- |
| All nine community write paths | No account can sign in | A signed-in session |
| Two-account ownership rules | Same | Two accounts |
| Moderation and analytics with real data | Requires a moderator session | Your signed-in confirmation (you reported pages load) |
| Real-device rendering | Tested at 375 px headless only | A physical phone |
| Email deliverability and inbox placement | No verified domain | F-01 resolved |
| Payments | None exist | n/a |
| Keyboard traversal of full flows | Automated `.focus()` does not trigger `:focus-visible`; a false positive was produced and discarded | Manual keyboard pass |

---

## F. Launch-day runbook

**Before flipping live**
1. Resolve F-01. Nothing else matters until a stranger can receive a login link.
2. Run F-02 yourself, then ask me to diff the tables.
3. Add error monitoring (F-04) — otherwise you are flying blind on the one day it matters most.

**What to watch, in order**
- `/api/health` — must stay `200 healthy` with `database: reachable`.
- Supabase → Authentication → Users — is the count rising? If arrivals happen and this stays flat,
  email delivery is failing, which is the most likely failure and the hardest to see.
- Supabase → Authentication → Logs — rate-limit rejections appear here first.
- `discussion_posts` and `discussion_comments` row counts — the only true signal that the product
  is being used. **Do not judge this from the interface**: this app reports success optimistically,
  and three of today's bugs looked fine on screen while writing nothing.

**What breaks first, most likely in this order**
1. Email delivery — rate limits, spam placement, unverified domain.
2. A write path that has never been run.
3. Supabase free-tier limits under unexpected load.

**Rollback**
Every change today is an isolated commit on `main`; `git revert <sha>` and push redeploys in about
two minutes. Database migrations are additive — the slug column, the moderator flag, the analytics
policy — so a code rollback does not require a database rollback. Vercel's dashboard can promote any
previous deployment instantly if a revert is too slow.

---

## Findings by severity

- **P0: 2** — F-01, F-02
- **P1: 5** — F-03, F-04, F-05, F-06, F-07
- **P2: 4** — F-08, F-09, F-10, F-11
- **P3: 1** — F-12

**Total: 12**
