import type { Metadata } from "next";
import { SavedClient } from "@/components/saved-client";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Saved",
  description: "The explanations, applications, questions, and books you kept.",
  path: "/saved",
  noIndex: true
});

export default function SavedPage() {
  return (
    <div className="editorial-page">
      <p className="caption">Saved</p>
      <h1 className="large-title mt-4 max-w-[16ch]">Your shelf</h1>
      <p className="body-copy measure mt-5">
        The books and perspectives you want in front of you again - before a decision, a
        conversation, or a reread.
      </p>
      <SavedClient />
    </div>
  );
}
