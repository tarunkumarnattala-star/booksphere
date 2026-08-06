# Deferred — what I did not fix, and what it costs you

Seven items. One you excluded, one I could not solve, five I judged not worth the risk tonight.
Ordered by what it costs you, not by finding number.

---

## F-06 — `/explore` ships 826 KB of HTML · **you excluded this**

You said fix everything except this, and you were right to.

**The problem:** the first screen after login serialises far more data than it displays — 826 KB for
7 distinct books, 1.06 s to first byte, 50 RSC push calls. Whole book objects go down the wire when
the components render a title, an author and a cover.

**What it costs you:** a reader on a mid-range phone on 3G waits several seconds on the screen that
has to prove the product is worth their time. On desktop broadband you will never feel it, which is
exactly why it is easy to leave. Fast connections hide it; your real audience will not have one.

**Why deferring is correct:** the fix means changing what the server passes to components across a
page composed of many of them. That is a mechanical change with a wide blast radius and no test
suite behind it (F-11). A page that is slow is survivable. A page that is broken on launch morning
is not.

**When to do it:** first week, once you have real numbers. Analytics now records page views (F-03),
so you will be able to see whether people are actually dropping on `/explore` before you spend two
hours there. Fix what the data shows, not what the audit guessed.

---

## F-04 — no real error monitoring · **partly fixed, deliberately incomplete**

I shipped visibility, not alerting. Errors now land in `analytics_events` and show on
`/admin/analytics`. Nothing pages you, nothing emails you, and errors thrown before React hydrates
are still invisible.

**Why not Sentry:** your rules said no new dependencies without asking, and it needs an account and a
DSN you cannot create in the middle of this pass. Both real constraints, not preferences.

**What it costs you:** you have to look. If something breaks at 9am and you are not watching the
dashboard, you find out from a reader.

**When to do it:** week one. Sentry's free tier is genuinely free at your volume, and it catches the
server-side and pre-hydration failures this approach cannot see.

---

## F-10 — missing discussions return 200 instead of 404 · **unsolved, two failed attempts**

`/discussion/<missing>`, `/post/<missing>` and `/profile/<missing>` render the not-found screen but
answer HTTP 200.

**Two fixes failed in production, and I am recording them so nobody burns the time again:**

1. `dynamicParams = false` — gates prerendered routes only. These routes `await` Supabase, so they
   render dynamically and never consult it. This one is the trap: **it appears to work in dev.** I
   verified it there and was wrong.
2. `notFound()` inside `generateMetadata` — disproven directly. A malformed id that never reaches a
   database lookup still returned 200 in production.

The proxy approach that fixed books and genres does not transfer: those validate against a static
catalog in memory, and a discussion id can only be checked by asking the database, which
`src/proxy.ts` cannot do.

**What it costs you:** search engines may index URLs that do not exist. Close to nothing today —
nothing on the site links to a missing discussion, so the only way to reach one is to type it. It
starts mattering when posts get deleted and old links go stale.

**When to do it:** whenever you next touch that route group, with fresh eyes and a production check
before believing any result.

---

## F-08 — search input has no accessible name · 5 minutes

The `/explore` hero search has a placeholder and nothing else, so a screen reader announces an
unnamed edit field. WCAG 2.2 AA 4.1.2.

Not fixed because your instruction was P0s and P1s, and this is a P2. It is genuinely five minutes —
a visually hidden `<label>` — and I would do it before you post the link anywhere.

---

## F-09 — no skip link · 15 minutes

Keyboard users tab through three navigation regions and long grids before reaching content. WCAG 2.2
Level A 2.4.1. Same reason deferred, same recommendation: do it in the first week.

---

## F-11 — no tests · 2 hours

No `test` script, no test files. Typecheck, lint and build are all that stand between a change and
production.

**What it costs you** is already visible in this session's history: a broken link was found by
crawling 882 links by hand, and a book-to-database join bug was found by comparing 394 rows by hand.
Those are the checks that should be automatic, and every future regression will cost the same manual
sweep.

**Start with two:** `resolveDbBook` (the catalog↔database join, where two real bugs have already
lived) and the slug contract (every catalog book resolves to exactly one database row). Those two
cover the part of the system that has actually broken.

---

## F-12 — privacy policy names one sub-processor · 10 minutes

`/privacy` lists Supabase. Resend handles your readers' email addresses and Vercel handles their
request logs, and neither is named. GDPR-style regimes expect all of them disclosed.

Do this when you buy the domain — you will be editing sender configuration anyway, and it is one
sentence.

---

## The two P0s are yours

**F-01, sending domain** — needs a purchase and DNS records. Nothing I can do from here.

**F-02, nine unexecuted write paths** — needs a signed-in session, which needs F-01 or your own
address. I will diff the tables against the database the moment you have done the clicking.

Neither is deferred in the sense the rest of this file means. They block launch. Everything above is
a judgement about timing; those two are a dependency on you.

---

## Delete a post — still broken, workaround available

**Status:** unresolved after four attempts. The button returns Postgres error `42501`.

**What is known.** Deleting is a soft delete that sets `status = 'removed'`. Creating, editing,
reporting, saving, following, liking and awarding all work; only this fails. The table grant,
the ownership policy and execute on the trigger function were all verified `true` in production.

**Three fixes that did not work, so nobody repeats them:**

1. `.select()` after the update — the select policy is `status = 'published'`, so it asked to read
   back a row it had just hidden from itself.
2. `count: 'exact'` — looks like it avoids that, but PostgREST computes an exact count by reading
   the updated rows. Same wall.
3. Writing with no return at all — still 42501, which rules out the read being the problem and
   means Postgres is refusing the write itself.

**What is needed to finish it:** the message text beside the code. `42501` covers both "permission
denied for table" (a missing grant) and "new row violates row-level security policy" (a WITH CHECK
refusal), and they need opposite fixes. Failed attempts are recorded in `analytics_events` as
`write_failed` events with the full message:

```sql
select metadata->>'code', metadata->>'message', created_at
from public.analytics_events
where event_name = 'write_failed' order by created_at desc limit 5;
```

**What it costs you meanwhile:** a reader who wants a post gone has to ask. One statement removes it:

```sql
update public.discussion_posts set status = 'removed' where id = '<post id>';
```

Scope that by **post id**, not by author — a cleanup written by author on August 6 also removed an
older post from July that was not part of the test set.

**Still to remove before launch:** the temporary diagnostics. `withCode()` in
`src/components/post-actions.tsx` appends the raw Postgres code to error messages readers can see.
It is marked TEMPORARY in the source. The `write_failed` telemetry underneath it should stay.
