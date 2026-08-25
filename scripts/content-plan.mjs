#!/usr/bin/env node
/**
 * Builds BookSphere carousels from hand-curated source material.
 *
 *   npm run dev                       (the card renderer runs on the dev server)
 *   node scripts/content-plan.mjs --posts 12 --start 2026-09-01
 *
 * Writes to content-plan/:
 *   plan.json           every post, machine-readable, matching the ops data model
 *   captions.md         captions and slide copy, ready to review
 *   VERIFY.md           every factual claim that needs a human before publishing
 *   cards/post-01/      one PNG per slide
 *
 * Source material is content/book-knowledge.json, written by hand. Nothing factual is
 * generated here - quotes, notable references and the claims about what a book argues all
 * come from that file, because a model produces invented endorsements fluently and one
 * fabricated "Bill Gates called this his favourite book" costs more trust than a month of
 * posts earns.
 *
 * Every post follows the retention structure in the strategy: recognition, open loop,
 * payoff, application or second perspective, reflection prompt.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const POSTS = Number(argOf("posts", "12"));
const START = argOf("start", new Date().toISOString().slice(0, 10));
const ORIGIN = argOf("origin", "http://localhost:3016");
const OUT = argOf("out", "content-plan");

const source = JSON.parse(readFileSync("content/book-knowledge.json", "utf8"));
const HOOKS = JSON.parse(readFileSync("content/hooks.json", "utf8"));

// A first slide has under 50 milliseconds and about five to eight words to earn a stop.
// The previous hooks ran ten to fourteen words and led with the book's title - which asks
// a stranger to care about the book before they have been given a reason to.
const hookCursor = new Map();
function hookFor(pillarId, book) {
  const list = HOOKS[pillarId] || [];
  if (!list.length) return `${book.title} — ${book.author}`;
  // Count per pillar, not per post. The global index moved in lockstep with the four-pillar
  // rotation, so every quote post drew hook 1 and three posts in twelve were identical.
  const n = hookCursor.get(pillarId) || 0;
  hookCursor.set(pillarId, n + 1);
  const line = list[n % list.length];
  return line.replace(/\{title\}/g, book.title).replace(/\{author\}/g, book.author);
}
const BOOKS = source.books.filter((b) => b.title && b.core_idea);

// ---------------------------------------------------------------- pillars
//
// Each builds a carousel. Every slide has to carry value on its own, so none of them is a
// title card or a logo - the strategy is explicit that a slide repeating the previous one
// in different words is a wasted slide.

const PILLARS = [
  {
    id: "understand",
    name: "Understand a famous book quickly",
    needs: (b) => b.core_idea && b.misses && b.apply,
    build: (b, hook) => ({
      hookLine: hook,
      slides: [
        { kind: "hook", eyebrow: "One idea first", title: hook, footer: `${b.title} · ${b.author}` },
        { kind: "idea", eyebrow: "What it actually argues", title: b.core_idea, footer: b.title },
        { kind: "idea", eyebrow: "What summaries flatten", title: b.misses, footer: b.title },
        { kind: "apply", eyebrow: "Try it this week", title: b.apply, footer: b.title },
        { kind: "ask", eyebrow: "Your turn", title: "If you have read it — what did you actually do differently?", body: "Not what you underlined. What changed.", footer: b.title }
      ],
      caption:
        `${b.title} — ${b.author}\n\n` +
        `${b.core_idea}\n\n` +
        `The part most summaries drop: ${lowerFirst(b.misses)}\n\n` +
        `One thing to try: ${lowerFirst(b.apply)}\n\n` +
        `If you have read it — what did you actually do differently? Not what you underlined. What changed.`
    })
  },
  {
    id: "quote",
    name: "The line worth keeping",
    needs: (b) => b.quote && b.tension,
    build: (b, hook) => ({
      hookLine: hook,
      slides: [
        { kind: "hook", eyebrow: "One line", title: hook, footer: `${b.title} · ${b.author}` },
        { kind: "quote", eyebrow: "The line", title: b.quote, attribution: `${b.author} · ${b.title}`, footer: b.quote_note ? "Note on the quote in the caption" : "" },
        { kind: "idea", eyebrow: "Why it lands", title: b.core_idea, footer: b.title },
        { kind: "tension", eyebrow: "And where it gets harder", title: b.tension, footer: b.title },
        { kind: "ask", eyebrow: "Your turn", title: "Does that hold up in your experience, or not?", body: "The disagreement is more useful than the agreement.", footer: b.title }
      ],
      caption:
        `"${b.quote}"\n— ${b.author}, ${b.title}\n\n` +
        `${b.core_idea}\n\n` +
        `Where it gets harder: ${lowerFirst(b.tension)}\n\n` +
        (b.quote_note ? `A note on the quote: ${b.quote_note}\n\n` : "") +
        `Does it hold up in your experience? The disagreement is more useful than the agreement.`
    })
  },
  {
    id: "argument",
    name: "The argument inside the book",
    needs: (b) => b.tension && b.core_idea,
    build: (b, hook) => ({
      hookLine: hook,
      slides: [
        { kind: "hook", eyebrow: "The argument inside it", title: hook, footer: `${b.title} · ${b.author}` },
        { kind: "tension", eyebrow: "The tension", title: b.tension, footer: b.title },
        { kind: "idea", eyebrow: "What the book claims", title: b.core_idea, footer: b.title },
        { kind: "ask", eyebrow: "Your turn", title: "Which side of that have you actually lived?", body: "Both readings are defensible. That is what makes it worth discussing.", footer: b.title }
      ],
      caption:
        `${b.title} — ${b.author}\n\n` +
        `${b.tension}\n\n` +
        `The book's own position: ${lowerFirst(b.core_idea)}\n\n` +
        `Which side of that have you actually lived? Both readings are defensible, which is exactly why it is worth discussing.`
    })
  },
  {
    id: "notable",
    name: "A notable reader's perspective",
    // Only runs where a documented public reference exists in the source file. There is no
    // fallback that invents one.
    needs: (b) => Boolean(b.notable),
    build: (b, hook) => ({
      hookLine: hook,
      slides: [
        { kind: "hook", eyebrow: "Widely recommended", title: hook, footer: `${b.title} · ${b.author}` },
        { kind: "idea", eyebrow: "The public reference", title: b.notable, footer: "Verify before posting" },
        { kind: "idea", eyebrow: "What is actually in it", title: b.core_idea, footer: b.title },
        { kind: "ask", eyebrow: "Your turn", title: "Recommendations are not results. Did it work for you?", footer: b.title }
      ],
      caption:
        `${b.title} — ${b.author}\n\n` +
        `${b.notable}\n\n` +
        `What is actually in it: ${lowerFirst(b.core_idea)}\n\n` +
        `Recommendations are not results, though. If you read it — did anything change?`
    })
  }
];

// ---------------------------------------------------------------- helpers

function lowerFirst(text = "") {
  const t = (text || "").trim();
  return t ? t[0].toLowerCase() + t.slice(1) : t;
}

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function slideUrl(slide, i, total) {
  const params = new URLSearchParams({
    kind: slide.kind,
    eyebrow: slide.eyebrow || "",
    title: slide.title || "",
    body: slide.body || "",
    attribution: slide.attribution || "",
    footer: slide.footer || "",
    index: String(i + 1),
    total: String(total)
  });
  return `${ORIGIN}/api/card?${params.toString()}`;
}

// ---------------------------------------------------------------- schedule

const schedule = [];
const usedByPillar = new Map();
for (let i = 0; i < POSTS; i += 1) {
  const pillar = PILLARS[i % PILLARS.length];
  const eligible = BOOKS.filter(pillar.needs);
  if (!eligible.length) continue;
  const used = usedByPillar.get(pillar.id) || new Set();
  const fresh = eligible.filter((b) => !used.has(b.title));
  const pool = fresh.length ? fresh : eligible;
  const book = pool[i % pool.length];
  used.add(book.title);
  usedByPillar.set(pillar.id, used);
  schedule.push({ pillar, book });
}

// ---------------------------------------------------------------- build

mkdirSync(join(OUT, "cards"), { recursive: true });

const plan = [];
const verifications = [];

for (let i = 0; i < schedule.length; i += 1) {
  const { pillar, book } = schedule[i];
  const piece = pillar.build(book, hookFor(pillar.id, book));
  const id = String(i + 1).padStart(2, "0");
  const dir = join("cards", `post-${id}`);
  mkdirSync(join(OUT, dir), { recursive: true });

  const slides = piece.slides.map((slide, n) => ({
    n: n + 1,
    kind: slide.kind,
    copy: slide.title,
    file: join(dir, `slide-${n + 1}.png`),
    url: slideUrl(slide, n, piece.slides.length)
  }));

  plan.push({
    id: `BS-${id}`,
    date: addDays(START, i),
    pillar: pillar.id,
    pillarName: pillar.name,
    book: `${book.title} — ${book.author}`,
    format: `carousel · ${slides.length} slides`,
    hook: piece.hookLine,
    slides,
    caption: piece.caption,
    status: "Idea"
  });

  if (book.verify) {
    verifications.push({ id: `BS-${id}`, book: book.title, check: book.verify, notable: book.notable || null });
  }
}

writeFileSync(join(OUT, "plan.json"), JSON.stringify(plan, null, 2));

writeFileSync(
  join(OUT, "captions.md"),
  `# BookSphere carousels\n\n` +
    plan
      .map(
        (p) =>
          `## ${p.id} · ${p.date} · ${p.pillarName}\n\n` +
          `**Book:** ${p.book}\n\n**Format:** ${p.format}\n\n### Slides\n\n` +
          p.slides.map((s) => `${s.n}. *(${s.kind})* ${s.copy}`).join("\n") +
          `\n\n### Caption\n\n${p.caption}\n`
      )
      .join("\n---\n\n")
);

writeFileSync(
  join(OUT, "VERIFY.md"),
  `# Check these before publishing\n\n` +
    `Every factual claim below came from hand-written source material rather than from ` +
    `generation — but a human still confirms it. One invented quotation or endorsement ` +
    `costs more trust than a month of posts earns.\n\n` +
    verifications
      .map(
        (v) =>
          `- **${v.id} · ${v.book}**\n  - ${v.check}` +
          (v.notable ? `\n  - Public reference used on a slide: ${v.notable}` : "")
      )
      .join("\n\n") +
    `\n`
);

let ok = 0;
let failed = 0;
for (const post of plan) {
  for (const slide of post.slides) {
    try {
      const res = await fetch(slide.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(join(OUT, slide.file), Buffer.from(await res.arrayBuffer()));
      ok += 1;
    } catch (error) {
      failed += 1;
      if (failed === 1) {
        console.error(`  slide render failed (${error.message}) — is "npm run dev" running on ${ORIGIN}?`);
      }
    }
  }
}

console.log(`${OUT}/ — ${plan.length} carousels, ${ok} slides rendered${failed ? `, ${failed} failed` : ""}`);
console.log(`${verifications.length} posts carry a claim to verify — see ${OUT}/VERIFY.md`);
