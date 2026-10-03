# Audit - Books `/search`

Before: `design/shots/search-before-390.png`, `search-before-1440.png`.

## 1. The one thing
**The field that finds one of 394 books.**

## 2. Where it belongs
The field was **900px down the page**, under a slogan, eighteen genre pills and five
reading-path cards. The one control the page exists for was the fifth thing on it.

Also here and wrong:
- "Trending ideas, explained" - the product has no trending anything, and these six concepts
  are editorial entries with sources, not a popularity list.
- "Readers also continued with..." - computed from the book graph, not from anything a
  reader did.
- Six "Start with a goal" buttons that are canned searches for what the genres and the
  reading paths already cover.

## 3. The reading path
Slogan, lead, genre pills, path cards, THEN the field, then goal cards, then concept cards.

## 4. The grid
`max-w-[1440px]` with cards at 16, 18, 24, 26, 28, 32 and 36px radius - six radii on one
screen - and a 920px search box with a 56px circular icon inside it.

## 5. The spacing scale
8, 12, 16, 20, 24, 32, 40, 48, 64 and `space-y-16`.

## 6. The type scale
`large-title`, `title-1`, `title-2`, `title-3`, `headline`, `body-copy`, `subheadline`,
`footnote`, `caption` at 10 and 12px, plus 11, 13, 15, 17, 18 and 22px literals.

## 7. Generic tells present
- A giant rounded search bar with a circled magnifying glass.
- 18 pill chips for genres, 6 goal cards, 6 concept cards with sparkle icons.
- Book covers in uniform cards with soft shadows.
- "Turn curiosity into knowledge." - a three-word marketing line.
- Disclosure triangles hiding two-sentence paragraphs.
- A 56px circled icon above the no-results message.

## 8. Verdict
Yes. **AI-score 24.**

## What changed
The page says what it is - All 394 books, counted live - and the field is directly under it.
Underneath, three ways to reach a book in the order they are useful: genres as a typeset
line, reading paths as records, concepts as records. Results are records in the same form as
everywhere else. The concept entry is printed in full as a reference entry - term, question,
meaning, use, example, common misreading, source - with nothing behind a disclosure
triangle, because every paragraph in it is two sentences long.
