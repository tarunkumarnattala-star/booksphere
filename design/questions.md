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
