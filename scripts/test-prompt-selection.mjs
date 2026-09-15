// Runs the prompt selection rules against small hand-built pools. Node 24 strips the types.
import assert from "node:assert/strict";
import { selectPrompts } from "../src/lib/prompt-selection.ts";

const p = (id, angle, title = id) => ({ id: `b:${id}`, angle, title });
const pool = [p("use1", "use"), p("use2", "use"), p("see1", "see"), p("see2", "see"),
  p("ask1", "ask"), p("ask2", "ask"), p("argue1", "argue"), p("argue2", "argue"), p("link1", "link")];
const ids = (list) => list.map((x) => x.id.slice(2));

assert.deepEqual(ids(selectPrompts(pool, {})), ["use1", "see1", "ask1", "argue1"], "fresh book shows one per angle");
assert.deepEqual(ids(selectPrompts(pool, { ids: ["b:use1"] })), ["use2", "see1", "ask1", "argue1"], "answered prompt rotates within its angle");
assert.deepEqual(ids(selectPrompts(pool, { ids: ["b:ask1", "b:ask2"] })), ["use1", "see1", "argue1", "link1"], "exhausted angle hands its slot to link");
assert.deepEqual(ids(selectPrompts(pool, { ids: ["b:ask1", "b:ask2", "b:link1"] })), ["use1", "see1", "argue1", "use2"], "then to the next open prompt");
assert.deepEqual(ids(selectPrompts(pool, { titles: ["SEE1 "] })), ["use1", "see2", "ask1", "argue1"], "legacy title match counts as answered");
assert.deepEqual(ids(selectPrompts(pool, { ids: pool.map((x) => x.id) })), [], "everything answered shows nothing");
assert.deepEqual(ids(selectPrompts([p("see1", "see", "What’s it?")], { titles: ["Whats it?"] })), [], "curly apostrophes normalise");
console.log("prompt selection: 7 checks passed");
