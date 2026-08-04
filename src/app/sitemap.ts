import type { MetadataRoute } from "next";
import { books, genres, readingPaths } from "@/lib/data";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://booksphere-iota.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/explore", "/genres", "/feed", "/search", "/privacy", "/terms"].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  const bookRoutes: MetadataRoute.Sitemap = books.map((book) => ({
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
