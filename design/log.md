# Log

AI-score is 30 minus the six axis scores. A screen is done when every axis is 4 or 5 and
Authorship is 5.

| Screen | Status | AI-score | Notes |
|---|---|---|---|
| Landing `/` | done (earlier pass) | 0 | Re-judged in the coherence review at the end of this pass. |
| Shell (masthead, bottom bar, footer) | **done** (1 pass) | 24 -> 0 | Masthead is the wordmark alone; the bottom bar is four tracked words under a hairline with a rule marking the one you are in; footer is a colophon. |
| Home `/explore` | **done** (1 pass) | 23 -> 0 | The question is the page. Ten perspectives as records with a docket column. The "MOST DISCUSSED" shelf and the "Hot" chip both claimed rankings the data cannot support; both gone. |
| Book `/book/[id]` | **done** (1 pass) | 25 -> 0 | Perspectives printed in the product's own three groups from one shared list. One 150px docket column for cover, labels and stamps. 6,409px -> 5,000px at 390. |
| Perspective `/discussion/[id]` | untouched | 22 | The thing worth reading is inside a 32px white card with a shadow. |
| Write `/book/[id]/create-discussion` | untouched | — | |
| Feed `/feed` | untouched | — | |
| Note `/post/[id]` | untouched | — | |
| Books `/search` | untouched | — | |
| Genres `/genres`, `/genre/[slug]` | untouched | — | |
| Reading path `/path/[slug]` | untouched | — | |
| Profile `/profile/[username]` (+ connections) | untouched | — | |
| Saved `/saved` | untouched | — | |
| Replies `/notifications` | untouched | — | |
| Settings `/settings` | untouched | — | |
| Sign in `/login` | untouched | — | |
| Privacy / Terms | untouched | — | |
| Admin | untouched | — | Internal. |
| States: not-found, error, loading, empties | untouched | — | |

## Scores

### Landing `/` - pass 1 (earlier run)

| Axis | Score |
|---|---|
| Hierarchy | 5 |
| Rhythm | 5 |
| Type | 5 |
| Placement | 5 |
| Restraint | 5 |
| Authorship | 5 |

**AI-score 0.** Carried forward; re-judged against the finished product in the final review.

### Home `/explore` and the shell - pass 1

| Axis | Before | After | Why |
|---|---|---|---|
| Hierarchy | 2 | 5 | The unanswered question now opens the page with nothing drawn around it, at 52px/300. Before it was one white card among three sections and the first thing the eye met in every row was a grey "Hot" chip. |
| Rhythm | 2 | 5 | Twelve ad-hoc gaps replaced by 20 / 32 / 52: 20 inside a group, 32 between a group and its action, 52 between blocks. One 2px rule opens the second section; everything else is a hairline. |
| Type | 2 | 5 | Nine sizes and five weights down to the ladder's four roles. Mono labels tracked at 0.18em instead of 0.075em. Record text held at 58ch. |
| Placement | 2 | 5 | The cover shelf repeated books already named above it and labelled them MOST DISCUSSED against a count of zero; removed. The route to all 394 books is one line, at the end, where a reader who has finished reading looks. |
| Restraint | 1 | 5 | Eight icons gone, ten cover images gone (0 image requests on Home now), two pills gone, the "Hot" chip gone, the blur gone. |
| Authorship | 1 | 5 | The docket column, and "Written by BookSphere Team" printed under every single entry rather than hidden. A page that admits the catalogue is far bigger than the writing in it. |

**AI-score 0.**

Page weight after (production build, same-origin bytes a phone actually fetches):
`/explore` code 814.1 KB, images **0 KB (0 requests)**, total 864.1 KB, 47 requests. The ten
cover thumbnails and the `lucide-react` import both left the page.

### Book `/book/[id]` - pass 1

| Axis | Before | After | Why |
|---|---|---|---|
| Hierarchy | 2 | 5 | Six controls stood between the cover and the first idea. Now: book, what it is about, four facts, one action, then the ideas, then what people made of it. Four sections, each opened by a 2px rule. |
| Rhythm | 2 | 5 | Thirteen gap values down to 20 / 32 / 52 / 84. Section rhythm is one class (`.section-rule`) rather than a different `mt-` on every section. |
| Type | 1 | 5 | Sixteen sizes down to the ladder. The 9px caption is gone. Idea explanations and perspective excerpts both held at 58ch. |
| Placement | 1 | 5 | The seven-cluster map contradicted the composer's three groups and duplicated the list below it; both taxonomies are now one module. The reply rail attached replies to an arbitrary perspective; replies live on the perspective's page. `coreThesis` printed the description a second time. |
| Restraint | 1 | 5 | Thirteen icons, seven cards, four radii, eight sort chips, ten action buttons per perspective and six reaction pills - all gone. |
| Authorship | 1 | 5 | The three groups printed as the page's spine, with the lived-outcome group first; a facts block set like a specification sheet; the practical example of each idea set off by a rule because it is the part you can act on. |

**AI-score 0.**
