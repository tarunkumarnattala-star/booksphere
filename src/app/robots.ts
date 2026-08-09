import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://booksphere-iota.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Account and moderation surfaces have no business in a search index.
        disallow: ["/admin/", "/login", "/settings", "/saved", "/notifications", "/create", "/api/"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
