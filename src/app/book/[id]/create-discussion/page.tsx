import { notFound } from "next/navigation";
import { CreateDiscussionForm } from "@/components/create-discussion-form";
import { books, getBook } from "@/lib/data";
import type { PostType } from "@/lib/types";

const POST_TYPES: PostType[] = ["Insight", "Question", "Application", "Disagreement", "Quote", "Summary", "Personal Experience"];

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default async function CreateBookDiscussionPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ type?: string; title?: string }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const book = getBook(id);
  if (!book) notFound();

  const postType = POST_TYPES.includes(query.type as PostType) ? (query.type as PostType) : "Insight";
  // Starter prompts on an empty book page deep-link here with a title already chosen,
  // so the writer starts from a question instead of a blank field.
  const initialTitle = typeof query.title === "string" ? query.title.slice(0, 180) : "";

  return (
    <div className="editorial-page max-w-5xl">
      <CreateDiscussionForm book={book} initialPostType={postType} initialTitle={initialTitle} />
    </div>
  );
}
