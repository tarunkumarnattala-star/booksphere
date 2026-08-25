#!/usr/bin/env node
/**
 * Generates a run of pre-launch social posts from the BookSphere catalog.
 *
 *   node scripts/content-plan.mjs --days 30 --start 2026-09-01
 *
 * Writes to content-plan/:
 *   plan.json          every post, machine-readable
 *   captions.md        every caption, ready to copy
 *   cards/day-01.png   the image for each post
 *
 * Cards are rendered by /api/card on a running dev server (npm run dev), not by an image
 * model. Text is the whole content of these posts and image models still mangle text.
 *
 * Nothing here invents a reader experience. BookSphere has no outside contributors yet, so
 * a post either states an idea from a book, or asks the audience a question. The question
 * posts are the point: they are the same question the product asks, so an answer in the
 * comments is a perspective worth inviting in. The content engine and the supply engine
 * are deliberately the same machine.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const DAYS = Number(argOf("days", "30"));
const START = argOf("start", new Date().toISOString().slice(0, 10));
const ORIGIN = argOf("origin", "http://localhost:3016");
const OUT = argOf("out", "content-plan");

// ---------------------------------------------------------------- catalog

// Read the catalog from /api/catalog rather than parsing data.ts. The first version used a
// regular expression on that file and produced books called "green" by "gold" - it had
// matched the colour-tone arrays and reported 269 confident results. A JSON endpoint cannot
// be misread that way.
async function loadBooks() {
  const res = await fetch(`${ORIGIN}/api/catalog`);
  if (!res.ok) throw new Error(`catalog fetch failed: HTTP ${res.status}`);
  const data = await res.json();
  return (data.books || []).filter((b) => b.title && b.author);
}

// ---------------------------------------------------------------- formats
//
// Four formats, rotating. Each answers a different reason someone follows an account:
// recognition, usefulness, disagreement, and being asked what they think.

// Genres where a book is making a claim you could act on. Biography, history and science
// are excluded on purpose: "where does this stop working" is a real question about advice
// and a nonsense question about the Wright brothers, and the first run generated exactly
// that card before this existed.
const ADVICE_GENRES = new Set([
  "Personal Growth", "Productivity", "Business", "Career", "Communication",
  "Psychology", "Health", "Finance", "Investing", "Leadership", "Startups", "Relationships"
]);

const isAdvice = (b) => (b.genres || []).some((g) => ADVICE_GENRES.has(g));

// 381 of the 394 catalog descriptions are the generated fallback - "X by Y is a business
// title with reader perspectives, questions, and applications gathered around it" - which
// is a sentence about BookSphere, not about the book. Any format that quotes the
// description needs a real one, or the post says nothing. A run reached day 30 with that
// template as its entire caption before this existed.
const GENERIC = /is an? .*title with reader perspectives/i;
const hasRealDescription = (b) => Boolean(b.description) && !GENERIC.test(b.description);

const FORMATS = [
  {
    id: "problem",
    tag: "The problem",
    suits: (b) => isAdvice(b) && hasRealDescription(b),
    // Names a situation before naming a book. Someone recognises themselves first.
    // Speaks from the book's own material rather than asserting a fixed claim. The first
    // version hardcoded a habits argument and attached it to whatever book came up, which
    // would have put words in an author's mouth on a public account.
    build: (b) => ({
      title: `If this is the problem, this is the book.`,
      body: trimTo(b.whyMatters || b.description, 190),
      caption:
        `${b.title} — ${b.author}\n\n` +
        `${trimTo(b.whyMatters || b.description, 320)}\n\n` +
        `Worth reading only if that is a problem you actually have. Most book recommendations ` +
        `skip that part.\n\n` +
        `Is it? And did it help?`
    })
  },
  {
    id: "idea",
    tag: "One idea",
    suits: hasRealDescription,
    // The useful half of a book, in plain language, with the application attached.
    build: (b) => ({
      title: trimTo(firstSentence(b.description) || b.title, 108),
      body: `From ${b.title}.`,
      caption:
        `${b.title} — ${b.author}\n\n` +
        `${trimTo(b.description, 320)}\n\n` +
        `The useful test is not whether you agree. It is whether you can name the situation ` +
        `where you would actually use it this week.\n\n` +
        `If you have read it: what did you actually do differently?`
    })
  },
  {
    id: "limit",
    tag: "Where it breaks",
    suits: isAdvice,
    // The differentiator. Almost nobody posts the limits of a popular book.
    build: (b) => ({
      title: `Where does ${trimTo(b.title, 44)} stop working?`,
      body: `Every book is written from one person's conditions. The useful question is which of those conditions you do not share.`,
      caption:
        `Every popular book gets recommended as if it works everywhere.\n\n` +
        `${b.title} was written out of a specific set of conditions — a particular job, a particular decade, ` +
        `a particular kind of life. Some of those you share. Some you do not.\n\n` +
        `The advice fails at exactly the point where they diverge, and almost nobody writes that part down.\n\n` +
        `If you have read it: where did it stop working for you?`
    })
  },
  {
    id: "ask",
    tag: "Asking, honestly",
    suits: isAdvice,
    // The wedge, asked rather than claimed. Answers here are the product's supply.
    build: (b) => ({
      title: `Has anyone actually tried this for a month?`,
      body: `${b.title} is recommended constantly. Recommendations are not results.`,
      caption:
        `Genuine question, not a rhetorical one.\n\n` +
        `${b.title} gets recommended constantly. What I almost never see is someone saying ` +
        `what happened when they ran it for a month — what they changed, what they dropped, ` +
        `what turned out to be harder than the book made it sound.\n\n` +
        `If that is you, I would rather read your version than another summary.\n\n` +
        `What happened?`
    })
  }
];

// ---------------------------------------------------------------- helpers

function firstSentence(text = "") {
  const m = text.match(/^[^.!?]{20,140}[.!?]/);
  return m ? m[0].trim() : "";
}

function trimTo(text = "", n) {
  const t = text.trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`;
}

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Spread the books so the same title does not recur inside a week, and only offer a
// format a book it actually fits.
function pickFor(books, format, i, used) {
  const eligible = books.filter(format.suits);
  const pool = eligible.length ? eligible : books;
  const fresh = pool.filter((b) => !used.has(b.title));
  const from = fresh.length ? fresh : pool;
  const stride = Math.max(1, Math.floor(from.length / Math.max(DAYS, 1)));
  const chosen = from[(i * stride + (i % 7)) % from.length];
  used.add(chosen.title);
  return chosen;
}

// ---------------------------------------------------------------- run

const books = await loadBooks();
if (books.length < 10) {
  console.error(`Only ${books.length} books returned from ${ORIGIN}/api/catalog — is "npm run dev" running?`);
  process.exit(1);
}

mkdirSync(join(OUT, "cards"), { recursive: true });

// Schedule by what the catalog can actually support rather than by strict rotation. Only
// twelve books carry a real description, so the two formats that quote one are used at
// most twelve times and the rest of the run goes to the two that work from a title. A
// rigid rotation would have repeated those twelve books three times each and called it a
// month of content.
const descriptionFormats = FORMATS.filter((f) => ["problem", "idea"].includes(f.id));
const titleFormats = FORMATS.filter((f) => ["limit", "ask"].includes(f.id));
const descriptionCapacity = books.filter(hasRealDescription).length;

const schedule = [];
for (let i = 0; i < DAYS; i += 1) {
  // Spread the description posts evenly through the run instead of front-loading them.
  const share = descriptionCapacity / DAYS;
  const wantDescription = Math.floor((i + 1) * share) > Math.floor(i * share);
  const pool = wantDescription && descriptionCapacity ? descriptionFormats : titleFormats;
  schedule.push(pool[i % pool.length]);
}

const plan = [];
const used = new Set();
for (let i = 0; i < DAYS; i += 1) {
  // If the description pool is exhausted, fall back to a format that works from a title
  // rather than running the same book twice. A repeat four days apart in the same format
  // is the kind of thing a follower notices and an automation does not.
  let format = schedule[i];
  if (!books.some((b) => format.suits(b) && !used.has(b.title))) {
    const fallback = titleFormats.find((f) => books.some((b) => f.suits(b) && !used.has(b.title)));
    if (fallback) format = fallback;
  }
  const book = pickFor(books, format, i, used);
  const piece = format.build(book);
  const day = String(i + 1).padStart(2, "0");

  const params = new URLSearchParams({
    layout: format.id,
    tag: format.tag,
    title: piece.title,
    body: piece.body,
    book: book.title,
    author: book.author
  });

  plan.push({
    day: i + 1,
    date: addDays(START, i),
    format: format.id,
    book: `${book.title} — ${book.author}`,
    card: `cards/day-${day}.png`,
    cardUrl: `${ORIGIN}/api/card?${params.toString()}`,
    caption: piece.caption
  });
}

writeFileSync(join(OUT, "plan.json"), JSON.stringify(plan, null, 2));

const md = plan
  .map(
    (p) =>
      `## Day ${p.day} · ${p.date} · ${p.format}\n\n` +
      `**Book:** ${p.book}\n\n` +
      `**Image:** \`${p.card}\`\n\n` +
      `${p.caption}\n`
  )
  .join("\n---\n\n");
writeFileSync(join(OUT, "captions.md"), `# BookSphere content plan\n\n${md}`);

// Fetch the cards last, so a dev server that is not running costs you the images but not
// the plan.
let ok = 0;
let failed = 0;
for (const p of plan) {
  try {
    const res = await fetch(p.cardUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(OUT, p.card), buf);
    ok += 1;
  } catch (error) {
    failed += 1;
    if (failed === 1) {
      console.error(`  card render failed (${error.message}) — is "npm run dev" running on ${ORIGIN}?`);
    }
  }
}

console.log(`${OUT}/plan.json and captions.md written — ${plan.length} posts`);
console.log(`cards rendered: ${ok}${failed ? `, failed: ${failed}` : ""}`);
