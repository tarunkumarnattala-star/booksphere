# Summary

What changed across BookSphere, the system everything now draws from, and what I flagged but
did not fix.

The brief for this run was one seam: the landing page was ink on paper and the product behind
it was an iOS-style app, so a stranger who tapped "Start reading" arrived at a different
company. The product came toward the landing page.

---

## 1. What changed

### The token layer, first

`src/app/globals.css` now carries the landing page's own system, so every screen draws from
one source:

- **Paper `#f6f7f2`**, flat. The white radial gradient painted over the old `#f5f5f7` is gone.
- **Four ink steps** with stated jobs and measured contrast: `--ink` 16.3:1, `--ink-70` 8.7:1,
  `--ink-50` 5.5:1 (the floor for body text), `--accent #18392d` 11.6:1 - type only, never a
  field. Gold, blue, green and the second grey are retired; one alert ink remains, for errors.
- **Radius 0.** One value, and the value is zero.
- **No shadows.** There is no `shadow-`, no `rounded-`, no `bg-white` and no `backdrop-blur`
  left anywhere in `src`.
- **Spacing 4 / 8 / 12 / 20 / 32 / 52 / 84**, each step about 1.6x the last, so a gap says
  without ambiguity whether two things belong together.
- **Three weights.** 300 display, 400 prose, 600 mono label. Tailwind's `font-medium` is pulled
  to 400 and `font-semibold` to 600 in globals so a stray utility cannot introduce a fourth.
- **The mono label at 0.18em.** Every all-caps run in the product is tracked; untracked caps is
  the fastest way to make a label look like a default.
- 1,256 lines of dead CSS for a landing page replaced in August were deleted (1,600 → 637).

### The record: one form for the thing this product makes

A perspective is the unit of content, so it got one printed form and the same form everywhere -
Home, book page, genre, profile, saved shelf, search results, the feed, the admin queue: a
**150px docket column** carrying the type stamp, and a text column at 58 characters carrying the
title, the opening lines, the book, and who wrote it. The same pattern the landing page uses for
the same content, so arriving from there is continuous.

The cover, the chapter name, the step number in a reading path, the group label and the section
label all sit in that same 150px column. The product has **one left axis**.

### Screen by screen

**Home** opens with the unanswered question and nothing drawn around it. The closing shelf
labelled six covers MOST DISCUSSED while every discussion count in the catalogue is zero, and
showed books already named above it; one line about all 394 books replaces it. The "Hot" chip
that ranked nothing is gone. Ten cover images left the page.

**The book page** printed two taxonomies for one idea: the composer's three groups and a
seven-box "perspective map" that also duplicated the list below it. The three groups won, moved
into `lib/perspective-groups.ts`, and now spine the page with lived outcomes first. `coreThesis`
is literally `description + " " + whyMatters` for every book without an editorial override, so
the same two sentences were printed twice, 900px apart; they run once.

**The perspective** was inside a 32px white card at 87 characters per line under ten pill
buttons, two of which read "0". It is one column at 70 characters, and every count prints only
when it is not zero.

**The write flow** hid the product's own argument inside a dropdown showing "Insight". All
eleven kinds are on the page under their three group labels, in the product's order.

**The feed** gave every note an avatar, a Follow button, the badge "Thoughtful Reader" - awarded
to everyone - and two zero counters. Notes are records.

**Books** had its one control 900px down the page under a slogan, eighteen pills and five cards.
The field is under a heading that counts the catalogue live. "Trending ideas" and "Readers also
continued with" stopped describing editorial lists as popularity and behaviour.

**Genre** was the worst screen in the app: six shelves, all padded by `withFallback`, printing
Atomic Habits five times under five labels. The shelf is printed once, as an index.

**Profile** opened with two counts of an empty `follows` table. **Saved** filled an empty shelf
with other people's books. **Sign in** called a free product a private beta. All three say what
is true.

**The share cards** were dark green with a rounded square where a logo would go - a third visual
language, and the first one a stranger sees. They are paper and ink.

### Copy

Every reader-facing string I touched holds the vocabulary: perspective, replies, book, note.
Admin stopped calling a feed note a "perspective". No exclamation marks, no "Welcome back", no
three-adjective lines, no "Oops". Empty states say the specific true thing ("Nobody has written
about this one yet", "Nothing kept yet", "This is the first page of it") and none has an
illustration.

---

## 2. The system

Written up in full in `design/system.md`. In one paragraph: paper and four inks; one accent used
only as type; spacing on a 4px base at ratio 1.6; a type ladder with named roles and three
weights; mono labels at 11px/600/0.18em; radius 0; no shadows; rules as the only container; one
button in two tones; one ruled field; one record; prose held to 58-70 characters; motion is a
160ms colour change and a 180ms page fade, and nothing else moves.

---

## 3. Measured

| | Before | After |
|---|---|---|
| `/explore` | 864.1 KB, 10 cover images | **838.5 KB, 0 images** |
| `/book/atomic-habits` | 1,575.5 KB, 58 requests | **1,396.1 KB, 52 requests** |
| `/feed` | 1,002.9 KB | **942.7 KB** |
| `/genre/<slug>` | ~60 cover requests | **2** |
| `globals.css` | 1,600 lines | **637** |
| Icon library | `lucide-react`, 13 files | **removed from package.json** |
| Components imported by nothing | 8 | **0** |

`npm run typecheck`, `npm run lint` and `npm run build` exit 0.

---

## 4. Structural issues flagged, not fixed

All are written up with the reasoning in `design/questions.md`:

1. **The seven-cluster `perspectiveClusters` taxonomy is retired** from the UI in favour of the
   product's three groups. Confirmation owed. One cluster, "Best Summary - judged especially
   clear and useful by the community", describes a judgement nobody has made.
2. **Replies left the book page.** They were rendered in a rail for whichever perspective sorted
   first; they live on the perspective's own page, which is the only place a reply can be about
   one thing.
3. **The eight-option sort bar is no longer drawn.** Hot / Rising / Top Today over a list of one,
   every option ranking by zeroes. `?sort=` still works.
4. **Awards and usefulness reactions.** Six award types and six reaction types is a lot of
   machinery for an audience of zero, and it is the strongest "pretend community" signal left in
   the product. I made them quiet; whether they should exist yet is a product call.
5. **`getBookActivityLine` carries emoji** (🔥 ❤️ 💡 👍) on three branches that only fire when a
   count is non-zero. Every count is hard-coded 0 today. I did not touch `data.ts`.
6. **Six editorial shelf functions are now called by no screen**, because `withFallback` pads any
   short shelf until it is a copy of the others. A rule is owed for when a shelf may exist.
7. **The connections page** exists for a feature with nothing in it.
8. **The BookSphere Team profile bio** says "community"; it is a database row.
9. **The landing page's hard-coded "Fifty-one perspectives" and four excerpts** are now the only
   numbers in the product that are not counted live. You are fixing that separately.
10. **Admin shows eight figures above the funnel.** I would cut four; which four is yours.

---

## 5. Could a prompt have produced any of this?

No, and the specific reasons are the ones worth keeping:

- A docket column that carries the type stamp on every record in the product, so the eye scans
  *what kind of account this is* down one axis before reading a word.
- A book page whose spine is the product's argument about which kinds of perspective matter -
  lived outcomes first, summary last - rather than a tab strip.
- Counts that appear only when they are not zero, on a product with no readers yet.
- A genre page that prints its whole shelf once, as an index, instead of six carousels of the
  same six books.
- A home page that admits the catalogue is far bigger than the writing in it.
- "Free. You sign in with Google at this step, not before it," at the foot of the composer.

Every one of those required knowing what the data actually holds and choosing to say it.
