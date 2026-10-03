# Inventory

Every route, every state, and the one thing each has to land. Written at the start of the
full-app pass (the landing page was done in an earlier, narrower pass).

## The seam this pass exists to close

The landing page is ink on paper: no radius, no shadow, mono labels, three weights. Behind it
the product was an iOS-style app: `#f5f5f7` ground, white cards at 28px radius, soft shadows,
gold labels, pill buttons, lucide icons beside every word, a bottom tab bar. A stranger tapped
"Start reading" and arrived at a different company. The product comes toward the landing page.

## Screens

| # | Screen | Route | What it is for | The one thing |
|---|---|---|---|---|
| 1 | Landing | `/` | The page a stranger arrives on from a phone | Someone read the book and wrote down what they made of it |
| 2 | Home | `/explore` | Where a reader starts each visit | **Here is a question about a real book that nobody has answered** |
| 3 | Book | `/book/[id]` | Everything one book holds | What readers applied, questioned and pushed back on in this book |
| 4 | Perspective | `/discussion/[id]` | One reader's account, with its own address | The account itself, read end to end |
| 5 | Write | `/book/[id]/create-discussion` | Turning a reader into a writer | Which of the eleven kinds you are writing, then the writing |
| 6 | Feed | `/feed` | What readers are learning, book or no book | The most recent thing someone wrote |
| 7 | Note | `/post/[id]` | One feed note, with its own address | The note, read end to end |
| 8 | Books | `/search` | Finding a book: by name, by genre, by path | The field that finds one of 394 books |
| 9 | Genres | `/genres` | The full shelf list | The fourteen shelves |
| 10 | Genre | `/genre/[slug]` | One shelf | The books on this shelf |
| 11 | Reading path | `/path/[slug]` | A sequence someone should read in order | Book one, and why it is first |
| 12 | Profile | `/profile/[username]` | What one person has written | Their perspectives |
| 13 | Connections | `/profile/[username]/connections` | Who they follow | The list |
| 14 | Saved | `/saved` | What you kept | Your kept items |
| 15 | Replies | `/notifications` | Answers to your writing | Who replied, to what |
| 16 | Settings | `/settings` | Your public identity | The three fields |
| 17 | Sign in | `/login` | Google sign-in, asked only when writing needs it | The Google button |
| 18 | Privacy / Terms | `/privacy`, `/terms` | The legal pages | The text, readable |
| 19 | Admin | `/admin/analytics`, `/admin/reports` | Internal | The numbers |

## States, which are screens too

| State | Where | Note |
|---|---|---|
| Not found | `/not-found` | Reached by a bad book id, a deleted perspective, a stale link |
| Error | `/error`, `/global-error` | Caught render failures |
| Loading | `/loading` + `loading-skeleton.tsx` | Route-level fallback |
| Empty: no perspectives on a book | `/book/[id]` | Common - most of 394 books have none |
| Empty: no feed posts | `/feed` | |
| Empty: no replies | `/notifications` | |
| Empty: nothing saved | `/saved` | |
| Empty: no search results | `/search` | |
| Signed out | `/notifications`, `/saved`, `/settings` | Reading never asks for sign-in; these are personal surfaces |
| First-use guide | overlay, any screen | `first-use-guide.tsx` |
| Composer errors | `/feed`, write flow | Validation and failed publish |

## Where each concept lives

| Concept | Home | Rule |
|---|---|---|
| The four ways into a book (changed / clicked / puzzles / push back) | Landing declares it; the book page and the write flow *use* it | Never restated as a third explainer |
| The eleven perspective types in three groups | The write flow | The book page and perspective page *stamp* a type; they do not teach the taxonomy |
| Why not ratings or summaries | Landing only | |
| Free, no account, sign in to write | Landing hero and FAQ; the write flow at the moment it binds | |
| Books by genre and by path | `/search` | `/genres` is the long form of the same shelf list |
| Editorial attribution (BookSphere Team) | Under every perspective it wrote | Never hidden, never dressed as a reader |
