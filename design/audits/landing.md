# Audit — Landing `/`

Pass 1. Rendered at 390, 1024 and 1440 against the dev server. 390 read first.

## 1. The one thing

**Someone read the book and wrote down what they made of it. You can read that, and argue back.**

The page never showed that in under two seconds. It *asserted* it six times in six different
abstract registers — "Ideas are everywhere. Understanding is still rare.", "From curiosity to
something you can use.", "Curiosity deserves more than a trend.", "Books teach ideas. Readers
show what they made of them.", "One book. Four ways in." — and showed one actual perspective,
2,100px down the phone. A stranger from TikTok leaves before the evidence.

## 2. Where it belongs

- **The four questions appear twice, word for word.** Four tiles in the hero
  (`heroAngles`), then four numbered cards in "Reader perspectives" (`outcomes`), both rendered
  from the same `angles` array. Two homes for one concept.
- **Proof is below the taxonomy.** The hero explains the four kinds of answer before showing a
  single answer. The abstraction arrives before the thing it abstracts.
- **"Knowledge feed" has no home at all.** It is a section about a feature, carrying an invented
  reader quote, sitting between two sections that make the same argument better.

## 3. The reading path

At 390 the eye goes: headline → lead → **four grey boxes** → button. The four boxes are the
third thing read and they are the weakest content on the screen: a taxonomy of answer types,
written in the abstract, before the visitor knows there are answers. The real perspective — the
only thing on the page that could not exist anywhere else — is fourth, below the fold, under a
label that apologises for it ("This is what one looks like").

## 4. The grid

`.shell` is `min(100% − 48px, 1180px)`; `.heroContent` is `min(100% − 48px, 1120px)`; `.nav` is
`min(100% − 48px, 1380px)`; `.concepts` and `.feed` use `max(24px, (100vw − 1360px) / 2)`; the
footer uses 1380px. **Five different column widths and four different gutters on one page.** The
nav sits 130px wider than the headline it sits above, so nothing lines up with anything at
1440. At 390 the gutter is 18px for two sections and 36px for the rest.

## 5. The spacing scale

~45 distinct values (full list in `system.md`). There is no scale; there are 45 decisions, each
made once. 7, 9, 11, 13, 25, 27, 34, 42, 46, 54, 58, 74, 82 all appear exactly once.

## 6. The type scale

~40 sizes including 10.5, 12.5, 13.5, 14.5, 15.5, 16.5px, and **11 font weights**
(300/320/330/360/380/410/430/470/540/560/620). Weights 320, 330 and 360 are not distinguishable
from each other at any size; they are three names for one decision. The half-pixel sizes are the
clearest single tell on the page that the numbers were nudged rather than set.

## 7. The generic tells present

**Layout**
- Four identical cards, same padding, same 16px radius, same tint, in a 2×2 grid (`heroAngles`).
- Four more identical cards, 01–04, further down — the same content again.
- Three identical step cards with an icon, a number and a one-line caption (`steps`).
- The final CTA is centred with ~200px of dead space above and below it at 390.

**Visual**
- 16px and 20px radii applied without thought; a 999px pill on the perspective type.
- `box-shadow: 0 8px 24px` and `0 30px 80px` creating hierarchy that type should create.
- A tinted "subtle" background fill on the hero tiles (`rgba(18,23,19,0.02)`) that reads as dirt
  at 390 rather than as grouping.
- **An open-book icon as the brand mark** — named in the brief as the single most generic book-app
  mark there is.
- **A Sparkles icon**, twice. It is the AI-generated-interface emblem.
- Icons beside every label in "How it works": a magnifier beside "Search", a wand beside
  "Understand", a tick beside "Apply". Each icon restates its word.
- A `UsersRound` icon floating above the final CTA.

**Typography**
- 11 weights fighting.
- Half-pixel sizes.
- At 390 the hero tile label wraps to three lines of tracked all-caps ("WHERE THEY / WOULD PUSH /
  BACK") and the tiles end up unequal heights with ragged bottoms.

**Copy**
- "Discover BookSphere" as the scroll cue — the brief bans "discover" framing.
- "This is what one looks like" apologises for the best thing on the page.
- "Know what you are joining." for an FAQ heading, on a product with no joining step.

**Invented data — the two hard breaks**
- The concept-search card: *"Dopamine loops"*, *"Why can't I stop scrolling?"*, and two
  explanatory notes. `grep` finds "Dopamine loops" in exactly one file: `landing-page.tsx`. It is
  not a concept the product holds.
- The knowledge-feed blockquote: *"I stopped defending my solution and explained the problem
  first. The conversation changed."* attributed to "Reader reflection". No such perspective
  exists. This is both invented data **and** a reader testimonial, which the constraints ban
  twice over.

**Verified and kept**: the hero perspective is real — "The value here is that it refuses to give
you a formula", Insight, *The Hard Thing About Hard Things*, by the BookSphere Team. It was
rendered in quotation marks as though it were a pull-quote, which it is not, and with no author.

## 8. The verdict

**Yes, a prompt could have produced this.** "Build a landing page for a book-discussion site:
hero, why-us, three-step how-it-works, feature showcase, testimonial, four benefit cards, FAQ,
final CTA" returns this page's skeleton exactly, including the order. The typography has the
*appearance* of care — 78px display weights, tracked eyebrows, hairline rules — laid over no
system at all, which is what iterative prompting produces: lots of specific numbers, none of
them related to each other.

The page also spends 8,686px at 390 — ten full phone screens — to make one argument, and the
evidence for that argument exists on the page exactly once.

## Score before

| Axis | Score |
|---|---|
| Hierarchy | 2 |
| Rhythm | 2 |
| Type | 2 |
| Placement | 2 |
| Restraint | 1 |
| Authorship | 1 |
| **AI-score (30 − total)** | **20** |

---

# Pass 1 — what changed

**The decision, in one sentence: the page stops describing the product and prints it.**

Six sections argued the same claim in six abstract registers and showed the evidence once. Now
the claim is made once and the evidence is the second thing on the page.

**Structure.** Eight sections → five. Hero (claim) → four real perspectives (evidence) → the four
questions and the comparison, on one band (structure) → FAQ (objections) → close (act). The four
questions moved *below* the evidence on purpose: an abstraction explains something you have
already seen, or it explains nothing.

**Deleted.** The "Knowledge feed" section and its invented reader quote. The concept-search
mock-up and its non-existent concept. The duplicate "One book. Four ways in." cards. The in-page
anchor nav — a five-section page does not need a table of contents, and it was already hidden
below 960px. The scroll cue. Every icon, including the open-book brand mark.

**The record.** One typographic pattern does three jobs: a mono stamp in a 150px docket column,
then title, text and attribution in the text column. Used for perspectives (type stamp), for the
four questions (01–04), and echoed in the comparison. It is a newspaper listing, not a card — no
box, no fill, no radius, rules only.

**Evidence, verified.** All four perspectives are real published rows, with their real type,
title, first lines, book, author and writer. One is by the single non-team writer on the site and
is attributed to them. Attribution sits on its own line, prefixed "Written by", so three names in
a row can never be read as three authors of the book.

**The honest number.** "Fifty-one perspectives are written. Here are four." The site is small and
the page says so rather than implying abundance. This is also the one line that would go stale;
it is commented in the source next to the data.

**Type.** Three weights (300/400/600) replacing eleven. One ladder, no half-pixels. Mono for every
label at 0.18em; numerals at 0.06em with tabular figures, because "01" at full caps tracking reads
as "0 1". Prose at 56–70 characters. Found and fixed a real bug on the way: a `ch` measure cap on
a wrapper resolves against the wrapper's body-sized font, so it was strangling 46px headings into
five short lines.

**Colour.** Two near-identical dark panels became one, and it is the close. The mint, the cream and
the yellow are retired. Green survives as type colour only — the second sentence of the headline,
and the mono labels.

**Verified.** 320 / 390 / 640 / 1024 / 1440: no horizontal overflow at any width, one left axis
held at every width (masthead, h1, every section heading and every record flush at the same edge).
Touch targets 52px and 44px. Body text 5.5:1 or better on paper, 7.3:1 or better on the dark
panel. FAQ open state checked, not just closed. Console clean. 640px stands in for 200% zoom of a
1280 window; 320px is the WCAG reflow floor.

## Score after

| Axis | Score |
|---|---|
| Hierarchy | 5 |
| Rhythm | 5 |
| Type | 5 |
| Placement | 5 |
| Restraint | 5 |
| Authorship | 5 |
| **AI-score (30 − total)** | **0** |

Could a prompt have produced this? No. The page's main section is a typeset index of real
arguments with "Written by BookSphere Team" printed under each, under a heading that volunteers
how few of them exist. That is a decision available only to someone who looked at the data and
chose honesty over the appearance of scale.

**What is not fixed and is not mine to fix:** the product behind "Start reading" is a different
visual language from this page. Logged in `questions.md` #1.
