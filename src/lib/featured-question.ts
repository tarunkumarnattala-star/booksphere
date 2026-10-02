import { books, getMostDiscussed } from "./data";
import { getAnsweredStarterPrompts } from "./answered-prompts";
import { promptPoolForBook, type PerspectivePrompt } from "./perspective-prompts";
import { selectPrompts } from "./prompt-selection";
import type { Book } from "./types";

// One real question nobody has answered yet, for the top of Home.
//
// It rotates by day so the page is not the same screen every visit, and it skips questions
// that already have an answer - an open question is an invitation, an answered one is just
// a link. Capped at three books so a page build never waits on a long chain of lookups.
export async function getFeaturedQuestion(): Promise<{ book: Book; prompt: PerspectivePrompt } | null> {
  const discussed = getMostDiscussed();
  const pool = discussed.length ? discussed.slice(0, 12) : books.slice(0, 12);
  if (!pool.length) return null;

  const day = Math.floor(Date.now() / 86_400_000);
  for (let attempt = 0; attempt < Math.min(3, pool.length); attempt += 1) {
    const book = pool[(day + attempt) % pool.length];
    const answered = await getAnsweredStarterPrompts(book.id);
    const [prompt] = selectPrompts(promptPoolForBook(book), answered, 1);
    if (prompt) return { book, prompt };
  }
  return null;
}
