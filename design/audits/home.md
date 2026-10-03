# Audit - Home `/explore` (and the shell it sits in)

Captured at 390, 1024 and 1440 before any change: `design/shots/explore-before-*.png`.

## 1. The one thing

**A question about a real book that nobody has answered.** It is the only thing on this page
that asks the reader for something, and the only thing that cannot be found anywhere else.
Everything below it is evidence that answering is worth doing.

## 2. Where it belongs

- The open question belongs here and is here. Correct.
- "What readers made of these books" belongs here: this is the only place the whole corpus is
  visible at once. Correct.
- "Books people are arguing about" claims a ranking the data cannot support. `discussionCount`
  is `0` on all 394 books, so `getMostDiscussed()` is returning the catalogue in file order and
  labelling six covers **MOST DISCUSSED**. The shelf also repeats the books already named under
  each perspective directly above it. Wrong place and wrong claim.
- The "Hot" chip on every single perspective is an engagement ranking computed from likes and
  comments this product does not have. It implies activity that does not exist.
- Footer line "BookSphere turns books into useful, human perspectives" is a slogan, and the
  landing page already says this better.

## 3. The reading path

Intended: question → answer it → the perspectives.
Actual at 390: logo lockup → **Hot** → the question → two pill buttons → PERSPECTIVES →
"What readers made of these books" → a 10-item list → a cover grid. The grey "Hot" chip sits
first in every row and is the one thing that means nothing.

## 4. The grid

`max-w-[1560px]` with 24px gutters, so at 1440 the perspective previews run 100-110 characters
per line - half as readable again as they should be. The hero card is inset from the same
gutter but has its own 24px internal padding, so its text sits on a different left edge from
the section headings below it. Two left edges, 24px apart, for the whole page.

## 5. The spacing scale

Distinct vertical gaps in the markup: 6, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48 - twelve
values, mostly Tailwind defaults, none of which group anything. The gap between the hero card
and the section below it (8px + 32px padding) is the same as the gap between two unrelated
perspectives.

## 6. The type scale

`caption` 12/550/0.075em gold, 10px variant, 11px chips, 13px meta, 14px, 15px/500, 16px,
17px, 26px/500, 34px/500, `title-1` clamp(32-48)/470. Nine sizes, five weights, two of them a
half-step apart (470 and 500) which is a decision made twice. All-caps labels at 0.075em is
default tracking with a rounding error on it.

## 7. Generic tells present

- Hero number/statement in a big rounded white card at the top (28px radius, soft shadow).
- Pill buttons, two of them, one with an icon beside a word that does not need it.
- Pill chips: "Hot" on all ten rows.
- Icons beside every label in both navs (Compass, UsersRound, LibraryBig, UserRound) and in the
  brand lockup (an open book in a rounded square - the named tell).
- Book covers in a uniform grid of identical cards with a repeated label underneath.
- Glassmorphism: `backdrop-filter: blur(22px) saturate(180%)` on the top nav, `blur-2xl` on the
  bottom bar.
- A white radial gradient painted over the page background.
- Section header = bold text, with "See All ›" on shelves elsewhere.
- Emoji in `getBookActivityLine`: 🔥 ❤️ 💡 👍 (latent - every count is 0 today, so they do not
  render, but they are one non-zero row away).

## 8. Verdict

Yes, a prompt produced this. "Build a clean modern book app home screen with a featured
question card, a list of reviews and a trending shelf" gets you this screen including the
shadow radius and the Hot chip. **AI-score 23.**
