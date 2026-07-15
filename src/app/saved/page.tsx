import { SavedClient } from "@/components/saved-client";

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
