// Every catalog book must carry a balanced, answerable set of perspective prompts.
// Run with --partial while prompts are still being written: missing books are counted, not fatal.
import fs from "node:fs";
import path from "node:path";
import { POST_TYPES_BY_ANGLE, PRIMARY_ANGLES, normalizePromptTitle } from "../src/lib/prompt-selection.ts";

const partial = process.argv.includes("--partial");
const dir = path.resolve("src/lib/perspective-prompts");
const src = fs.readFileSync(path.resolve("src/lib/data.ts"), "utf8");
const catalog = [...src.matchAll(/^\s*\[\s*("(?:[^"\\]|\\.)+"),\s*"(?:[^"\\]|\\.)+",\s*\d{3,4},\s*\[/gm)].map((m) => JSON.parse(m[1]));

// Words the product never uses for a contribution, and phrasing that would tilt a book
// back toward "what failed". One argue prompt may mention it; more than that is a bias.
const BANNED = /\b(reviews?|posts?|threads?|discussions?|comments?|insights?)\b/i;
const FAILURE = /\b(fail(?:ed|s|ure)?|didn'?t work|did not work|stops? working|broke|breaks? down)\b/i;

const errors = [];
const prompts = new Map();
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  for (const [title, list] of Object.entries(data)) {
    if (prompts.has(title)) errors.push(`${title}: defined twice (${file})`);
    prompts.set(title, list);
  }
}

for (const title of prompts.keys()) if (!catalog.includes(title)) errors.push(`${title}: not a catalog title`);

let missing = 0;
for (const title of catalog) {
  const list = prompts.get(title);
  if (!list) { missing += 1; if (!partial) errors.push(`${title}: no prompts`); continue; }
  const bad = (msg) => errors.push(`${title}: ${msg}`);
  if (list.length !== 8) bad(`has ${list.length} prompts, expected 8`);
  for (const angle of PRIMARY_ANGLES) {
    const n = list.filter(([a]) => a === angle).length;
    if (n !== 2) bad(`${n} "${angle}" prompts, expected 2`);
  }
  const seen = new Set();
  let failureLean = 0;
  let didNotWork = 0;
  for (const [angle, postType, question, hint] of list) {
    if (!POST_TYPES_BY_ANGLE[angle]?.includes(postType)) bad(`"${postType}" is not allowed for angle "${angle}"`);
    if (typeof question !== "string" || question.length < 4 || question.length > 120) bad(`question length ${question?.length}: ${question}`);
    if (!question.endsWith("?")) bad(`question must end with "?": ${question}`);
    if (typeof hint !== "string" || hint.length < 3 || hint.length > 80) bad(`hint length ${hint?.length}: ${hint}`);
    if (BANNED.test(question) || BANNED.test(hint)) bad(`uses a banned word: ${question} / ${hint}`);
    if (FAILURE.test(question) || FAILURE.test(hint)) failureLean += 1;
    if (postType === "What Did Not Work") didNotWork += 1;
    const key = normalizePromptTitle(question);
    if (seen.has(key)) bad(`duplicate question: ${question}`);
    seen.add(key);
  }
  if (failureLean > 1) bad(`${failureLean} prompts lean on failure; at most 1`);
  if (didNotWork > 1) bad(`${didNotWork} "What Did Not Work" prompts; at most 1`);
}

const covered = catalog.length - missing;
console.log(`prompts: ${covered}/${catalog.length} books covered, ${[...prompts.values()].reduce((n, l) => n + l.length, 0)} prompts`);
if (errors.length) {
  for (const e of errors.slice(0, 40)) console.error(`  - ${e}`);
  if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
  process.exit(1);
}
