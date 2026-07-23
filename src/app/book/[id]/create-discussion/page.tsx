import { notFound } from "next/navigation";
import { CreateDiscussionForm } from "@/components/create-discussion-form";
import { books, getBook } from "@/lib/data";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default async function CreateBookDiscussionPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const book = getBook(id);
  if (!book) notFound();

  return (
    <div className="editorial-page max-w-5xl">
      <CreateDiscussionForm book={book} initialPostType={query.type === "Question" ? "Question" : "Insight"} />
    </div>
  );
}
