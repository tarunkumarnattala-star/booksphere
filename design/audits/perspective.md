# Audit - Perspective `/discussion/[id]`

Before: `design/shots/persp-before-390.png`, `persp-before-1440.png`.

## 1. The one thing
The account itself, read end to end. This is the unit of value in the product and the page
it has its own address for.

## 2. Where it belongs
Correct, with two gaps: the perspective carried **no date** anywhere (Home's records show
one), and the page dead-ended - nothing offered the obvious next move, writing your own on
the same book.

## 3. The reading path
Back link, then a white card, then INSIGHT, title, byline, body - correct - then ten pill
buttons, two of which read "0".

## 4. The grid
`max-w-3xl` (768px) with the article in a 32px-radius card padded 32px, so the text column
is 672px at 17px: **87 characters per line**, well past the readable band. Three cards, three
radii (32, 28, 28).

## 5. The spacing scale
6, 8, 12, 16, 20, 24, 32 - seven values, and the 32px card padding does the job a margin
should do, so the text sits on a different left edge from the back link above it.

## 6. The type scale
`caption` 12px gold, `title-1` 48px/470, 14px/500 byline, 17px/leading-8 body, 11px counters,
13px buttons. The byline and the body are different weights for no reason.

## 7. Generic tells present
- The thing worth reading is inside a rounded white card with a shadow.
- Ten pill buttons with ten icons, including two reading "0".
- "Top / New" sort over zero replies.
- Hearts for likes, a bell for replies, a bookmark for save.

## 8. Verdict
Yes - "a blog post detail page with reactions". **AI-score 22.**

## What changed
The page is now one column of prose at 664px (about 70 characters), ranged left under a 2px
rule, with the type stamp, the title, the byline and the date above it and nothing drawn
around it. Actions are two rows of tracked text: what a reader does with what they just read
(reply, like, save, share) on the first row in ink, housekeeping (useful, award, follow
replies, report, edit, delete) on the second in grey. **Counts print only when they are not
zero.** The book record at the foot carries the one move the page was missing - write your
own on this book. Replies lose the Top/New pair until there is more than one reply to order.
