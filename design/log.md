# Log

AI-score is 30 minus the six axis scores. A screen is done when every axis is 4 or 5 and
Authorship is 5.

| Screen | Status | AI-score before → after | The core decision |
|---|---|---|---|
| Landing `/` | done (earlier pass) | 20 → 0 | Printed the evidence instead of describing it. Re-judged at the end of this pass: still 0. |
| Shell: masthead, bottom bar, footer | **done** (1 pass) | 24 → 0 | Four tracked words under a hairline, and a log-in that stopped being the loudest thing on every screen. |
| Home `/explore` | **done** (1 pass) | 23 → 0 | The question is the page. The shelf that labelled six covers MOST DISCUSSED against a count of zero is gone. |
| Book `/book/[id]` | **done** (1 pass) | 25 → 0 | Perspectives printed in the product's own three groups, from one shared list. |
| Perspective `/discussion/[id]` | **done** (1 pass) | 22 → 0 | One column of prose at 70 characters; counts only when they are not zero. |
| Write `/book/[id]/create-discussion` | **done** (1 pass) | 23 → 0 | All eleven kinds on the page, in their three groups, lived outcomes first. |
| Feed `/feed` | **done** (1 pass) | 24 → 0 | A note is a record, not a social card with a Follow button and two zeroes. |
| Note `/post/[id]` | **done** (1 pass) | 22 → 0 | The same page shape as a perspective. |
| Books `/search` | **done** (1 pass) | 24 → 0 | The field is the page; nothing claims a trend. |
| Genre `/genre/[slug]` | **done** (1 pass) | 26 → 0 | One shelf printed once as an index, instead of six carousels of the same six books. |
| Genres `/genres` | **done** (1 pass) | 22 → 0 | How many books are on each shelf. |
| Reading path `/path/[slug]` | **done** (1 pass) | 21 → 0 | A numbered list, because that is what a reading path is. |
| Profile `/profile/[username]` | **done** (1 pass) | 23 → 0 | Stopped opening with two counts of an empty table. |
| Connections `/profile/[username]/connections` | **done** (1 pass) | 24 → 1 | Two words and a rule; honest empty states. |
| Saved `/saved` | **done** (1 pass) | 25 → 0 | An empty shelf says it is empty instead of filling itself with other people's books. |
| Replies `/notifications` | **done** (1 pass) | 22 → 0 | Replies as records; "New" is a stamp, not a coloured pill. |
| Settings `/settings` | **done** (1 pass) | 22 → 0 | Three ruled fields and what they are for. |
| Sign in `/login` | **done** (1 pass) | 24 → 0 | "Sign in to write" replaces "Join the private beta". |
| Privacy / Terms | **done** (1 pass) | 18 → 1 | Set as a reference document: section label in the docket, text in the column. |
| Admin analytics / reports | **done** (1 pass) | 20 → 2 | Facts block, square bars, and a feed note stopped being called a perspective. |
| Not found / error / root error | **done** | — | Ranged left on the paper like every other page. |
| Loading | **done** | — | The shimmering mock-up is replaced by the word "Loading". |
| First-use guide | **done** | — | A paper note with one ink rule, not a floating white pill. |
| Share cards (OpenGraph) | **done** | — | Paper and ink, matching what the link opens. |
| Empty states (book, feed, saved, replies, search, connections, profile) | **done** | — | Each says the true thing; none has an illustration. |

## Scores, screen by screen

| Screen | Hierarchy | Rhythm | Type | Placement | Restraint | Authorship | AI-score |
|---|---|---|---|---|---|---|---|
| Landing | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Shell | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Home | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Book | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Perspective | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Write | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Feed | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Note | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Books | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Genre | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Genres | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Reading path | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Profile | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Connections | 5 | 5 | 5 | 4 | 5 | 5 | 1 |
| Saved | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Replies | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Settings | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Sign in | 5 | 5 | 5 | 5 | 5 | 5 | 0 |
| Privacy / Terms | 5 | 5 | 5 | 5 | 5 | 4 | 1 |
| Admin | 4 | 5 | 5 | 5 | 5 | 4 | 2 |

Three scores below 5, each with a reason:

- **Connections, Placement 4.** The page exists for a feature nobody can use yet - following,
  on a product with 51 perspectives all by one account. It is honest and well set, but it is
  in the product's navigation (from a profile) before it has any content. That is a product
  call, not a design one; it is written up in `questions.md`.
- **Privacy / Terms, Authorship 4.** Legal text set properly is still legal text. There is a
  limit to how much of a point of view a privacy policy should have, and I did not push past
  it.
- **Admin, Hierarchy 4 and Authorship 4.** Internal screens. The funnel is the only thing on
  them worth looking at and it now reads first among the sections, but the two blocks of eight
  figures above it are still eight figures. I would cut four of them; which four is the
  founder's call, not mine.

## Page weight, measured on `next start` (same method before and after)

| Route | Before | After | Images before → after |
|---|---|---|---|
| `/explore` | 864.1 KB, 47 req | **838.5 KB**, 47 req | 10 covers → **0** |
| `/book/atomic-habits` | 1,575.5 KB, 58 req | **1,396.1 KB**, 52 req | 5 → 1 above the fold |
| `/feed` | 1,002.9 KB, 48 req | **942.7 KB**, 47 req | 0 → 0 |
| `/discussion/<id>` | 1,021.0 KB, 51 req | **996.6 KB**, 51 req | 1 → 1 |
| `/genre/<slug>` | ~60 cover requests across six carousels | **1,080.6 KB, 2 images** | 60 → 2 |

`globals.css` went from 1,600 lines to 637, including the deletion of 1,256 lines of dead CSS
for a landing page that was replaced in August. `lucide-react` is no longer a dependency: no
screen in the product imports an icon library. Eight components that nothing imported any more
are deleted.
