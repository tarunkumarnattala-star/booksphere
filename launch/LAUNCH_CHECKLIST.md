# Launch checklist

Work down it. Each step says where to go, what to do, and how to know it worked.
Nothing here costs money except Step 8, which is optional and comes after launch.

Your site: **https://booksphere-iota.vercel.app**

---

## PART A — Before you post (about 25 minutes, free)

### Step 1. Find out whether sign-in emails actually work (2 minutes)

This is the one thing nobody knows yet, and it changes everything below.

1. On your phone or laptop, open **https://booksphere-iota.vercel.app/login** in Safari or Chrome.
2. In the email box, type an address that is **not yours** and not any address linked to your
   Supabase or Resend accounts. Borrow a friend's, or use a second address you own that you
   have never used for this project.
3. Tap **Email me a sign-in link**.
4. Wait two minutes. Check that inbox, including spam.

**Then check the log, which tells you the truth either way:**
Go to **supabase.com/dashboard** → your project → **Logs** → **Auth Logs**. Find the attempt.

- **The email arrived** → email works. You have both sign-in routes. Skip Step 8 entirely
  until you feel like it.
- **It did not arrive** → email cannot reach new people yet. Google sign-in is your signup
  route for launch. That is fine, and Step 2 matters more because of it.

**Tell me which one happened.** It decides what I check next.

---

### Step 2. Make the Google sign-in screen look like a real product (10 minutes)

Right now Google shows a long random address instead of your name. This fixes most of that,
costs nothing, and matters more than usual because Google is your main signup route.

1. Go to **https://console.cloud.google.com/apis/credentials/consent**
2. Pick the project that holds your BookSphere sign-in (the one you made when you set up
   Google sign-in).
3. Fill in:
   - **App name:** `BookSphere`
   - **User support email:** `booksphere.support@gmail.com`
   - **App logo:** upload `launch/assets/booksphere-logo-512.png` from this project folder.
     Google rejects SVG files, which is why this one is a PNG.
   - **Application home page:** `https://booksphere-iota.vercel.app`
   - **Privacy policy link:** `https://booksphere-iota.vercel.app/privacy`
   - **Terms of service link:** `https://booksphere-iota.vercel.app/terms`
4. **Save**, then press **Publish app** so it leaves "Testing" and goes to "In production".

**How to know it worked:** open your login page in a browser where you are not signed in,
tap Continue with Google, and look at the top of Google's screen. It should show your logo
and name rather than only an address. The address may remain until Google verifies the brand,
which needs a domain you own - that is Step 8, and it is not urgent.

---

### Step 3. Turn on error tracking (10 minutes)

Without this, if the site breaks during your launch you find out from a stranger, or never.
All the code is already built and tested; it needs one value.

1. Go to **https://sentry.io** and create a free account.
2. Create a new project. When it asks for the platform, choose **Next.js**.
3. It shows you a **DSN** - a line like
   `https://abc123@o4500000.ingest.us.sentry.io/4509999`. Copy it.
   It is not a password; it is designed to sit in a web page.
4. Go to **https://vercel.com** → your **booksphere** project → **Settings** →
   **Environment Variables** → **Add New**:
   - Name: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: the DSN you copied
   - Environments: tick **Production**
   - Save.
5. Go to the **Deployments** tab and press **Redeploy** on the most recent one.
   This matters: the value is read when the site is built, so without a redeploy nothing
   changes.

**How to know it worked:** after the redeploy finishes, your Sentry project stops saying
"Waiting for events". If you want to be certain, tell me and I will check it from here.

**To turn it off ever:** delete that variable and redeploy. No code change needed.

---

### Step 4. Walk the site once yourself (3 minutes)

On your phone, in Safari or Chrome:

- Open the site. Scroll Home for a full minute - it should keep giving you new ideas.
- Tap **I tried this** on any card with a "Try this" box. It should open a writing screen
  that already knows the book and the idea.
- Tap a book. You should see all five kinds: what it argues, what you can do, where it stops
  working, what is disputed, what people get wrong.
- Tap **Feed**. Different from Home on purpose: ideas that are not about one book.
- Search for **money** or **startup**. You should get few or no results rather than books with
  empty pages. That is deliberate.

If anything looks wrong, stop and tell me before posting.

---

## PART B — Posting (launch day)

### Step 5. Post it

**Where:** **r/SideProject** allows this kind of post. So does r/alphaandbetausers.

**Do not post to r/books, r/suggestmeabook or r/booksuggestions.** They ban self-promotion,
will remove it, and it damages the account.

**The post:**

> **Title:** I built a site where a book is explained by the people who read it - the useful
> parts, the parts that didn't hold, and the questions left over
>
> I read a lot of non-fiction and kept hitting the same wall: a summary tells you what the
> author said, but not what happened when someone actually tried it, where it broke down, or
> which part people still argue about. Reviews are verdicts. Summaries are compressions.
> Neither tells you how an idea behaves once it leaves the page.
>
> So I built BookSphere. Each book has four ways in: what someone changed after reading it,
> what clicked, what still puzzles them, and where they'd push back. The point is to see a
> book from every angle at once - what it gives you, what it costs you, what it gets wrong,
> and what's still unsettled.
>
> Where it honestly stands: 26 books covered properly, and most of the writing so far is mine.
> It's early. I'm not going to pretend there's a crowd in there yet.
>
> Reading needs no account at all - no signup wall, no email gate. You only sign in if you
> want to write something.
>
> https://booksphere-iota.vercel.app
>
> What I'd genuinely like to know: open a book you've actually read and tell me whether the
> four questions are the right four. That's the part I can't test alone.

### Step 6. The first hour decides it

- **Reply to every comment.** Reddit ranks on early engagement, and a founder who answers is
  the difference between 40 views and 4,000. Do not post and walk away.
- **Someone will ask whether it is AI-written.** Answer plainly, something like: *"The book
  data is a catalogue. The perspectives are written by hand, and right now most of them are
  mine, which is exactly the thing I'm trying to change."* Do not dodge it - the dodge is what
  kills the thread.
- **If someone is inside the Reddit app** and cannot sign in, the page tells them to copy the
  link into Safari or Chrome. You can say the same in a reply.

---

## PART C — After you post

### Step 7. Watch two things

- **Sentry** (if you did Step 3): anything appearing there is a real reader hitting a real
  problem.
- **Supabase → Table editor → `discussion_posts` and `knowledge_posts`**: new rows are
  strangers writing. That is the number that matters more than visits.

**If the site goes down or looks broken:** tell me and I will check it. Vercel can roll back
to any previous deployment in one click - Deployments → the one before → **Promote to
Production** - and nothing is lost by doing it.

---

## PART D — Only when traction justifies it (about £10/year)

### Step 8. Buy a domain

Everything in your stack is free and stays free. A domain is the only cost, and it buys
exactly two things: **sign-in emails that can reach strangers**, and **your name instead of a
URL** on Google's screen.

I checked the free alternatives and there is no reliable way around it: SendGrid's free tier
was retired in May 2025, and Brevo, Mailjet and SMTP2GO are all genuinely free but every one
of them requires a domain you own before it will send.

1. Buy from Namecheap or Cloudflare. Check availability first - `booksphere.io`,
   `getbooksphere.com` and `readbooksphere.com` were free when I last looked.
2. **Tell me which one you bought.** I wire it through Vercel, the Supabase redirect URLs and
   the app's own address setting, and verify a real signup end to end.
3. Then sign up free at **resend.com** → **Domains → Add** → it gives you DNS records → paste
   them at your registrar → wait for "Verified" → **API Keys → Create**.
4. In **supabase.com/dashboard** → your project → **Project Settings → Authentication → SMTP**:
   turn on custom SMTP with host `smtp.resend.com`, port `465`, username `resend`, password =
   your Resend API key, sender = an address on your new domain.
5. Same dashboard → **Authentication → Rate Limits**: raise the emails-per-hour number above
   the signups you expect. The default is low and it is what throttles a launch.

---

## Things worth knowing

- **Supabase free projects pause after about a week with no activity.** With launch traffic
  that is a non-issue. If it goes quiet for a fortnight the site can stop working until you
  unpause it in the dashboard.
- **Reading never needs an account.** That is deliberate and it is unusual - do not let anyone
  talk you into a signup wall.
- **26 books are covered, 368 are hidden.** Hidden, not deleted. They come back as they get
  written. Nothing anywhere offers a book with nothing on it, and a test enforces that.
