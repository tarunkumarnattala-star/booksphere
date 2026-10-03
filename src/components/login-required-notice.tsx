"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LoginRequiredNotice({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div role="status" className="mt-5 border-l-2 border-[color:var(--ink)] pl-5">
      <p className="body-copy measure text-[color:var(--ink)]">{message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href={loginHref} className="btn-ink btn-sm">
          Sign in
        </Link>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="caption caption-muted min-h-11 transition-colors hover:text-[color:var(--ink)]">
            Not now
          </button>
        )}
      </div>
    </div>
  );
}
