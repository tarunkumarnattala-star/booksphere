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
        className="caption sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-50 focus:bg-[color:var(--ink)] focus:px-5 focus:py-4 focus:!text-[color:var(--paper)]"
      >
        Skip to content
      </a>
      <TopNav />
      <main id="main-content" className="page-enter min-h-dvh pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      {/* A colophon, not a marketing footer: who made it, what state it is in, and the four
          links a reader may actually need. The sentence that used to sit here - "BookSphere
          turns books into useful, human perspectives" - is the landing page's job. */}
      <footer className="border-t border-[color:var(--rule)] pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="container-page flex flex-col gap-3 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="caption caption-muted">BookSphere &middot; Early access</p>
          <nav aria-label="BookSphere information" className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            {/* /explore#about-booksphere was an anchor that no longer exists: the explainer
                moved to the landing page when Home was rewritten. */}
            <Link href="/" className="caption caption-muted transition-colors hover:text-[color:var(--ink)]">About</Link>
            <Link href="/privacy" className="caption caption-muted transition-colors hover:text-[color:var(--ink)]">Privacy</Link>
            <Link href="/terms" className="caption caption-muted transition-colors hover:text-[color:var(--ink)]">Terms</Link>
            {/* Twenty invited testers have no way to tell the founder something is broken
                except by remembering an address that appears only on an error screen. The
                subject line is prefilled so a reply lands sorted rather than in a pile. */}
            <a
              href="mailto:booksphere.support@gmail.com?subject=BookSphere%20feedback"
              className="caption caption-muted transition-colors hover:text-[color:var(--ink)]"
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
