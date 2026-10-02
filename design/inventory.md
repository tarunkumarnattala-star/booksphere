# Inventory

Step 0 was run narrow: only the landing page is in scope for this pass. The routes below are
listed so the next pass has a map, but only `/` has been audited.

## In scope this pass

| Screen | Route | What it is for | The one thing |
|---|---|---|---|
| Landing | `/` | The page a stranger from Reddit, Instagram or TikTok lands on. It has to say what this is and prove it before the thumb moves. | **Someone read the book and wrote down what they made of it. You can read that, and argue with it.** |

### Where each concept lives on `/`

| Concept | Home | Notes |
|---|---|---|
| The four questions every book page asks | Landing hero | Appeared **twice** before this pass: as four tiles in the hero and again as four numbered cards 6,000px down, same words. Now stated once, in the hero, as a typeset list. The book page is the place it is *used*; the landing is the place it is *declared*. |
| What a perspective looks like | Landing, directly under the hero | Was one card in the hero plus an invented "reader reflection" pull-quote further down. Now one section of four real perspectives. |
| Why not ratings / summaries | Landing, "What the others give you" | Sharpest copy on the page. Was buried under a 102px headline and a restated lead. |
| Concept search | Nowhere on the landing now | Was a mock-up of a concept ("Dopamine loops") that does not exist in the product. Removed; see questions.md. |
| Free / no account / sign in to write | Hero fine print + FAQ | Correct in both: the hero states it, the FAQ answers it. |
| Early access | Hero eyebrow + footer | Reference, not duplicate. |

## Not audited (future passes)

`/explore`, `/book/[id]`, `/post/[id]`, `/create`, `/feed`, `/search`, `/genre/[slug]`,
`/genres`, `/path/[slug]`, `/profile/[username]`, `/saved`, `/notifications`, `/settings`,
`/login`, `/privacy`, `/terms`, `/discussion/[id]`.

One cross-app finding is recorded in `questions.md`: the landing page and the product behind
it are currently two different visual languages.
