// A wrong book slug in the editorial layer does not throw: getBook returns undefined and the
// card simply never renders. The page stays green and the work disappears. This fails the
// build instead.
//
// It also holds the rules the editorial layer is written under, so they survive the person
// who wrote them: every book carries all five kinds, every practice names a concrete first
// move, every contested card points at a book that exists, and nothing claims to be a reader.

import { readFileSync } from "node:fs";

const editorial = readFileSync("src/lib/editorial.ts", "utf8");
const data = readFileSync("src/lib/data.ts", "utf8");

// The catalogue's ids are slugs of the titles, built the same way data.ts builds them.
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const rowBlock = data.match(/const bookRows[^=]*=\s*\[(.*?)\n\];/s);
const titles = [...(rowBlock?.[1] ?? "").matchAll(/\[\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
const catalogue = new Set(titles.map(slugify));

const entryBlock = editorial.match(/const entries: BookEditorial\[\] = \[(.*)\n\];/s)?.[1] ?? "";
const entries = entryBlock.split(/\n  \{\n    bookId: /).slice(1);

const problems = [];
const seen = new Set();
let cardCount = 0;

for (const chunk of entries) {
  const bookId = chunk.match(/^"([^"]+)"/)?.[1];
  if (!bookId) continue;

  if (!catalogue.has(bookId)) {
    problems.push(`${bookId}: not a book in the catalogue - the cards would silently vanish`);
  }
  if (seen.has(bookId)) problems.push(`${bookId}: listed twice`);
  seen.add(bookId);

  const kinds = [...chunk.matchAll(/kind: "(\w+)"/g)].map((m) => m[1]);
  cardCount += kinds.length;
  for (const required of ["argument", "practice", "limit", "contested", "misread"]) {
    if (!kinds.includes(required)) {
      problems.push(`${bookId}: has no "${required}" card - the five kinds are the whole product claim`);
    }
  }

  // Every practice card must hand over an action, not a principle.
  const practices = chunk.split(/kind: "practice"/).length - 1;
  const tryIts = chunk.split(/tryIt:/).length - 1;
  if (tryIts < practices) {
    problems.push(`${bookId}: ${practices} practice cards but only ${tryIts} with a "Try this"`);
  }

  for (const [, opponent] of chunk.matchAll(/argumentWith: "([^"]+)"/g)) {
    if (!catalogue.has(opponent)) {
      problems.push(`${bookId}: argues with "${opponent}", which is not in the catalogue`);
    }
  }
}

// The one thing that would destroy the product's credibility: editorial writing in a reader's
// voice. These cards are BookSphere's, and are labelled as such on screen.
const impersonation = [/\bI tried\b/i, /\bI started\b/i, /\bwhen I read\b/i, /\bfor me,? it\b/i, /\bmy own experience\b/i];
for (const pattern of impersonation) {
  const hit = editorial.match(pattern);
  if (hit) problems.push(`editorial card speaks as a reader ("${hit[0]}") - these are BookSphere's, never a person's`);
}

if (problems.length) {
  console.error("editorial audit FAILED\n");
  for (const problem of problems) console.error("  - " + problem);
  process.exit(1);
}

console.log(`editorial: ${seen.size} books, ${cardCount} cards, all five kinds on every book, every slug resolves`);
