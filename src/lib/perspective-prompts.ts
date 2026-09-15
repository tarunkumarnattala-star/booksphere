import type { Book, PostType } from "./types";
import type { PromptAngle } from "./prompt-selection";
import part01 from "./perspective-prompts/part-01.json";
import part02 from "./perspective-prompts/part-02.json";
import part03 from "./perspective-prompts/part-03.json";
import part04 from "./perspective-prompts/part-04.json";
import part05 from "./perspective-prompts/part-05.json";
import part06 from "./perspective-prompts/part-06.json";
import part07 from "./perspective-prompts/part-07.json";
import part08 from "./perspective-prompts/part-08.json";
import part09 from "./perspective-prompts/part-09.json";
import part10 from "./perspective-prompts/part-10.json";
import part11 from "./perspective-prompts/part-11.json";
import part12 from "./perspective-prompts/part-12.json";
import part13 from "./perspective-prompts/part-13.json";
import part14 from "./perspective-prompts/part-14.json";
import part15 from "./perspective-prompts/part-15.json";
import part16 from "./perspective-prompts/part-16.json";
import part17 from "./perspective-prompts/part-17.json";
import part18 from "./perspective-prompts/part-18.json";
import part19 from "./perspective-prompts/part-19.json";
import part20 from "./perspective-prompts/part-20.json";

// Book-specific perspective prompts. The text lives in perspective-prompts/*.json so it can be
// written and audited (scripts/audit-prompts.mjs) without touching code; the rules for which
// prompts show live in prompt-selection.ts.

export type PerspectivePrompt = { id: string; angle: PromptAngle; postType: PostType; title: string; hint: string };

// How each angle is labelled on the page - from the reader's side, not the product's.
export const ANGLE_LABELS: Record<PromptAngle, string> = {
  use: "What changed",
  see: "What clicked",
  ask: "What puzzles you",
  argue: "Where you'd push back",
  link: "What it connects to"
};

type PromptRow = [string, string, string, string];

const promptsByTitle = Object.assign({}, part01, part02, part03, part04, part05, part06, part07, part08, part09, part10, part11, part12, part13, part14, part15, part16, part17, part18, part19, part20) as Record<string, PromptRow[]>;

// Ids are <book slug>:<angle><n>, numbered within an angle in file order. They are stored on
// perspectives, so a book's rows may be appended to but never reordered or removed.
export function promptPoolForBook(book: Book): PerspectivePrompt[] {
  const counts: Partial<Record<PromptAngle, number>> = {};
  const pool: PerspectivePrompt[] = (promptsByTitle[book.title] || []).map(([angle, postType, title, hint]) => {
    const key = angle as PromptAngle;
    counts[key] = (counts[key] || 0) + 1;
    return { id: `${book.id}:${key}${counts[key]}`, angle: key, postType: postType as PostType, title, hint };
  });
  // Connecting the book to another book or experience is the reserve angle: it asks the most
  // of a first-time writer, so it only appears once one of the four primary angles runs out.
  pool.push({
    id: `${book.id}:link1`,
    angle: "link",
    postType: "Connection",
    title: `What other book or experience helps explain ${book.title}?`,
    hint: "The pairing, and what it adds"
  });
  return pool;
}
