import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

// `/settings` is a client component, and a client component cannot export metadata - which is
// why this route was still serving the site-wide title. A layout can, and adding one here
// cannot change how the page behaves.
export const metadata: Metadata = pageMetadata({
  title: "Settings",
  description: "Your public identity on BookSphere.",
  path: "/settings",
  noIndex: true
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
