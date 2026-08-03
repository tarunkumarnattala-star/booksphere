import Link from "next/link";
import { slugify } from "@/lib/utils";

const pillClassName =
  "inline-flex min-h-11 items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)] shadow-[0_6px_18px_rgba(0,0,0,0.045)] ring-1 ring-black/[0.04]";

export function GenrePill({ name, interactive = true }: { name: string; interactive?: boolean }) {
  // Inside a card that is itself a link, a nested <a> is invalid HTML: React reports a
  // hydration error and the parser silently splits the outer anchor, breaking the card's
  // click target. Callers in that position pass interactive={false} for a plain label.
  if (!interactive) {
    return <span className={pillClassName}>{name}</span>;
  }

  return (
    <Link
      href={`/genre/${slugify(name)}`}
      className={`${pillClassName} transition hover:text-[color:var(--color-text-primary)]`}
    >
      {name}
    </Link>
  );
}
