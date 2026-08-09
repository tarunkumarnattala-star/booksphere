import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

// `/admin/analytics` is a client component, and a client component cannot export metadata - which is
// why this route was still serving the site-wide title. A layout can, and adding one here
// cannot change how the page behaves.
export const metadata: Metadata = pageMetadata({
  title: "Analytics",
  description: "Community totals and event volume.",
  path: "/admin/analytics",
  noIndex: true
});

export default function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
