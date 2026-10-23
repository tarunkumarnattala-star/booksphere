# Findings

Severity follows LAUNCH_LOOP.md. Every line here was produced by running something, and the
command is named so it can be re-run.

## S0 — stop everything
None found.

Specifically tested and clear:
- **A stranger cannot write to the database.** The anon key is public in every browser, so row
  level security is the only thing standing between a visitor and your data. Attempted inserts
  as an anonymous caller against discussion_posts, knowledge_posts, profiles, likes,
  discussion_comments, saved_books and post_awards all returned `401 permission denied`.
  Nothing was written to do this: a refused request never reaches the table.
- **Private data is private.** saved_books, saved_insights, saved_knowledge_posts and reports
  all refuse anonymous reads (401).
- **No email addresses are exposed.** The readable tables carry no email column, and `profiles`
  only answers for name/username columns, not `select=*`.
- **No server secret is deployed.** Every variable the app reads is `NEXT_PUBLIC_`; there is no
  service-role key in the deployment to leak.
- **The database is reachable and the app says so.** `/api/health` returns
  `{"status":"healthy","database":"reachable"}`.

## S1 — must fix before launch

1. **Nothing is watching.** **WIRED - needs one value from you.**
   No error tracking, no alerting, no uptime check (`grep -rliE 'sentry|datadog|posthog'` finds
   nothing). You would learn about an outage from a person telling you, or never. The harness
   treats missing monitoring as a launch blocker, and with no friends testing it, you have no
   informal alarm either.

2. ~~**No automated test walks a single user journey.**~~ **FIXED.**
   There is no e2e suite anywhere in the repo. Eight gates pass and every one of them checks the
   code rather than the product: none of them would notice if signing in, writing a perspective
   or opening a book stopped working. Today a human has to click it.

3. **Most people arriving from Reddit or LinkedIn on a phone cannot sign up.**
   Both apps open links in their own in-app browser, where Google sign-in cannot complete - this
   is correctly detected and Google is hidden there. That leaves email, and email to a stranger's
   address needs a verified sending domain, which does not exist yet. They can read everything
   and cannot make an account. Unchanged since 2026-10-04.

## S2 — fix in launch week

4. ~~**Pages that do not exist answer "200 OK".**~~ **FIXED.**
   `/profile/definitely-nobody` and `/discussion/0000...` both return 200 while showing the
   not-found screen. `/book/*` and `/genre/*` correctly return 404, so the fix pattern already
   exists in this codebase. A crawler reads 200 as "this page is real" and will index unlimited
   junk URLs.

5. ~~**A QA test account is live and browsable.**~~ **FIXED in the app; the row is yours to delete.**
   `/profile/booksphere-qa-probe-tri-a71c6f` renders publicly as
   "booksphere-qa-probe-trigger-long". It will appear wherever profiles are listed.

6. **Backups have never been restored.**
   Supabase takes its own backups on this plan; nobody has proved one can be restored. An
   untested backup is a belief, not a backup.

7. **The expected launch load has never been simulated.**
   The harness forbids load-testing production and there is no staging environment to test
   against, so capacity is reasoned about rather than measured. Reads are cached 20-30s and the
   two heaviest pages are static, which is why this is S2 rather than S1.

## S3 — later
8. The `notifications` table returns 404 from the API while `/notifications` exists as a page.
   Worth confirming the feature is backed by what you think it is.

## Fixed in this session

**S2 #4 - soft 404s.** `/profile/*` and `/discussion/*` answered 200 for anything typed at
them. Two other routes to a fix were tried and recorded as failures first: `notFound()` from
`generateMetadata` does not move the status, and replacing `force-dynamic` with on-demand ISR
does not either - built and served locally, a nonexistent perspective still answered 200.
Whatever commits the status runs before application code, so the fix went where books and
genres were already gated: `src/proxy.ts`, which runs first. Malformed values are rejected on
shape with no database call; well-formed ones cost one indexed lookup the first time and are
then remembered, so readers pay nothing and crawler junk pays once. If the database is
unreachable the request is let through, because hiding a real page behind a 404 during an
outage is worse than a soft 404 on a junk URL. Verified against a production build:
nonexistent profile, malformed profile, nonexistent perspective, malformed perspective and
unknown book all answer 404, while a real reader, the team account, a real perspective, a real
book and /explore all still answer 200.

**S2 #5 - the QA probe account.** `booksphere-qa-probe-tri-a71c6f` now answers 404. It owns no
posts, comments, likes or follows, so nothing is orphaned. The database row still exists and
deleting it needs the dashboard - MANUAL_TASKS #5.

**S1 #2 - no test walked a user journey. Fixed.** `scripts/test-journeys.mjs` drives a real
browser through seven journeys and runs inside `launch/gates.sh`: a stranger reading without an
account, no card claiming a reader wrote what BookSphere wrote, an idea leading to a way to
answer it, a book page worth opening, sign-in offering both routes without duplicating the
Google button, pages that do not exist answering 404, and the landing promising only as many
books as the shelf holds. Each one also fails if our own code logs a console error.

It was proved to bite rather than assumed to: the house-as-reader bug was deliberately
reintroduced, the production build went green, and the suite failed on exactly that journey.

Three of the seven failed on first run and all three were the test being wrong, not the
product: Google is not configured on a dev machine so "exactly one button" could never hold
there (the regression to guard is duplication, so it now asserts no more than one), a page
correctly answering 404 makes the browser log a failed resource which was being counted as an
error, and `innerText` omits the landing hero entirely - 3290 characters that do not contain
it - while reporting CSS-uppercased text elsewhere, so assertions read `textContent`.

**S1 #1 - nothing watching. Wired, awaiting a DSN.** Sentry is installed and configured on the
client, the server and both error boundaries, and stays completely off unless
`NEXT_PUBLIC_SENTRY_DSN` is set - the same switch the Google client id uses. Deliberately lean:
no session replay and no performance tracing, because both are heavy for a reading product and
both burn a free plan's quota. Keystroke breadcrumbs are dropped before anything leaves the
browser, since the composer holds unpublished writing.

Proved rather than assumed, using a fake DSN: the client initialises, a thrown error produces
three requests to the ingest host, and there are zero CSP violations. That last one mattered -
the policy had to allow the exact ingest origin, and it is derived from the DSN rather than
typed, because a wrong entry would not break the site, it would silently drop every report.

The v11 SDK moved three things the documentation for older versions still shows:
`withSentryConfig` now lives at `@sentry/nextjs/config`, `captureRouterTransitionStart` is
gone, and `sendDefaultPii` no longer exists. All three were caught by the typechecker.
