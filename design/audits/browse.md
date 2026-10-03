# Audit - Genre `/genre/[slug]`, Genres `/genres`, Reading path `/path/[slug]`

Before: `design/shots/genre-before-1440.png` (5,291px), `genres-before-1440.png`,
`path-before-1440.png`.

## 1. The one thing
Genre: **the books on this shelf.** Genres: **the shelves, and how big each one is.**
Path: **book one, and the order.**

## 2. Where it belongs - the finding that governs this pass

The genre page carried **six shelves**: Editor's Picks, Core Books, Beginner Essentials,
Hidden Gems, Recently Added, and a reading-path rail. Every one of them runs through
`withFallback`, which pads a short shelf first with the genre's editor's picks and then with
every other book in the genre. On Personal Growth that printed **Atomic Habits five times**,
under five different labels, down one page - and Deep Work four times, and Meditations four
times. Six labels, one list.

## 3. The reading path
Cover fan in a rounded box, a search card with four preview cards, then 36 cover cards in six
carousels, then perspectives.

## 4. The grid
`max-w-[1560px]` full-bleed carousels with their own 16/24/32px gutters, next to a
`container-page` header with 24px gutters. Nothing lines up.

## 5. The spacing scale
py-6, py-8, py-10, py-12, py-14, mb-5, mt-5, gap-3, gap-5 - the section rhythm changes between
every shelf.

## 6. The type scale
`large-title`, `title-2`, `title-3`, `subheadline`, `caption` at 10px, plus 12, 13, 15, 16,
17px literals.

## 7. Generic tells present
- Horizontal cover carousels, six of them, with identical cards and a repeated badge.
- A cover fan inside a rounded cream box as a "hero".
- A card advertising search, with a sparkle icon, inside the genre directory.
- "Official Path" with a book icon.
- `interactive-lift` translate on hover.

## 8. Verdict
Yes, emphatically. **AI-score 26** - the worst screen in the app.

## What changed
Three books with a real `isEditorsPick` flag lead, with no padding. Then the whole shelf,
printed once, as a two-column index: 64 books on Personal Growth, each with its author and
any real editorial flag beside it, so a reader can see the size and shape of the shelf
instead of scrolling six carousels of the same six covers. Reading paths and perspectives
follow; the index closes the page because it is the reference, not the invitation.

`/genres` is the same index one level up: how many books are on each shelf, its name, what it
holds. The card advertising search is gone - search has its own tab.

A reading path is a numbered list, which is what a reading path is. The step number is the
docket; the fanned covers that said nothing about sequence are gone.
