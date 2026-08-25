import { books } from "@/lib/data";

// The catalog as JSON, for tooling that needs the real rows rather than a guess at the
// shape of data.ts. A first attempt at the content generator parsed that file with a
// regular expression and confidently produced books called "green" by "gold" - the pattern
// matched the colour-tone arrays. Everything here is already public on 394 rendered pages;
// what this adds is a source that cannot be misread.
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    count: books.length,
    books: books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      whyMatters: book.whyMatters,
      genres: book.genres,
      bestForTags: book.bestForTags,
      mostDiscussedThemes: book.mostDiscussedThemes,
      publishedYear: book.publishedYear
    }))
  });
}
