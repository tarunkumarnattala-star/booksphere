# What only you can do

In the order I would do them.

## 1. Buy a domain (about £10, ten minutes)
This is the last thing standing between a stranger on a phone and an account. It is needed
twice over: Resend will not send sign-in mail to other people's addresses from an unverified
domain, and Google's consent screen only carries your own name once a domain you own is
verified. `booksphere.io`, `getbooksphere.com` and `readbooksphere.com` were free when I
checked - confirm before buying. Tell me which one and I will wire it through Vercel, the
Supabase redirect URLs, `NEXT_PUBLIC_APP_URL` and Resend in one pass.

## 2. Turn on error tracking - the wiring is done, it needs one value
Everything is built and verified; it is switched off until a DSN exists.

1. Go to sentry.io and create a free account, then a project. Pick **Next.js** as the platform.
2. Sentry shows you a DSN - a line like `https://abc123@o4500000.ingest.us.sentry.io/4509999`.
   It is not a secret; it is designed to sit in the browser.
3. In Vercel → booksphere → Settings → Environment Variables, add
   `NEXT_PUBLIC_SENTRY_DSN` with that value, for Production. Then redeploy.

That is the whole job. Deleting the variable turns it off again with no code change.

Verified with a fake DSN before handing it over: the client initialises, an error produces
three requests to the ingest host, and there are zero Content-Security-Policy violations -
the policy allows the exact origin inside your DSN, derived from it rather than typed in. A
wrong entry there would not break the site, it would silently drop every report, which is the
worst way for this particular thing to fail.

Optional, later: stack traces will be minified until source maps are uploaded. That needs a
`SENTRY_AUTH_TOKEN` from Sentry's settings; add it as a Vercel variable and uploads turn
themselves on.

## 3. Check the Supabase sign-in mail settings
Project Settings → Authentication → SMTP: confirm custom SMTP is on and pointed at Resend.
Then Authentication → Rate Limits: raise the hourly email limit above the sign-ups you expect.
You still have not told me what the auth log said when you tested this.

## 4. Decide: is one real reader's writing enough to launch on?
Twenty-six books now carry BookSphere's own editorial, honestly labelled. Exactly one
perspective on the whole site was written by somebody who is not you or the house account.
That is not a bug and I cannot fix it by writing more - more editorial does not make it a
community. It is a judgement about whether you launch now and use the launch to get the first
real writers, or recruit a handful first. I would launch; you should know you are choosing it.

## 5. Delete the QA account row (two minutes, optional)
`booksphere-qa-probe-tri-a71c6f` is no longer reachable - the proxy answers 404 for it - but
the row is still in the database and only you can remove it. Supabase dashboard → Table editor
→ `profiles` → find that username → delete the row. It owns no posts, comments, likes or
follows, so nothing else is affected. If that account also exists under Authentication → Users,
delete it there too.

## 6. Get one technical person to read the branch before trusting it
Your own harness asks for this and it has not happened. I am the only reviewer of every line
merged today.
