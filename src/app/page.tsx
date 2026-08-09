import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = pageMetadata({
  absoluteTitle: "BookSphere - Understand books through people",
  description: "Learn useful ideas from books, compare real reader perspectives, and decide what deserves your time.",
  path: "/"
});

export default function HomePage() {
  return <LandingPage />;
}
