import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { GenreDirectory } from "@/components/genre-directory";
import { books, genres, getBooksForGenre } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Genres",
  description: "Every shelf in BookSphere, and how many books are on it.",
  path: "/genres"
});

export default function GenresPage() {
  return (
    <div className="editorial-page">
      <header>
        <p className="caption">Shelves</p>
        <h1 className="large-title mt-4 max-w-[16ch]">
          <span className="numeral">{genres.length}</span> shelves, <span className="numeral">{books.length}</span> books
        </h1>
        <p className="body-copy measure mt-5">
          A shelf is a way into the catalogue, not a filing cabinet. Open one to see what is on it
          and what people have written about it.
        </p>
      </header>
      <GenreDirectory genres={genres} booksByGenre={getBooksForGenre} />
    </div>
  );
}
