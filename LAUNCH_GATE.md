# BookSphere Launch Gate

This is the frozen-product checklist. Do not add major features until every blocker here is resolved.

Last QA pass: July 2, 2026.

## Core Journey

| Step | Beta preview status | Public launch status | Notes |
| --- | --- | --- | --- |
| Visit BookSphere | YES | YES | `/` renders the explore experience directly. |
| Understand value in 5 seconds | YES | YES | The hero clearly frames BookSphere as a place to discover books through meaningful reader insights and discussions. |
| Browse books | YES | YES | Explore shelves, genre shelves, search, and reading paths work from seed data. |
| Open a book | YES | YES | Book pages render cover, metadata, community signal, discussion sorting, comments, actions, and read-next shelf. |
| Read discussion | YES | YES | Discussion cards render seeded and local beta discussions. |
| Create account | YES for beta local account | NEEDS SUPABASE QA | Local beta login works without Supabase; production must test Google/email auth. |
| Post insight | YES in local beta | NEEDS SUPABASE WRITE QA | Local insight appears on the book page and survives refresh. Production should write to `discussion_posts`. |
| Get engagement | YES in local beta | NEEDS SUPABASE WRITE QA | Likes, saves, follows, awards, reports, and comments persist locally. Production writes need end-to-end QA. |
| Return tomorrow | YES on same browser | NEEDS SUPABASE | Local browser state persists; cross-device/account persistence requires Supabase. |

## Product Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Homepage immediately explains product | YES | Headline, subcopy, search, metrics, and live reading room are clear. |
| Search works | YES | Includes aliases for `investment`, `invetsment`, `genres`, and `geners`. |
| Genres work | YES | `/genres` and `/genre/[slug]` exist and use non-empty fallback shelves. |
| Books load | YES | Static seed data loads 100 books. |
| Covers load correctly | YES | All 100 seed books have explicit real Open Library cover URLs. |
| Discussions work | YES | Seeded discussions plus local beta posts. |
| Comments work | YES in beta | Comments persist locally and have top/new sorting. |
| Save book works | YES in beta | Local persistence; Supabase table exists. |
| Save insight works | YES in beta | Local persistence; `/saved` now reads actual local saved insight IDs. |
| Follow works | YES in beta | Contributor and discussion follows persist locally. |
| Profiles work | YES | Profile pages render intellectual identity sections. |
| Settings work | YES in beta | Profile settings save a local beta draft instead of being a dead form. |
| Share action works | YES in beta | Copies/opens share URL when browser support is available. |
| Report button works | YES in beta | Persists report state locally. |

## Design Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Mobile looks great | NEEDS HUMAN DEVICE QA | Code is responsive, but real device QA is still required. |
| Desktop looks great | PARTIAL PASS | Major blank-space and overflow bugs were fixed; user should do a final visual scan in browser. |
| No layout breaks | PARTIAL PASS | Type/lint/build pass; recent hero/book-page overlap issues were fixed. Still needs human visual sweep. |
| No placeholder images | YES for seed books | Inputs still use placeholder helper text, which is expected. |
| No lorem ipsum | YES | No lorem ipsum found. |
| No fake real users | YES | Starter accounts are clearly `BookSphere Team`, `Community Starter`, `Reader Ops`, or local `You`. |
| No star ratings | YES | Discovery is based on discussion, saves, recommendations, and curation. |

## Performance Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Fast loading | YES locally | Production build passes and routes are static/SSG where possible. |
| Optimized images | PARTIAL | Covers use real remote URLs and lazy loading; later production can add an image cache/proxy. |
| No console errors | NEEDS BROWSER QA | Build/type/lint pass; browser console still needs manual check in the running app. |
| No crashes | YES in build | Production build passes. |

## Trust Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Report button works | YES in beta | Persists locally; production DB write needs QA. |
| Users can delete own content | YES in beta | Local posts can be deleted. Production RLS exists; mutation wiring needs QA. |
| Login works | YES in beta | Local beta login works. Production Supabase auth needs QA. |
| Logout works | YES in beta | Local logout works. Supabase logout code exists. |
| Error messages are friendly | YES | Login-required and validation messages are user-facing. |

## Final Private Beta Blockers

1. Complete one human visual scan on desktop and mobile widths.
2. Check browser console manually while testing the main journey.
3. Test local beta login, create insight, save book, save insight, comment, follow, report, delete.
4. Invite 10 people quietly and watch where they hesitate.

## Final Public Launch Blockers

1. Connect create discussion to Supabase writes.
2. Connect comments to Supabase writes.
3. Connect post actions to Supabase writes: likes, save insight, follow discussion, awards, report, delete own post.
4. Run real Google/email auth QA.
5. Run mobile device QA.
6. Run browser console QA.
7. Add production analytics dashboard/event review.

## Launch Recommendation

Private beta: YES after one final visual pass in the browser.

Broad public launch: NOT YET. Finish Supabase persistence, real auth QA, mobile device QA, and console QA first.
