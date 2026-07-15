type CoverInput = {
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string | null;
};

export function getOpenLibraryCoverUrl(isbn?: string) {
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg?default=false`;
}

export async function getBookCover({ title, author, isbn, coverUrl }: CoverInput) {
  if (coverUrl) return coverUrl;

  const googleCover = await getGoogleBooksCover(title, author, isbn);
  if (googleCover) return googleCover;

  const openLibraryCover = getOpenLibraryCoverUrl(isbn);
  if (openLibraryCover) return openLibraryCover;

  return getOpenLibrarySearchCover(title, author);
}

export async function getGoogleBooksCover(title: string, author: string, isbn?: string) {
  const query = isbn ? `isbn:${isbn}` : `intitle:${title}+inauthor:${author}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4500), next: { revalidate: 60 * 60 * 24 * 30 } });
    if (!response.ok) return null;
    const data = await response.json();
    const imageLinks = data.items?.[0]?.volumeInfo?.imageLinks;
    const cover = imageLinks?.extraLarge || imageLinks?.large || imageLinks?.medium || imageLinks?.thumbnail;
    return cover ? cover.replace("http://", "https://") : null;
  } catch {
    return null;
  }
}

export async function getOpenLibrarySearchCover(title: string, author: string) {
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=5&fields=cover_i,isbn`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "BookSphere MVP cover resolver" },
      signal: AbortSignal.timeout(4500),
      next: { revalidate: 60 * 60 * 24 * 30 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const document = data.docs?.find((item: { cover_i?: number }) => item.cover_i) || data.docs?.[0];
    if (document?.cover_i) return `https://covers.openlibrary.org/b/id/${document.cover_i}-L.jpg`;
    if (document?.isbn?.[0]) return getOpenLibraryCoverUrl(document.isbn[0]);
    return null;
  } catch {
    return null;
  }
}
