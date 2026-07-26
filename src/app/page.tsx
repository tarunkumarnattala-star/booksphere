import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "BookSphere - Understand books through people",
  description: "Learn useful ideas from books, compare real reader perspectives, and decide what deserves your time."
};

export default function HomePage() {
  return <LandingPage />;
}
