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
      {/* Two fixes live in this wrapper.
          main and the footer were each reserving clearance for the fixed tab bar, so every
          page ended with 162px of dead space, a hairline, then another 96px - to clear a bar
          68px tall. The footer is what sits above the bar, so it keeps the clearance alone.
          And main was min-h-dvh, which on a short page (log in, an empty shelf, a 404) left
          a void under the content and pushed the footer below the fold: a half-empty screen
          that still had to be scrolled to reach anything. The column is the full height now
          and main grows inside it, so the footer lands on the bottom of the screen and a
          short page reads as finished instead of cut off. */}
      <div className="flex min-h-dvh flex-col">
        <TopNav />
        <main id="main-content" className="page-enter flex-1 pb-0 lg:pb-12">{children}</main>
        {/* 4.5rem is the 68px tab bar plus 4px, measured rather than guessed - the old 6rem
            left 28px of visible nothing under the links on every page. */}
        <footer className="border-t border-black/[0.06] bg-black/[0.018] pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:mt-12 lg:pb-0">
        <div className="container-page flex flex-col gap-2.5 py-4 text-sm text-[color:var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {/* The old line ran 54 characters and broke after "human", leaving a ragged hole
              beside the second line on a phone. Short enough to hold one line at 375px. */}
          <p>Books, read through the people who read them.</p>
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
      </div>
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
      <FirstUseGuide />
    </>
  );
}
