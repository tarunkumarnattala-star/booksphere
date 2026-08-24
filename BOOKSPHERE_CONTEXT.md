# BookSphere — Full Context

*For a content-strategy automation. Written 24 August 2026. Every number here was queried from the
live database or the running site, not estimated. Where something is not yet true, it says so.*

**Production:** https://booksphere-iota.vercel.app
**Stage:** private beta, invite-only, Google sign-in. No public launch.

---

## 1. What the product is

**BookSphere organises what happened when real people used a book's ideas.**

Not reviews of books. Not summaries of books. Accounts of application — what someone tried, what
happened, where it broke, and what they would tell the next person.

The unit of content is a **perspective**: one reader's account, attached to one book, answering one
specific question. The whole product exists to get perspectives written and read.

## 2. The content model — this is what an automation must respect

### The object hierarchy

```
Book (394)  ->  Perspective (many)  ->  Reply (many)
Genre (20)  ->  Books
Reading path (5) -> Books, in an order, toward a goal
Feed perspective -> same as a perspective, but the book is optional
```

### The 11 perspective types, with the exact prompt each one shows the writer

| Type | Prompt shown in the composer | Group |
| --- | --- | --- |
| Real-Life Result | What changed after you used this idea? | What happened when you used it |
| What Did Not Work | What did you try, why did it fail, and what would you do differently? | What happened when you used it |
| Application | How did you apply this in real life? | What happened when you used it |
| Personal Experience | How did this book connect to something you lived through? | What happened when you used it |
| Disagreement | What do you disagree with, and why? | Where it breaks down |
| Limitation | Where is this book incomplete, too general, or risky without more context? | Where it breaks down |
| Insight | What idea changed how you think? | Understanding the idea |
| Question | What part of this book do you want others to help explain? | Understanding the idea |
| Connection | What other book, idea, or experience helps explain this? | Understanding the idea |
| Summary | What is the most useful explanation of this idea? | Understanding the idea |
| Quote | *(read-only; not offered in the composer — copyright risk)* | — |

Those three group labels are the product's argument in miniature. Any content that ignores them
drifts back into review-writing.

### Constraints enforced by the database

- Title: 4–120 characters
- Body: 20–2000 characters (feed perspectives: 4–2000)
- Status: `published` / `removed` (deletion is a soft delete)
- Rate limit: 10 perspectives per user per hour

## 3. The taxonomy, exactly as it exists

**20 genres** (URL: `/genre/<slug>`):

`biography` · `business` · `career` · `communication` · `creativity` · `economics` · `finance` ·
`health` · `history` · `investing` · `leadership` · `personal-growth` · `philosophy` ·
`productivity` · `psychology` · `relationships` · `science` · `society-culture` · `startups` ·
`technology-ai`

**5 reading paths** (URL: `/path/<slug>`):

`startups-101` · `personal-finance-starter-pack` · `build-better-habits` ·
`understand-human-psychology` · `become-a-better-communicator`

**394 books** (URL: `/book/<slug>`), each carrying: title, author, description, whyMatters,
publishedYear, genres, bestForTags, mostDiscussedThemes, cover, and an editorialStatus of
`verified` or `catalog_only`.

## 4. The state of the content — read this before planning anything

| Fact | Number |
| --- | --- |
| Books in the catalog | **394** |
| Books with at least one perspective | **45** |
| Books with **zero** perspectives | **349** (89%) |
| Published perspectives | **50** |
| Written by the editorial account | **50 (all of them)** |
| Written by an outside reader | **0** |
| Accounts | 10 |
| Outside strangers who signed up | 2 |
| Outside strangers who wrote something | **0** |

The distribution of the 50 editorial perspectives is lopsided and worth correcting: **Insight 39,
Disagreement 6, Question 5**, and nothing at all in the four types that carry the product's actual
promise — Real-Life Result, What Did Not Work, Application, Personal Experience.

**That gap is the single most useful thing an automation could address.** The product claims to be
about what happened when people used ideas, and every example on the site is a reflection about an
idea instead.

## 5. What good looks like — the editorial standard already set

Real example, live on the site (type: Insight, 123 words):

> **The value here is that it refuses to give you a formula**
>
> Horowitz says directly that there is no recipe for the hard things, and then spends the book on
> situations where every option is bad. Layoffs, demoting a loyal friend, telling the truth to people
> who will leave because of it. That structure is the argument. Most business books present decisions
> with a right answer that was obvious in retrospect…

Characteristics to hold to:

- **110–130 words.** Long enough to make one argument, short enough to read on a phone.
- **One claim per perspective.** Not a summary tour of the book.
- **Names specifics** — the actual chapter, the actual situation, the actual counter-case.
- **Earns its verb.** "It refuses to give you a formula" is a claim. "Great book" is not.
- **No second-person advice.** It reports; it does not instruct.

## 6. Language rules — enforced, and previously broken twice

A contribution is a **perspective**. Always.

**Never** use, in any reader-facing string: *review*, *post*, *thread*, *insight* (as the name for a
contribution), *discussion*, or *comment*. Replies to a perspective are **replies**.

This was a real defect twice — four words for one object on the primary screen — and was fixed by
sweeping the rendered pages, not the source. Any generated copy that reintroduces those words
reintroduces the bug.

Permitted exceptions that already exist: "Insight" as one of the 11 *type* names, and
"source-reviewed previews", which describes editorial provenance rather than a book review.

## 7. Voice

**Is:** plain, specific, calm. Short sentences. Concrete over abstract. Assumes an intelligent, busy
reader. The writing the product asks its users to produce.

**Is not:** hype, emoji-led, exclamation marks, "unlock", "game-changing", "revolutionise".

Existing copy that works and can be reused:

- *Understand books through the people who lived their ideas.*
- *Go beyond the takeaway. See what people applied, questioned, changed, and learned.*
- *Ideas shaped by real life.*
- *BookSphere is not a blank text box.*

## 8. Honesty constraints — non-negotiable

The community is empty. **Zero outside readers have written anything.**

**Never** generate, imply or design around: an active community, member counts, testimonials,
reader quotes, engagement numbers, or social proof of any kind.

**Do** say: early, invite-only, being built with its first readers, "be among the first 100".

Two reasons beyond ethics. Fabricated community is trivially checkable at this size and would cost
exactly the audience this depends on. And the honest framing is the stronger one right now — *this
does not exist yet, help build it* beats *join thousands of readers* when the thousands fit on one
screen.

If an automation writes editorial perspectives, they must be **attributed to the BookSphere team**,
never presented as reader contributions. The existing 50 already follow this.

## 9. URL structure, for linking

```
/                      landing (public)
/explore               home after sign-in
/genres                all 20 reading rooms
/genre/<slug>          one genre
/book/<slug>           a book and its perspectives
/book/<slug>/create-discussion    the composer
/discussion/<uuid>     one perspective, shareable, own social card
/feed                  book-optional perspectives
/post/<uuid>           one feed perspective
/path/<slug>           a reading path
/search                books, concepts, questions
/profile/<username>    a reader
/saved                 saved books and perspectives
```

Every route carries its own title and social card, so any URL is safe to share directly.

## 10. Where content actually lives

- **Catalog** (394 books, genres, paths, previews): `src/lib/data.ts`, committed to git. Changing it
  is a code change and a deploy.
- **Perspectives, replies, profiles, saves, reports**: Supabase Postgres, project
  `dhsophbjhaamucatumqr`. Tables: `discussion_posts`, `discussion_comments`, `knowledge_posts`,
  `profiles`, `saved_books`, `saved_insights`, `reports`, `analytics_events`.
- Note the internal names still say *discussion*; only reader-facing text says *perspective*.
  Renaming the tables would be a schema change wearing a copy change's clothes.

## 11. The one question the product is actually testing

Not whether the software works — it does, and it has been audited hard.

**Will strangers write 200 honest words about a book that failed them?**

Two people have signed up and neither wrote. Any content strategy should be judged against that
question: does this piece of content make someone more likely to write a perspective? If not, it is
decoration.

The highest-leverage content gaps, in order:

1. **Perspectives in the four "what happened" types** — the product's promise has zero examples of
   its own central claim.
2. **The 349 books with nothing on them** — but seeding all of them would be fake breadth. Better:
   deep coverage of 20 books people actually argue about.
3. **Distribution content** that finds people who have already publicly said a book's advice did not
   work for them. They have written the first perspective in their head already.
