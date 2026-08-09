import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

// `/notifications` is a client component, and a client component cannot export metadata - which is
// why this route was still serving the site-wide title. A layout can, and adding one here
// cannot change how the page behaves.
export const metadata: Metadata = pageMetadata({
  title: "Your activity",
  description: "Replies to what you wrote.",
  path: "/notifications",
  noIndex: true
});

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
