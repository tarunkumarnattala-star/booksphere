# Questions for the founder

Written during the landing-page pass. Each is something I would not decide alone.

---

### 1. The landing page and the product are two different visual languages

The landing page is ink-on-paper editorial: paper `#f6f7f2`, hairline rules, zero radius, mono
labels. `/explore` behind it is an iOS-style app: `#f5f5f7` ground, white cards at 28px radius
with soft shadows, gold mono labels, pill buttons, a bottom tab bar.

A stranger taps "Start reading" and arrives somewhere that looks like a different company. I did
not touch the product, because the brief scoped this pass to `/`, and because deciding which of
the two languages wins is a product decision, not a presentation one.

My recommendation, for when you want it: the product should come toward the landing page, not the
reverse. The ink-on-paper direction is the one that is yours; the rounded-card app look is the one
every reading app already has. But that is a multi-screen pass, not a note.

**Owed: which language is the product's.**

---

### 2. "One book. Four ways in." is not true yet, and I could not design around it

The page's strongest claim is that one book carries four kinds of answer. The database holds 51
published perspectives, and **no book has more than two**. Most have one.

So I could not show four real perspectives on one book without inventing three of them. What I
built instead shows four real perspectives on **four different books**, each with its real type,
title, book and author. That is honest and it demonstrates the four kinds of thinking — but it
quietly drops the "one book, four ways" claim, because the product cannot back it today.

**Owed: do you want the four-angles claim held back until some book actually has four, or do you
want the landing to keep promising it?** I removed the promise rather than fake the evidence.

---

### 3. Concept search had an invented example, and I removed the whole section

The concept-search section showed a worked example — concept "Dopamine loops", question "Why can't
I stop scrolling?", and two explanatory notes. `grep` finds that string in exactly one place in
the repo: the landing page itself. The product's `bookConcepts` are generated from each book's
themes and tags; there is no editorial concept page that looks like that mock.

I deleted the section rather than invent a real-looking replacement. Concept search is now
unmentioned on the landing page.

**Owed: if concept search is a real feature you want sold on the front door, point me at a real
concept with real copy and I will give it a section.** I will not mock one up.

---

### 4. The knowledge feed lost its only illustration, and I think it should stay lost

The "Knowledge feed" section carried a quote — *"I stopped defending my solution and explained the
problem first. The conversation changed."* — labelled "Reader reflection". No such perspective
exists. It is invented data and a reader testimonial, both of which the constraints rule out.

I removed the section entirely rather than find another way to illustrate it, because once the
invented quote is gone the section was a heading restating a claim two other sections already
make.

**Owed: nothing, unless you disagree.** Flagging it because it was a deliberate deletion of a
whole section, not a copy fix.

---

### 5. The brand mark is an open book

`<BookOpen />` from lucide, in a bordered square. The brief names "a little open-book icon" as a
generic tell by name. I replaced it with the wordmark alone — "BookSphere" set in the page's own
type, which is what a publication does — rather than commission a mark I am not briefed to design.

**Owed: whether you want a real mark drawn.** The page is better with no mark than with that one.

---

# Full-app pass

### 6. The book page had a second, different taxonomy, and I removed it

`perspectiveClusters` grouped the eleven types into seven boxes - Applied It, Biggest
Perspective, What Did Not Work, Disagreed, Best Summary, Connected It, Questions - while the
composer groups them into the product's three: what happened when you used it, where it breaks
down, understanding the idea. Two answers to one question, one on each screen.

I kept the composer's three (they are the product's argument and they lead with lived
outcomes), moved them into `lib/perspective-groups.ts` so both screens read one list, and
removed the seven-box map. The map also duplicated the list directly below it: on Atomic
Habits it showed the book's single perspective, then the list showed the same one again.

`perspectiveClusters` is still exported and still used by nothing else I touched.

**Owed: confirmation that the seven clusters are retired, or a reason to keep them.**
One of them, "Best Summary - reader explanations judged especially clear and useful by the
community", describes a judgement no one has made.

### 7. Replies no longer appear in a rail on the book page

The book page rendered a 340px reply rail for `posts[0]` unless `?thread=` was set, and
nothing in the product generates `?thread=` links any more - every perspective links to
`/discussion/<id>`, where the same thread is rendered. So the rail attached replies to
whichever perspective happened to sort first. Replies now live on the perspective's own page
only. No code was deleted; the book page simply stops rendering `CommentThread`.

**Owed: nothing unless you want the rail back.**

### 8. The eight-option sort bar is no longer rendered

Hot / New / Rising / Top Today / Top Week / Top Month / Top All Time / Controversial, over a
list of one or two perspectives, every option ranking by likes and comments that are all zero.
`?sort=` still works and `sortDiscussions` still runs; the chips are not drawn.

**Owed: a decision on when sorting becomes real.** My suggestion is one control, New / Oldest,
and only once a book has more than about five perspectives.

### 9. A perspective's actions now live on its own page, not on every card

`DiscussionCard` carried a ten-button bar - like, comment, save, follow, "useful" (six
reaction types), "award" (six award types), share, report, edit, delete - under every
perspective on the book page, genre pages, profiles and the saved shelf, with every count
reading zero. The card is now a record: stamp, title, opening lines, book, writer, date. The
full action bar still exists, unchanged, on `/discussion/<id>`.

**Owed: whether awards and usefulness reactions should exist at all before there are readers
to give them.** Six award types and six reaction types is a lot of machinery for an audience
of zero, and it is the single strongest "pretend community" signal left in the product.

### 10. `getBookActivityLine` carries emoji and would print invented-looking counts

```
if (signal === "insights") return book.insightCount > 0 ? `💡 ${book.insightCount} reader perspectives` : ...
if (signal === "saves")    return book.saveCount > 0 ? `❤️ ${book.saveCount} saves` : ...
return book.discussionCount > 0 ? `🔥 ${book.discussionCount} active perspectives` : ...
```

Every one of those counts is hard-coded `0` in the catalogue, so today the function always
falls through to "Best for ...". The emoji branches are one non-zero seed away from printing
on every shelf. I have not touched `data.ts`.

**Owed: delete the three emoji branches, or tell me to.**
