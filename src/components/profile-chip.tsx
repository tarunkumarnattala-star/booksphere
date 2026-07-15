import Link from "next/link";
import { Profile } from "@/lib/types";
import { initials } from "@/lib/utils";

export function ProfileChip({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  return (
    <Link href={`/profile/${profile.username}`} className="flex items-center gap-3">
      <span className={`${compact ? "size-8 text-xs" : "size-10 text-sm"} grid place-items-center rounded-full bg-[color:var(--color-text-primary)] font-medium !text-white`}>
        {initials(profile.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[color:var(--color-text-primary)]">{profile.name}</span>
        <span className="block truncate text-xs font-medium text-[color:var(--color-text-secondary)]">{profile.badges[0]}</span>
      </span>
    </Link>
  );
}
