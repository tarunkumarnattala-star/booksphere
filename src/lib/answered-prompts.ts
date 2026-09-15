import { supabase } from "./supabase";

// Which book-page prompts already have a perspective, for one book.
//
// Deliberately separate from contributions.ts: that module imports the whole catalog, and
// this runs in the browser on every book page. It needs nothing but the book's slug.
export async function getAnsweredStarterPrompts(bookSlug: string) {
  const empty = { ids: [] as string[], titles: [] as string[] };
  if (!supabase) return empty;

  const { data: dbBook } = await supabase.from("books").select("id").eq("slug", bookSlug).maybeSingle();
  if (!dbBook?.id) return empty;

  const withIds = await supabase
    .from("discussion_posts")
    .select("starter_prompt_id, title")
    .eq("book_id", dbBook.id)
    .eq("status", "published");
  if (!withIds.error && withIds.data) {
    const rows = withIds.data as Array<{ starter_prompt_id: string | null; title: string }>;
    return { ids: rows.flatMap((row) => (row.starter_prompt_id ? [row.starter_prompt_id] : [])), titles: rows.map((row) => row.title) };
  }

  // Before the starter_prompt_id migration the column does not exist (42703), so fall back to
  // titles: a perspective started from a prompt carries that prompt as its title.
  const titlesOnly = await supabase.from("discussion_posts").select("title").eq("book_id", dbBook.id).eq("status", "published");
  if (titlesOnly.error || !titlesOnly.data) return empty;
  return { ids: [], titles: (titlesOnly.data as Array<{ title: string }>).map((row) => row.title) };
}
