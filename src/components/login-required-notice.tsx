"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LoginRequiredNotice({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div role="status" className="mt-3 rounded-[18px] bg-white p-4 text-sm shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04]">
      <p className="font-medium leading-6 text-[color:var(--color-text-secondary)]">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={loginHref} className="rounded-full bg-[color:var(--color-text-primary)] px-4 py-2 text-sm font-semibold !text-white transition hover:opacity-85">
          Log in
        </Link>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="rounded-full bg-black/[0.035] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">
            Not now
          </button>
        )}
      </div>
    </div>
  );
}
