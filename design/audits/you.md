# Audit - Profile, Connections, Saved, Replies, Settings, Sign in, Legal, Admin, the guide

Before: `design/shots/profile-p1-*.png` (captured mid-pass), and the live screens.

## The findings that mattered

**Profile opened with two numbers that count an empty table.** Followers and Following led a
four-item stat row, as large numerals, linked. Both are real counts of the `follows` table,
which has almost nothing in it - so the first thing anyone saw on any profile was *nobody
follows this person*. The three counts that are worth having - perspectives, notes, books
referenced - were third and fourth. Now those three are the facts row, and the connections
page is one quiet line at the foot of the page.

**The saved shelf filled an empty shelf with other people's things.** With no saves,
`savedInsights` fell back to `getSavedInsightPosts(4)` and the book shelf to "Books readers
save most", directly under a heading reading "Your saved shelf is ready". A reader with
nothing saved saw four perspectives and six books that were not theirs. An empty shelf now
says it is empty and shows nothing.

**The sign-in page framed a free product as invite-only.** "Join the private beta. Or log
back in." It now says what is true: reading never asks for an account, writing does.

**Three sign-in buttons promised Google** on a build where Google is behind an env flag and
email magic links are what actually appear. They say "Sign in".

**Admin called a feed note a "Feed perspective".** Perspective is the one word this product
reserves for a contribution about a book.

**Connections printed counts of an empty table** beside both tabs, and the empty state
offered "Discover readers" - a thing the product cannot do.

## Generic tells removed
Avatar circles with initials (profile, connections, note cards, composer), four stat cards in
a row, pill tabs, pill buttons, a tick in a circle, a shield icon, a bell icon, a bar chart
icon, two "no results" circles, `rounded-full` progress bars, the last 13 lucide icons -
and with them `lucide-react` itself, which is no longer a dependency.

## Verdict before
Profile 23, Connections 24, Saved 25, Replies 22, Settings 22, Sign in 24, Legal 18,
Admin 20.
