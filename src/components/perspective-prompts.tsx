"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
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
    <ul className="grid gap-3">
      {prompts.map((prompt) => (
        <li key={prompt.id}>
          <Link
            href={`/book/${bookId}/create-discussion?prompt=${encodeURIComponent(prompt.id)}`}
            className="group flex items-start gap-3 rounded-[20px] bg-black/[0.025] p-4 transition hover:bg-black/[0.05]"
          >
            <PenLine size={17} className="mt-0.5 shrink-0 text-[color:var(--color-text-muted)]" />
            <span className="min-w-0">
              <span className="caption block text-[10px]">{ANGLE_LABELS[prompt.angle]}</span>
              <span className="mt-1 block text-[15px] font-medium text-[color:var(--color-text-primary)]">{prompt.title}</span>
              <span className="mt-1 block text-sm text-[color:var(--color-text-secondary)]">{prompt.hint}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  if (!frame) return list;
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
      <h3 className="title-3">{frame.title}</h3>
      <p className="body-copy mt-2 max-w-lg text-[15px] leading-6">{frame.body}</p>
      <div className="mt-6">{list}</div>
    </div>
  );
}
