import { notFound } from "next/navigation";
import { CreateDiscussionForm } from "@/components/create-discussion-form";
import { books, getBook } from "@/lib/data";
import type { PostType } from "@/lib/types";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

const POST_TYPES: PostType[] = ["Insight", "Question", "Application", "Disagreement", "Quote", "Summary", "Personal Experience"];

// The catalog is the complete set of valid params, so anything else is genuinely not a
// page. Declaring that lets Next answer with a real 404 at the routing layer; calling
// notFound() from inside the page renders the right screen but still returns HTTP 200,
// which reads to a crawler as a valid page and gets indexed.
export const dynamicParams = false;

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);
  if (!book) return pageMetadata({ title: "Book not found", noIndex: true });
  return pageMetadata({
    title: `Share a perspective on ${book.title}`,
    description: `Write what you applied, questioned, challenged, or learned from ${book.title}.`,
    path: `/book/${book.id}/create-discussion`,
    noIndex: true
  });
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
