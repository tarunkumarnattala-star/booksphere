import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LandingPage } from "@/components/landing-page";
import { getLandingEvidence } from "@/lib/landing-evidence";

export const metadata: Metadata = pageMetadata({
  absoluteTitle: "BookSphere - Understand books through people",
  description: "Learn useful ideas from books, compare real reader perspectives, and decide what deserves your time.",
  path: "/"
});

// The evidence on this page is read from the database, not typed into it: the count is
// counted, and the four perspectives are whatever those rows say today.
export const revalidate = 300;

export default async function HomePage() {
  const { count, perspectives } = await getLandingEvidence();
  return <LandingPage perspectiveCount={count} perspectives={perspectives} />;
}
