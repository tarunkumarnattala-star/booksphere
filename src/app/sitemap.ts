import type { MetadataRoute } from "next";
import { genres, readingPaths, stockedBooks } from "@/lib/data";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://booksphere-iota.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/explore", "/genres", "/feed", "/search", "/privacy", "/terms"].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  // Genres and reading paths were already the gated lists; books was not, so this invited
  // Google to crawl 394 pages when 26 have anything on them. Thin pages dilute the good ones,
  // and worse, someone arriving from a search result lands on an empty page - the one door
  // into the empty-room problem still open after it was closed everywhere inside the product.
  const bookRoutes: MetadataRoute.Sitemap = stockedBooks.map((book) => ({
    url: `${baseUrl}/book/${book.id}`,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  const genreRoutes: MetadataRoute.Sitemap = genres.map((genre) => ({
    url: `${baseUrl}/genre/${genre.slug}`,
    changeFrequency: "weekly",
    priority: 0.5
  }));

  const pathRoutes: MetadataRoute.Sitemap = readingPaths.map((path) => ({
    url: `${baseUrl}/path/${path.slug}`,
    changeFrequency: "monthly",
    priority: 0.5
  }));

  return [...staticRoutes, ...bookRoutes, ...genreRoutes, ...pathRoutes];
}
