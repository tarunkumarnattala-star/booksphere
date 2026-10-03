"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAnsweredStarterPrompts } from "@/lib/answered-prompts";
import { ANGLE_LABELS, type PerspectivePrompt } from "@/lib/perspective-prompts";
import { selectPrompts } from "@/lib/prompt-selection";

// Four ways into a book - what changed, what clicked, what puzzles you, where you would push
// back - so a reader starts from a question instead of a blank page.
//
// The book page is built statically, so its own list of perspectives can be a deploy old.
// The first render uses those titles; the browser then asks for what has been answered since,
// and an answered prompt hands its place to the next open one in the same angle.
export function PerspectivePrompts({
  bookId,
  pool,
  answeredTitles,
  frame
}: {
  bookId: string;
  pool: PerspectivePrompt[];
  answeredTitles: string[];
  frame?: { title: string; body: string };
}) {
  const [answered, setAnswered] = useState<{ ids: string[]; titles: string[] }>({ ids: [], titles: answeredTitles });

  useEffect(() => {
    let active = true;
    getAnsweredStarterPrompts(bookId).then((result) => {
      if (active) setAnswered({ ids: result.ids, titles: [...answeredTitles, ...result.titles] });
    });
    return () => {
      active = false;
    };
  }, [bookId, answeredTitles]);

  const prompts = selectPrompts(pool, answered);
  if (!prompts.length) return null;

  const list = (
    <ol className="records records-tight">
      {prompts.map((prompt) => (
        <li key={prompt.id} className="record">
          <p className="caption record-stamp">{ANGLE_LABELS[prompt.angle]}</p>
          <div className="min-w-0">
            <Link
              href={`/book/${bookId}/create-discussion?prompt=${encodeURIComponent(prompt.id)}`}
              className="headline block transition-colors hover:text-[color:var(--accent)]"
            >
              {prompt.title}
            </Link>
            <p className="footnote mt-2">{prompt.hint}</p>
          </div>
        </li>
      ))}
    </ol>
  );

  if (!frame) return list;
  return (
    <div>
      <h3 className="caption caption-muted">{frame.title}</h3>
      <p className="body-copy measure mt-4">{frame.body}</p>
      {list}
    </div>
  );
}
