import Link from "next/link";
import { slugify } from "@/lib/utils";

export function GenrePill({ name }: { name: string }) {
  return (
    <Link
      href={`/genre/${slugify(name)}`}
      className="inline-flex min-h-11 items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)] shadow-[0_6px_18px_rgba(0,0,0,0.045)] ring-1 ring-black/[0.04] transition hover:text-[color:var(--color-text-primary)]"
    >
      {name}
    </Link>
  );
}
