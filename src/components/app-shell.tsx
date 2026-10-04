"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { TopNav } from "./top-nav";
import Link from "next/link";
import { FirstUseGuide } from "./first-use-guide";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <>
      {/* Keyboard users tabbed through the whole top nav and, on long pages, a grid of book
          cards before reaching anything they came for (WCAG 2.2 Level A 2.4.1). Visible only
          when focused, so it costs sighted readers nothing. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[color:var(--color-text-primary)] focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:!text-white"
      >
        Skip to content
      </a>
      <TopNav />
      {/* Both main and the footer were reserving clearance for the fixed tab bar, so every
          page ended with 162px of empty space, a hairline, and then another 96px - about
          two thirds of a phone screen of nothing - to clear a bar 68px tall. The footer is
          what actually sits above the bar, so it keeps the clearance and main gives it up. */}
      <main id="main-content" className="page-enter min-h-dvh pb-0 lg:pb-12">{children}</main>
      <footer className="border-t border-black/[0.06] bg-black/[0.018] pb-[calc(5rem+env(safe-area-inset-bottom))] lg:mt-12 lg:pb-0">
        <div className="container-page flex flex-col gap-3 py-5 text-sm text-[color:var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>BookSphere turns books into useful, human perspectives.</p>
          <nav aria-label="BookSphere information" className="flex items-center gap-5">
            <Link href="/explore#about-booksphere" className="transition hover:text-[color:var(--color-text-primary)]">About</Link>
            <Link href="/privacy" className="transition hover:text-[color:var(--color-text-primary)]">Privacy</Link>
            <Link href="/terms" className="transition hover:text-[color:var(--color-text-primary)]">Terms</Link>
            {/* Twenty invited testers have no way to tell the founder something is broken
                except by remembering an address that appears only on an error screen. The
                subject line is prefilled so a reply lands sorted rather than in a pile. */}
            <a
              href="mailto:booksphere.support@gmail.com?subject=BookSphere%20feedback"
              className="transition hover:text-[color:var(--color-text-primary)]"
            >
              Send feedback
            </a>
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
