import { GenreDirectory } from "@/components/genre-directory";
import { genres, getBooksForGenre } from "@/lib/data";

export default function GenresPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="container-page py-10 md:py-14">
        <p className="caption mb-4">BookSphere Shelves</p>
        <h1 className="large-title max-w-5xl">
          Find the reading room that matches the idea you are chasing.
        </h1>
        <p className="body-copy mt-5 max-w-2xl">
          Genres are not filing cabinets here. They are focused discussion rooms built around books, questions, applications, and reader insight.
        </p>
      </section>
      <GenreDirectory genres={genres} booksByGenre={getBooksForGenre} heading="All Genres" subtitle="Choose a shelf to see top books, rising books, and the best insights inside it." />
    </div>
  );
}
