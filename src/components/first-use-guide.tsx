"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const COMPLETED_KEY = "booksphere.onboarding.v2.completed";
const ACTIVE_KEY = "booksphere.onboarding.v2.active";
const START_EVENT = "booksphere:onboarding:start";

// Two steps, matching the three destinations. It used to walk Explore, Genres, Feed and
// Search - two of which are no longer places you navigate to.
type GuideStage = "welcome" | "explore" | "search" | "action";

const steps: Record<Exclude<GuideStage, "welcome" | "action">, { count: string; title: string; body: string }> = {
  explore: {
    count: "1 of 2",
    title: "Start with an open question.",
    body: "Every book carries questions nobody has answered yet. Answer one, or read what others wrote."
  },
  search: {
    count: "2 of 2",
    title: "Find any book.",
    body: "Search a book, concept, or question - or browse by genre underneath."
  }
};

function highlightFor(stage: GuideStage) {
  if (stage === "explore") return "explore";
  if (stage === "search" || stage === "action") return "search";
  return null;
}

function targetFor(stage: GuideStage) {
  const name = highlightFor(stage);
  return name ? `[data-onboarding='${name}']` : null;
}

export function FirstUseGuide() {
  const pathname = usePathname();
  const router = useRouter();
  const [stage, setStage] = useState<GuideStage | null>(null);
  const [visible, setVisible] = useState(false);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  function persistStage(next: GuideStage | null) {
    setStage(next);
    if (next) window.localStorage.setItem(ACTIVE_KEY, next);
    else window.localStorage.removeItem(ACTIVE_KEY);
  }

  // The welcome card used to raise itself on a first visit and cover the page on a phone,
  // including the open question someone had just arrived to read. The tour now runs only
  // when a reader asks for it from Settings; an unfinished tour still resumes.
  useEffect(() => {
    const restart = () => {
      window.localStorage.removeItem(COMPLETED_KEY);
      persistStage("welcome");
      setVisible(true);
      trackEvent("onboarding_replayed");
    };

    window.addEventListener(START_EVENT, restart);

    const active = window.localStorage.getItem(ACTIVE_KEY) as GuideStage | null;
    if (active && ["welcome", "explore", "search", "action"].includes(active)) {
      const timer = window.setTimeout(() => {
        setStage(active);
        setVisible(true);
      }, 0);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener(START_EVENT, restart);
      };
    }

    return () => window.removeEventListener(START_EVENT, restart);
  }, [pathname]);

  useEffect(() => {
    if (!stage || !visible) return;
    primaryButtonRef.current?.focus({ preventScroll: true });

    const selector = targetFor(stage);
    const highlight = highlightFor(stage);
    if (!selector || !highlight) return;

    let cancelled = false;
    let attempts = 0;

    const findTarget = () => {
      if (cancelled) return;
      const target = document.querySelector<HTMLElement>(selector);
      if (!target && attempts < 20) {
        attempts += 1;
        window.setTimeout(findTarget, 120);
        return;
      }
      if (!target) return;
      // Mark the highlight on <html> rather than on the target itself. The target can live in a
      // route segment that hydrates after this effect runs, and writing an attribute onto a
      // React-owned node before its subtree hydrates produces a hydration mismatch.
      document.documentElement.dataset.onboardingActive = highlight;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    findTarget();
    return () => {
      cancelled = true;
      delete document.documentElement.dataset.onboardingActive;
    };
  }, [pathname, stage, visible]);

  useEffect(() => {
    if (!stage || !visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skipGuide();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function beginGuide() {
    trackEvent("onboarding_started");
    persistStage("explore");
    router.push("/explore?guide=explore");
  }

  function nextStep() {
    if (stage === "explore") {
      persistStage("search");
      router.push("/search?guide=search");
      return;
    }
    if (stage === "search") {
      window.localStorage.setItem(COMPLETED_KEY, "true");
      trackEvent("onboarding_completed");
      persistStage("action");
      router.push("/search?guide=complete");
    }
  }

  function skipGuide() {
    window.localStorage.setItem(COMPLETED_KEY, "true");
    trackEvent("onboarding_skipped", { stage });
    persistStage(null);
    setVisible(false);
  }

  function startSearching() {
    const input = document.querySelector<HTMLInputElement>("[data-onboarding-search-input]");
    trackEvent("onboarding_first_action", { action: "search" });
    persistStage(null);
    setVisible(false);
    input?.focus({ preventScroll: false });
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (!stage || !visible) return null;

  const isWelcome = stage === "welcome";
  const isAction = stage === "action";
  const step = !isWelcome && !isAction ? steps[stage] : null;

  return (
    // A note slipped onto the page, not a modal: a paper panel with one ink rule at the top,
    // sitting above the bottom bar on a phone and in the corner on a desktop.
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="first-use-guide-title"
      className="onboarding-panel fixed inset-x-5 bottom-[calc(76px+env(safe-area-inset-bottom)+20px)] z-[120] mx-auto w-auto max-w-sm border border-[color:var(--rule)] border-t-2 border-t-[color:var(--ink)] bg-[color:var(--paper)] p-5 md:inset-x-auto md:bottom-8 md:right-8 md:w-[360px]"
    >
      <button
        type="button"
        onClick={skipGuide}
        aria-label="Close the guide"
        className="control absolute right-4 top-4"
      >
        Close
      </button>

      {isWelcome && (
        <>
          <p className="caption pr-20">The guide</p>
          <h2 id="first-use-guide-title" className="title-2 mt-4">Understand books through people.</h2>
          <p className="body-copy mt-3">Find the useful idea, see how readers tested it, then add what you learned.</p>
          <div className="control-row mt-5">
            <button ref={primaryButtonRef} type="button" onClick={beginGuide} className="btn-ink btn-sm">Take the tour</button>
            <button type="button" onClick={skipGuide} className="control">Not now</button>
          </div>
        </>
      )}

      {step && (
        <>
          <p className="caption numeral pr-20">{step.count}</p>
          <h2 id="first-use-guide-title" className="title-2 mt-4">{step.title}</h2>
          <p className="body-copy mt-3">{step.body}</p>
          <div className="control-row mt-5 justify-between">
            <button type="button" onClick={skipGuide} className="control">Skip</button>
            <button ref={primaryButtonRef} type="button" onClick={nextStep} className="btn-ink btn-sm">{stage === "search" ? "Finish" : "Next"}</button>
          </div>
        </>
      )}

      {isAction && (
        <>
          <p className="caption pr-20">Your first move</p>
          <h2 id="first-use-guide-title" className="title-2 mt-4">Search something you want to understand.</h2>
          <p className="body-copy mt-3">A book, a decision, a question or a goal all work.</p>
          <div className="control-row mt-5">
            <button ref={primaryButtonRef} type="button" onClick={startSearching} className="btn-ink btn-sm">Start searching</button>
            <button type="button" onClick={skipGuide} className="control">Later</button>
          </div>
        </>
      )}
    </aside>
  );
}

export const FIRST_USE_GUIDE_START_EVENT = START_EVENT;
