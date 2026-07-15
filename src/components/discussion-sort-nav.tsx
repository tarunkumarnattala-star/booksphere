import Link from "next/link";
import { DiscussionSort } from "@/lib/types";
import { discussionSortOptions } from "@/lib/data";
import { cn } from "@/lib/utils";

export function DiscussionSortNav({ activeSort, baseHref }: { activeSort: DiscussionSort; baseHref: string }) {
  return (
    <div className="shelf-scroll flex gap-2 overflow-x-auto pb-2">
      {discussionSortOptions.map((option) => (
        <Link
          key={option.value}
          href={`${baseHref}?sort=${option.value}#discussions`}
          replace
          aria-current={activeSort === option.value ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition duration-200",
            activeSort === option.value
              ? "bg-[color:var(--color-text-primary)] !text-white"
              : "bg-white text-[color:var(--color-text-secondary)] shadow-[0_6px_18px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.035] hover:text-[color:var(--color-text-primary)]"
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
