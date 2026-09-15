// Which perspective prompts a book page offers, and in what order.
//
// Kept free of imports so it runs directly under Node (see scripts/test-prompt-selection.mjs)
// and so the rules below stay the single definition the audit script also reads.
//
// The four angles come from two reading-talk frameworks. Aidan Chambers' "Tell Me" asks
// readers for likes, dislikes, puzzles and patterns; Borton's reflection model adds "now
// what?" - what someone did with it. For non-fiction that last one matters most, so the four
// primary angles are: what changed (use), what clicked (see), what puzzles you (ask), and
// where you would push back (argue). Patterns become "link" - a reserve angle, because
// connecting a book to another book asks more of a first-time writer than the other four.

export type PromptAngle = "use" | "see" | "ask" | "argue" | "link";

export const PRIMARY_ANGLES: PromptAngle[] = ["use", "see", "ask", "argue"];

// Which perspective types may carry each angle. "What Did Not Work" is one option under
// "argue", never the angle itself - the product is understanding in every direction.
export const POST_TYPES_BY_ANGLE: Record<PromptAngle, string[]> = {
  use: ["Application", "Real-Life Result", "Personal Experience"],
  see: ["Insight", "Summary"],
  ask: ["Question"],
  argue: ["Disagreement", "Limitation", "What Did Not Work"],
  link: ["Connection"]
};

export type SelectablePrompt = { id: string; angle: PromptAngle; title: string };

export function normalizePromptTitle(value: string) {
  return value.toLowerCase().replace(/[‘’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

// A prompt counts as answered when a perspective records its id, or - for perspectives
// written before the id was stored - when a perspective still carries its exact question.
export function selectPrompts<T extends SelectablePrompt>(
  pool: T[],
  answered: { ids?: Iterable<string>; titles?: Iterable<string> },
  limit = 4
): T[] {
  const ids = new Set(answered.ids || []);
  const titles = new Set([...(answered.titles || [])].map(normalizePromptTitle));
  const open = pool.filter((prompt) => !ids.has(prompt.id) && !titles.has(normalizePromptTitle(prompt.title)));

  // One per primary angle first, so a new reader always sees the whole range.
  const picked: T[] = [];
  for (const angle of PRIMARY_ANGLES) {
    const next = open.find((prompt) => prompt.angle === angle);
    if (next) picked.push(next);
  }
  // An angle that has run out hands its slot to a connection prompt, then to the next open
  // prompt in angle order, so the block stays full for as long as anything is unanswered.
  for (const prompt of open) {
    if (picked.length >= limit) break;
    if (prompt.angle === "link" && !picked.includes(prompt)) picked.push(prompt);
  }
  for (const prompt of open) {
    if (picked.length >= limit) break;
    if (!picked.includes(prompt)) picked.push(prompt);
  }
  return picked.slice(0, limit);
}
