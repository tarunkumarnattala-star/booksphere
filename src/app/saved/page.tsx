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
    <div className="editorial-page max-w-[1240px]">
      <p className="caption mb-4">Saved</p>
      <h1 className="large-title">Your personal knowledge shelf.</h1>
      <p className="body-copy mt-5 max-w-2xl">Save the explanations, applications, questions, and books you want to return to before a decision, conversation, project, or reread.</p>
      <SavedClient />
    </div>
  );
}
