# System map

One Next.js 16 app, deployed on Vercel from `main`, with Supabase behind it. No payments, no
server secrets, no background jobs.

## Who uses it
- **A reader who has not signed in.** Can do everything except write: the whole scroll, every
  book, every perspective, search. This is the main audience and the main path.
- **A reader who signs in.** Can write a perspective, save a book, follow a reader, comment.
- **You.** Same as a signed-in reader, plus `/admin/analytics` and `/admin/reports`.

## The journeys that matter
1. **Land → scroll → leave with something.** `/` or `/explore`. 179 cards across 26 books.
   No account needed at any point.
2. **Scroll → "I tried this" → write.** A practice card carries a card id into
   `/book/[id]/create-discussion`, which shows the idea back and asks what happened. Needs an
   account at the point of publishing, not before. This is the loop the product depends on.
3. **Sign in.** Google (in a real browser) or an emailed link. Inside an in-app browser Google
   is hidden because it cannot complete there, leaving email - which currently cannot reach
   strangers. See FINDINGS S1 #3.
4. **Go deep on a book.** `/book/[id]` - editorial cards plus whatever readers have written.

## What it is built on
- Next.js 16 App Router, React 19, Tailwind 4, TypeScript
- Vercel hosting, deploys on push to `main`
- Supabase: Postgres, auth, row level security. Reached with the **public anon key only** -
  there is no service-role key anywhere in the deployment
- Google Identity Services for sign-in, loaded in the browser
- Open Library and Google Books for cover images

## If a third party goes down
- **Supabase** → reader perspectives and sign-in stop. The scroll, every book page and all 179
  editorial cards keep working: they are in the code, not the database.
- **Vercel** → the site is down.
- **Google Identity** → the Google button stops; email sign-in remains.
- **Open Library / Google Books** → covers stop loading. Nothing else is affected.

## Where data lives and who can see it
- Public and intended to be: discussion_posts, knowledge_posts, likes, comments, follows,
  awards, reactions, and name/username from profiles.
- Private and verified private: saved_books, saved_insights, saved_knowledge_posts, reports.
- No payment data. No email addresses readable through the API.

## What protects it
Row level security is the entire perimeter, because the key the browser holds is public by
design. Tested directly: anonymous writes refused on every table, private tables refuse
anonymous reads.

## What exists to check it
- `bash launch/gates.sh` - types, lint, four content audits, launch config, production build
- `/api/health` - configuration present and database reachable
- No end-to-end tests, no monitoring, no load test. See FINDINGS.
