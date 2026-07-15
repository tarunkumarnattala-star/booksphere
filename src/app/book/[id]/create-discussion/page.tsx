import { notFound } from "next/navigation";
import { CreateDiscussionForm } from "@/components/create-discussion-form";
import { books, getBook } from "@/lib/data";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default async function CreateBookDiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  return (
    <div className="editorial-page max-w-5xl">
      <CreateDiscussionForm book={book} />
    </div>
  );
}
