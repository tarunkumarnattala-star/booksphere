import { getSupabaseFeedContributions } from "./contributions";
import { authorProfileFor, getBook } from "./data";
import { supabase } from "./supabase";

export type LandingPerspective = {
  type: string;
  title: string;
  excerpt: string;
  book: string;
  author: string;
  writer: string;
};

// The four the landing page leads with, by title. They are chosen, not latest-first: they show
// four different kinds of thinking on four different books, which is the argument the page makes.
// Each is read live, so if one is edited or taken down the page follows rather than quoting a
// version of it that no longer exists.
const LEAD_TITLES = [
  "The value here is that it refuses to give you a formula",
  "Habit stacking assumes a stable life. Whose life is stable?",
  "Is deep work a skill, or a privilege dressed as a skill?",
  "I Learned Not to Trust Every Thought"
];

const EXCERPT_LIMIT = 260;

function excerptOf(body: string) {
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length <= EXCERPT_LIMIT) return text;
  const cut = text.slice(0, EXCERPT_LIMIT);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return end > 120 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// null means "we could not count", and the page must then say nothing about how many there are.
// A printed number that was not counted is the same failure as an invented quote.
async function countPublished(): Promise<number | null> {
  if (!supabase) return null;
  const { count, error } = await supabase
    .from("discussion_posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  if (error || typeof count !== "number") return null;
  return count;
}

export async function getLandingEvidence(): Promise<{ count: number | null; perspectives: LandingPerspective[] }> {
  const [count, posts] = await Promise.all([countPublished(), getSupabaseFeedContributions(60)]);

  const usable = posts.filter((post) => Boolean(getBook(post.bookId)) && post.body.trim().length > 80);
  const byTitle = new Map(usable.map((post) => [post.title, post]));
  const lead = LEAD_TITLES.map((title) => byTitle.get(title)).filter(Boolean);
  // If one of the four is gone, the next longest real perspective takes its place rather than
  // leaving a hole or repeating a book already shown.
  const shownBooks = new Set(lead.map((post) => post!.bookId));
  const fill = usable
    .filter((post) => !lead.includes(post) && !shownBooks.has(post.bookId))
    .sort((a, b) => b.body.length - a.body.length);
  const chosen = [...lead, ...fill].slice(0, 4);

  return {
    count,
    perspectives: chosen.map((post) => {
      const book = getBook(post!.bookId);
      return {
        type: post!.postType,
        title: post!.title,
        excerpt: excerptOf(post!.body),
        book: book?.title || "",
        author: book?.author || "",
        writer: authorProfileFor(post!).name
      };
    })
  };
}
