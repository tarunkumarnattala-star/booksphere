# Audit - Feed `/feed`

Before: `design/shots/feed-before-390.png`, `feed-before-1440.png`.

## 1. The one thing
The most recent thing somebody wrote - and, for a signed-in reader, the box to write in.

## 2. Where it belongs
Correct. The Feed is the one place a note without a book belongs, and it says so.

## 3. The reading path
Header, composer, three prompts, then a column of **social cards**: avatar circle, name,
"Thoughtful Reader", a Follow button, the note, a context chip, a heart reading 0 and a
speech bubble reading 0.

## 4. The grid
`max-w-[980px]`, cards at 24px radius with 20-24px internal padding, so the note text sits
on a different left edge from the section labels. The composer is a card inside the column
with its own avatar gutter, a third left edge.

## 5. The spacing scale
8, 12, 16, 20, 24, 28, 40 - and the gaps between cards (20) are the same as the gaps inside
them, so nothing groups.

## 6. The type scale
22px/500 titles, 15/16px bodies, 14px/600 names, 12px meta, 10px captions, 13px counters.

## 7. Generic tells present
- Social-feed cards: avatar circle, display name, role label, Follow, hearts.
- **"Thoughtful Reader" under every single name** - an invented badge, awarded to everyone.
- Follow buttons on a product where nobody follows anybody.
- 0 likes and 0 comments printed on every note.
- A book icon inside a grey context pill.
- Three starter prompts as grey rounded boxes.
- A pill toast with a tick icon.

## 8. Verdict
Yes - this is a social feed template with book words in it. **AI-score 24.**

## What changed
Notes are records in the same form as perspectives: topic in the docket column, then the
note, what it was about, and who wrote it with the date. The avatar, the role badge, the
Follow button and both zero counters are gone. Several notes were a single sentence used as
both title and body and printed it twice; the repeat is dropped. The composer is a ruled
field with one text control and one ink button.
