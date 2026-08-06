# Launch checklist — the steps only you can do

Everything here needs an account, a card, a password or a human decision. I cannot do any of it from
here. Ordered so each step unblocks the next.

Nothing on this list is optional except where marked. Work top to bottom.

---

## 1. ~~Run the pending migration~~ — DONE

`20260809000000_anonymous_analytics_events.sql` is applied and verified. Anonymous visitors now
record events; the live site posts `user_id: null` page views and gets 201 back while signed out.

It took three attempts, and the first two reported success while changing nothing. That is the
lesson worth carrying into the rest of this list: **the editor's green banner is not evidence.**
Every migration from here should end with a `select` that prints the state you expect, and you
should read the row.

---

## 2. Buy the domain and verify it in Resend — 30 minutes plus the purchase

This is F-01. It is the launch.

1. Buy the domain.
2. In Resend → Domains → Add domain, add it.
3. Resend gives you DKIM, SPF and a return-path record. Add all of them at your registrar.
4. Wait for Resend to show **Verified**. Usually minutes, occasionally hours.
5. In Supabase → Authentication → Emails → SMTP, change the sender address to one at the new domain.
6. In Vercel, update `NEXT_PUBLIC_APP_URL` to the new domain, then **redeploy** — `NEXT_PUBLIC_*`
   values are baked in at build time, so changing the variable alone does nothing.
7. In Supabase → Authentication → URL Configuration, add the new domain as Site URL and to the
   redirect allow-list.

You offered me DNS access. Once the records are in and it says Verified, I can take it from there.

**Confirm it worked:** request a magic link at an address that is **not** your Resend account email.
Today that mail is silently dropped. If it arrives, F-01 is closed. Do not test with your own
address — that works already and proves nothing.

---

## 3. Walk the nine write paths — 20 minutes

This is F-02, and it needs step 2 done first, or your own address as a stand-in.

Sign in and do each of these once, for real:

- [ ] Sign up as a brand-new account
- [ ] Create a discussion post
- [ ] Comment on a post
- [ ] Like a post
- [ ] Save a book
- [ ] Follow another reader
- [ ] Edit your profile
- [ ] Report a post
- [ ] Delete your own post

Tell me when you have finished and I will diff every table against the database.

**Why this one matters more than it looks:** two of the bugs found today were completely silent —
the interface showed success while nothing was written. This app reports optimistically. The screen
is not evidence; the database is.

---

## 4. Set a Vercel spend limit — 5 minutes

Vercel → Settings → Billing → Spend Management. Set a hard cap and an email alert at something you
could absorb without it ruining your week.

You have told me money is tight. A launch link that spreads further than expected, or a scraper
hitting image optimisation, becomes a bill with no ceiling on it by default. Set the cap before the
link goes out, not after.

Do the same for Supabase if the project is on a paid plan.

---

## 5. Turn on database backups — 10 minutes

Supabase free tier keeps **no** point-in-time recovery. If a bad migration or a mistaken delete goes
through, the 394-book catalog and every reader post are gone with no way back.

Either upgrade to a plan with PITR, or — if that is not affordable this week — run a `pg_dump`
before every migration and keep the file somewhere off your laptop. Manual and unglamorous, but it
is the difference between an incident and an ending.

At minimum, do this **before** running the migration in step 1.

---

## 6. Make the support inbox real — 10 minutes

`booksphere.support@gmail.com` is on the error screens, in the footer and in the privacy policy.

- [ ] Confirm you can actually receive at it
- [ ] Send yourself a test message and confirm it arrives, not just that the account exists
- [ ] Decide how often you check it on launch day

An address on an error page that nobody reads is worse than no address — it promises a response that
will not come.

---

## 7. Decide who moderates, and when — a decision, not a task

Reports now reach `/admin/reports` and moderators can act. Nobody is watching it by default.

You are the only moderator. Decide now how often you look on day one, because deciding at the moment
something ugly appears is deciding badly. Twice a day is a reasonable floor for a launch.

---

## 8. Before you post the link — final gate

Run through this in one sitting, in production, on your phone:

- [ ] Magic link arrives at an address that is not yours (step 2)
- [ ] All nine write paths verified against the database (step 3)
- [x] Anonymous page views recording (step 1) — verified
- [ ] Landing page loads and the ungated state is what you intend a stranger to see
- [ ] Paste a discussion permalink into the app you plan to share on, and check the card renders
- [ ] Spend limit set (step 4)
- [ ] Backup taken (step 5)
- [ ] Support inbox receiving (step 6)

---

## Optional, but I would do them first week

- **Sentry** — F-04. What ships tonight is visibility, not alerting. Free at your volume.
- **Skip link and search-field label** — F-08 and F-09. Twenty minutes for both, real for anyone
  using a keyboard or a screen reader.
- **Name Resend and Vercel in `/privacy`** — F-12. One sentence, do it while you are editing sender
  configuration in step 2.
- **Two tests** — F-11. `resolveDbBook` and the slug contract. That join has broken twice.

---

## What I did tonight, for the record

Pushed to `main`: `5b91283` (F-03), `a9f01e1` (F-05), `50247b1` (F-07), `6042439` (F-04).
Details in `FIXED.md`, and what I left alone in `DEFERRED.md`.
