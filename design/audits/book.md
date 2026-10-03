# Audit - Book `/book/[id]` (captured on `/book/atomic-habits`)

Before: `design/shots/book-before-390.png` (6,409px tall), `book-before-1440.png` (5,383px).

## 1. The one thing

**What people made of this book**, next to the book itself. The catalogue entry is the
premise; the perspectives are the product.

## 2. Where it belongs

Four things are in the wrong place or exist twice:

- **Two taxonomies for one idea.** The composer groups the eleven perspective types into the
  product's three groups - what happened when you used it / where it breaks down /
  understanding the idea. The book page ignores that and shows a seven-box "perspective map"
  built from `perspectiveClusters`: Applied It, Biggest Perspective, What Did Not Work,
  Disagreed, Best Summary, Connected It, Questions. Two different answers to "what kinds are
  there", on two screens of the same product.
- **The map duplicates the list.** Atomic Habits has one perspective. The map shows it, then
  the list below shows the same one again, in full.
- **"Share a perspective" appears four times** on one page (header, map, list header, empty
  state), "Ask a question" twice.
- **Replies in a 340px right rail.** Replies belong to one perspective, and the perspective
  has its own page where they already live. In the rail they are attached to whichever post
  happens to be first.

## 3. The reading path

Cover, title, author - correct. Then: a description, a tag row, a save/recommend/not-for-me
control cluster, two more buttons, a three-tab jump row, and only then anything a reader came
for. Six controls before the first idea.

## 4. The grid

`editorial-page max-w-[1320px]`, 24px gutters, with seven panels at four different radii
(20, 24, 28, 32) and three different internal paddings. The cover column is 220px at lg,
150px at sm, 96px below that - three widths, none of which line up with anything else on the
page. No shared left axis: the header text starts at the cover's right edge, the panels start
at the page gutter, and the panel contents start 24-32px inside that. Three left edges.

## 5. The spacing scale

Vertical gaps in the markup: 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 64. Thirteen values.
`mt-5 / mt-5 / mt-5 / mt-10 / mt-8 / mt-6 / mt-10 / mt-12 / mt-16` - the page's section rhythm
changes every section.

## 6. The type scale

`title-1`, `title-2`, `title-3`, `caption` at 9px, 10px and 12px, `body-copy`, `subheadline`,
`footnote`, plus 11, 12, 13, 14, 15, 16, 17, 30, 42, 58px literals. Sixteen sizes. The 9px
caption is below the floor for legibility and sits beside a 58px title.

## 7. Generic tells present

- Seven white rounded cards, four radii, soft shadows, cards nested inside cards (the map's
  cluster card contains a white sub-card containing the post).
- Pills everywhere: genres, best-for tags, concepts, source links, awards, usefulness
  reactions, eight sort chips, and ten action buttons.
- Icons beside words that do not need them: BookOpen, MessageCircle, Scale, PenLine, Bookmark,
  ThumbsUp, ThumbsDown, Heart, Award, Flag, Share2, Pencil, Trash2.
- A sort bar with eight options - Hot, New, Rising, Top Today, Top Week, Top Month, Top All
  Time, Controversial - over a list of one.
- Engagement theatre: like count, comment count, save count, follow count, six award types and
  six "usefulness" reactions, all reading zero.
- "Only perspectives readers have actually contributed appear here" - a disclaimer that exists
  because the surrounding design implies otherwise.

## 8. Verdict

Yes. This is what you get from "build a rich book detail page": a hero card, a stats row, a
tab strip, feature cards, a review list with sort chips, a comment rail and a related-books
carousel. **AI-score 25.**
