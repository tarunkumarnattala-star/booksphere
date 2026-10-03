# The system

## What was there before

The landing page carried its own private token block (`--ink`, `--paper`, `--cream`, `--green`,
`--green-deep`, `--yellow`, `--muted`) and then almost never used it. Counted off the stylesheet
before this pass:

- **~45 distinct spacing values** (7, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 25, 26, 27, 28,
  30, 32, 34, 36, 40, 42, 44, 46, 54, 56, 58, 60, 64, 70, 74, 82, 86, 88, 92, 100, 104, 112, 120,
  130, 150, 210, 220, 230, 250, 260, 270, 310).
- **~40 distinct font sizes**, including 10.5, 12.5, 13.5, 14.5, 15.5, 16.5.
- **11 font weights**: 300, 320, 330, 360, 380, 410, 430, 470, 540, 560, 620.
- **4 radii** (4, 8, 16, 20, 999) and two shadows.
- **6 surface colours** across two near-identical darks (`#18392d`, `#111713`).

Fractional font sizes and eleven weights are the signature of numbers that were nudged, not
chosen. A system is what makes the next decision obvious; this was a list of exceptions.

## The system now

### Spacing — base 4, ratio ≈ 1.6

```
--s-1:  4px     hairline separation, label-to-value
--s-2:  8px
--s-3: 12px     inside a group
--s-4: 20px     between groups
--s-5: 32px     between blocks
--s-6: 52px     between a heading and its body of evidence
--s-7: 84px     between unrelated things
--s-section: clamp(72px, 12vw, 132px)   the rhythm between sections
```

Seven steps, each ~1.6× the last. The reason is legibility of grouping: on a linear 8/16/24/32
scale, 24 and 32 read as the same gap, so the eye cannot tell what belongs with what. At 1.6×
every gap is unambiguously larger than the one below it, so spacing alone carries the grouping
and no box or rule is needed to do it.

### Type — three weights, one ladder

```
--t-mono:    11px / 600 / 0.18em tracking / uppercase    labels, eyebrows, type stamps
--t-meta:    13px / 400                                  attribution, fine print
--t-body:    15px / 400 / 1.6                            body copy
--t-lead:    clamp(17px, 2.2vw, 20px) / 400 / 1.55       the paragraph under a headline
--t-title:   clamp(19px, 2.4vw, 23px) / 400 / 1.35       a perspective's own title
--t-section: clamp(32px, 7.5vw, 52px) / 300 / 1.02       section headings
--t-display: clamp(40px, 10.5vw, 72px) / 300 / 1.0       the h1, once per page
```

Three weights only: **300** for display and section headings, **400** for everything read as
prose, **600** for mono labels. Nothing in between. All-caps always gets 0.18em tracking; display
sizes always get negative tracking (−0.025em) because large type closes up on its own.

Measure is held at 60–72 characters for prose. Long titles use `text-wrap: balance`, paragraphs
use `text-wrap: pretty`, so no line ends on a single orphaned word.

### Radius — zero

One value, and the value is `0`. This is a printed document: rules, margins and type set the
hierarchy. Rounded cards, pill chips and soft shadows are the three fastest ways to make a page
look generated, and all three are now impossible because there is no radius token to reach for.
The only exception is the `50%` on nothing — there is no exception.

### Shadow — none

Removed entirely. Hierarchy comes from type size, weight, and the weight of a rule.

### Colour

```
--ink:        #121713   body, headings
--ink-70:     #42493f   secondary prose          (7.1:1 on paper)
--ink-50:     #5f665e   meta, fine print         (4.8:1 on paper)
--paper:      #f6f7f2   the page
--paper-raise:#eef1e9   one tone down, for a banded section
--accent:     #18392d   one accent, used for the second headline line and mono labels
--rule:       rgba(18, 23, 19, 0.16)
--rule-strong:rgba(18, 23, 19, 0.32)
--dark:       #121713   the single dark panel, which is the last one
--dark-ink:   #f4f3ea   type on the dark panel
--dark-ink-60:rgba(244, 243, 234, 0.64)
```

`--cream`, `--yellow` and the mint `--green` are retired. Two near-identical dark panels
(`#18392d` and `#111713`) were a decision made twice; there is now **one** dark panel on the
page and it is the close. Green survives as type colour only, never as a field.

### Motion

Hover and focus transitions at 160ms ease. Nothing animates on scroll. `prefers-reduced-motion`
removes the transitions.

---

# The product half of the system (full-app pass)

The landing page proved the system on one page. This pass puts it in `src/app/globals.css` so
every screen draws from one source, and the landing module and the product now agree.

## What the product carried before

| | Before | After |
|---|---|---|
| Ground | `#f5f5f7` with a white radial gradient painted over it | `--paper #f6f7f2`, flat |
| Surfaces | white cards at 14 / 20 / 28 / 36px radius | no cards; `--band #eef1e9` for an inset, rules for separation |
| Radius | four values plus `rounded-full` on every button and chip | **0** |
| Shadow | `--shadow-soft`, `--shadow-cover`, plus eight one-off `shadow-[...]` literals | **none** |
| Accent | gold `#a87818` on labels, plus green, blue and rose | `--accent #18392d`, type only; one alert ink for errors |
| Weights | 400 / 430 / 470 / 500 / 550 / 560 on a system font | **300 display, 400 prose, 600 mono label** |
| Labels | `.caption` at 12px / 550 / 0.075em in gold | `.caption` mono, 11px / 600 / **0.18em**, accent |
| Nav | 22px blur glass bar, bottom tab bar with four icons | flat paper masthead with a rule; the bottom bar is words, not icons |
| Motion | 200ms lifts, `translateY(-3px)` hovers, page-enter slide | 160ms colour only; the page fades, nothing moves |
| Dead CSS | 1,256 lines of a landing page that was replaced in August | deleted (globals.css 1,600 → 353 lines) |

## The ladder, with named roles

| Class | Role | Value |
|---|---|---|
| `.display-large` | the one number or word a page is about | clamp(38, 10vw, 72) / 300 / 1.0 / −0.025em |
| `.large-title` | page title, once | clamp(32, 7vw, 52) / 300 / 1.04 |
| `.title-1` | section heading | clamp(26, 5vw, 38) / 300 / 1.08 |
| `.title-2` | subsection | clamp(21, 3.2vw, 27) / 400 / 1.16 |
| `.title-3` | a record's own title | clamp(18, 2.1vw, 21) / 400 / 1.3 |
| `.lead` | the paragraph under a title | clamp(16, 2vw, 19) / 400 / 1.55 |
| `.body-copy` | body prose | 15 / 400 / 1.62 |
| `.subheadline` | supporting line | 14 / 400 / 1.5 |
| `.footnote` | fine print | 13 / 400 / 1.45 |
| `.caption` | mono label, eyebrow, type stamp | 11 / 600 / 0.18em / caps / mono |
| `.prose-perspective` | a perspective read end to end | 17 / 400 / **1.72**, capped at 68ch |
| `.numeral` | any number that carries meaning | tabular figures, 0.02em |
| `.measure` | any prose column | 68ch |

Three weights. Tailwind's `font-medium` is pulled to 400 and `font-semibold`/`font-bold` to 600
in globals, so a stray utility cannot introduce a fourth.

## Spacing

The landing scale, unchanged: 4 / 8 / 12 / 20 / 32 / 52 / 84, plus
`--s-section: clamp(52px, 9vw, 96px)`. Steps are ~1.6x apart so a gap is never ambiguous about
whether two things belong together. Tailwind's 4px scale maps onto it: use 1 / 2 / 3 / 5 / 8 /
13 / 21 only (4, 8, 12, 20, 32, 52, 84px).

## Rules

A hairline (`--rule`) separates things of the same kind. A heavier rule (`--rule-strong`, or a
2px ink rule) opens a section. A rule is the only container this product has; there are no
boxes, so a rule has to be exact: full measure, or flush to the text column, never inset by a
card's padding.

## Icons

An icon replaces a word or it does not exist. `lucide-react` is removed from every screen in
this pass except where it is the whole control (nothing qualified).

## The heading rule (set during the coherence review after six screens)

| Level | Class | Used for |
|---|---|---|
| Page | `.large-title` | the `h1`, once per page, whatever the page is |
| Section | `.title-1` | a section inside a page, always under a `.caption` label |
| Record | `.record-title` | the title of one perspective, note, idea or book in a list |
| Prompt | `.headline` | an invitation to write, deliberately a step below a record |

`/feed` was setting its `h1` at `.title-1` while `/book` and `/discussion` set theirs at
`.large-title`, so the same level of heading was two different sizes depending on the route.
Error and not-found pages follow the same rule; there is no "this page is small so its
heading is smaller" exception.

## Label-to-list spacing

A `.caption` that labels a list sits **20px** above it (`.records-tight`). A heading with a
lead paragraph sits **52px** above its list (`.records`). The gap says whether the words above
are a label or an introduction.

## Prefetch

A long index - 87 books on a genre page, 45 on a profile, 20 shelves - is a list of links a
reader scrolls past, not a list of links they are about to follow. Those carry
`prefetch={false}`, because 87 route payloads fetched in the background while someone scans a
list is a design decision too, and the wrong one on a phone. Record links, which are few and
deliberate, keep the default.
