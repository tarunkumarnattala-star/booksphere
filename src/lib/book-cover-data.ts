import type { Book } from "./types";

export type BookCoverData = Pick<Book, "title" | "author" | "isbn" | "coverUrl">;

export function bookCoverData(book: Book): BookCoverData {
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    coverUrl: book.coverUrl
  };
}
