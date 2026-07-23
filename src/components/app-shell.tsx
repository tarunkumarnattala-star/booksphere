import { Suspense, type ReactNode } from "react";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { TopNav } from "./top-nav";
import Link from "next/link";
import { FirstUseGuide } from "./first-use-guide";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="page-enter min-h-dvh pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-12">{children}</main>
      <footer className="border-t border-black/[0.06] pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-[color:var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>BookSphere turns books into useful, human perspectives.</p>
          <nav aria-label="BookSphere information" className="flex items-center gap-5">
            <Link href="/explore#about-booksphere" className="transition hover:text-[color:var(--color-text-primary)]">About</Link>
            <Link href="/privacy" className="transition hover:text-[color:var(--color-text-primary)]">Privacy</Link>
            <Link href="/terms" className="transition hover:text-[color:var(--color-text-primary)]">Terms</Link>
          </nav>
        </div>
      </footer>
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
      <FirstUseGuide />
    </>
  );
}
