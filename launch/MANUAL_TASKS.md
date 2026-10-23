# What only you can do

In the order I would do them.

## 1. Buy a domain (about £10, ten minutes)
This is the last thing standing between a stranger on a phone and an account. It is needed
twice over: Resend will not send sign-in mail to other people's addresses from an unverified
domain, and Google's consent screen only carries your own name once a domain you own is
verified. `booksphere.io`, `getbooksphere.com` and `readbooksphere.com` were free when I
checked - confirm before buying. Tell me which one and I will wire it through Vercel, the
Supabase redirect URLs, `NEXT_PUBLIC_APP_URL` and Resend in one pass.

## 2. Turn on error tracking (free tier, about fifteen minutes)
Sentry's free plan covers a project this size. Create the project, give me the DSN, and I will
wire it up. Without it, the first you hear of a broken site is somebody telling you - and you
have nobody testing it.

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

## 5. Get one technical person to read the branch before trusting it
Your own harness asks for this and it has not happened. I am the only reviewer of every line
merged today.
