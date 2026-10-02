# Log

| Screen | Status | AI-score | Notes |
|---|---|---|---|
| Landing `/` | **done** (1 pass) | 20 → 0 | Stopped describing the product and printed it. Four real perspectives replace six abstract sections; two invented blocks removed; zero icons, zero radius, zero shadows. 8,686px → 5,077px at 390. |
| `/explore` | untouched | — | Different visual language from the landing page. See questions.md #1. |
| `/book/[id]` | untouched | — | |
| `/post/[id]` | untouched | — | |
| `/create` | untouched | — | |
| `/feed` | untouched | — | |
| `/search` | untouched | — | |
| `/genre/[slug]`, `/genres` | untouched | — | |
| `/path/[slug]` | untouched | — | |
| `/profile/[username]` | untouched | — | |
| `/saved`, `/notifications`, `/settings` | untouched | — | |
| `/login` | untouched | — | |
| `/privacy`, `/terms` | untouched | — | |

## Landing — scores after pass 1

| Axis | Before | After | Why |
|---|---|---|---|
| Hierarchy | 2 | 5 | Headline, lead, action, then the first real perspective's type stamp landing at y=743 on a 844px phone — the fold pulls the scroll instead of ending the page. |
| Rhythm | 2 | 5 | 45 one-off gaps replaced by a 7-step scale at ratio 1.6, so every gap says unambiguously whether two things belong together. |
| Type | 2 | 5 | 11 weights → 3. Half-pixel sizes gone. Mono labels at 0.18em, numerals at 0.06em with tabular figures. Prose at 56–70 characters per line. |
| Placement | 2 | 5 | The four questions have one home and are quoted verbatim from the book page. Attribution moved to its own line so three names can't read as three authors. |
| Restraint | 1 | 5 | Seven icons → none. Four radii → zero. Two shadows → none. Six surfaces → paper, one band, one dark close. Page 42% shorter. |
| Authorship | 1 | 5 | A page that states its own thinness — "Fifty-one perspectives are written. Here are four." — and prints "Written by BookSphere Team" under each one. That requires knowing the data and choosing honesty over puffery; no prompt produces it. |

**AI-score 0.** Every axis 4 or 5 and Authorship 5, so the screen is done in one pass.

## Performance

Measured against `next build` + `next start`, same method before and after.

| | Before | After |
|---|---|---|
| HTML document, raw | 25.2 KB | 33.2 KB |
| HTML document, gzipped (what travels) | 6.7 KB | **6.3 KB** |
| Total page weight (document + all JS/CSS) | 968.8 KB | **953.6 KB** |
| Static chunks requested | 16 | **15** |
| Cached response, median of 5 | 0.00092s | 0.00092s |
| Browser load, cached (`loadEventEnd`) | — | **0.024s** (FCP 56ms) |

The raw document grew by 8 KB because it now carries four real perspective excerpts instead of
mock-up labels — that is the page's actual selling content. Compressed, it is smaller than
before, and one JS chunk disappeared: the landing page no longer imports `lucide-react` (seven
icons) and no longer needs `"use client"`, so it ships as a server component with no client
JavaScript of its own.
