import { NextResponse } from "next/server";
import { getBookCover } from "@/lib/covers";
import { books } from "@/lib/data";

const MAX_QUERY_LENGTH = 180;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "").trim();
  const author = (searchParams.get("author") || "").trim();
  const isbn = (searchParams.get("isbn") || "").trim() || undefined;

  if (!title || !author || title.length > MAX_QUERY_LENGTH || author.length > MAX_QUERY_LENGTH || (isbn?.length || 0) > 32) {
    return NextResponse.json({ coverUrl: null, error: "Missing title or author" }, { status: 400 });
  }

  const catalogBook = books.find((book) => book.title.toLowerCase() === title.toLowerCase() && book.author.toLowerCase() === author.toLowerCase());
  if (!catalogBook) {
    return NextResponse.json({ coverUrl: null, error: "Unknown catalog book" }, { status: 404 });
  }

  const resolvedCover = await getBookCover({ title: catalogBook.title, author: catalogBook.author, isbn: catalogBook.isbn });

  return NextResponse.json(
    { coverUrl: resolvedCover },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=2592000, stale-while-revalidate=86400" } }
  );
}
