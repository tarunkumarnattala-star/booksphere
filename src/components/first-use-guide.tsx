"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const COMPLETED_KEY = "booksphere.onboarding.v2.completed";
const ACTIVE_KEY = "booksphere.onboarding.v2.active";
const START_EVENT = "booksphere:onboarding:start";

type GuideStage = "welcome" | "explore" | "genres" | "feed" | "search" | "action";

function isGuideEligiblePath(pathname: string) {
  return pathname === "/"
    || pathname.startsWith("/explore")
    || pathname.startsWith("/genres")
    || pathname.startsWith("/genre/")
    || pathname.startsWith("/feed")
    || pathname.startsWith("/search");
}

const steps: Record<Exclude<GuideStage, "welcome" | "action">, { count: string; title: string; body: string }> = {
  explore: {
    count: "1 of 4",
    title: "Explore what readers found useful.",
    body: "Start with practical ideas, perspectives, and discussions worth opening."
  },
  genres: {
    count: "2 of 4",
    title: "Browse focused reading rooms.",
    body: "Choose a topic to find its strongest books and reader insights."
  },
  feed: {
    count: "3 of 4",
    title: "Add your perspective.",
    body: "Share something you learned, tried, noticed, or questioned. A book is optional."
  },
  search: {
    count: "4 of 4",
    title: "Search by what you need.",
    body: "Use a book title, question, decision, or goal."
  }
};

function targetFor(stage: GuideStage) {
  if (stage === "explore") return "[data-onboarding='explore']";
  if (stage === "genres") return "[data-onboarding='genres']";
  if (stage === "feed") return "[data-onboarding='feed-composer']";
  if (stage === "search" || stage === "action") return "[data-onboarding='search']";
  return null;
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

  useEffect(() => {
    const restart = () => {
      window.localStorage.removeItem(COMPLETED_KEY);
      persistStage("welcome");
      setVisible(true);
      trackEvent("onboarding_replayed");
    };

    window.addEventListener(START_EVENT, restart);

    const active = window.localStorage.getItem(ACTIVE_KEY) as GuideStage | null;
    if (active && ["welcome", "explore", "genres", "feed", "search", "action"].includes(active)) {
      const timer = window.setTimeout(() => {
        setStage(active);
        setVisible(true);
      }, 0);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener(START_EVENT, restart);
      };
    } else if (!window.localStorage.getItem(COMPLETED_KEY) && isGuideEligiblePath(pathname)) {
      const timer = window.setTimeout(() => {
        setStage("welcome");
        setVisible(true);
        trackEvent("onboarding_shown", { path: pathname });
      }, 700);
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
    if (!selector) return;

    let cancelled = false;
    let attempts = 0;
    let highlighted: HTMLElement | null = null;

    const findTarget = () => {
      if (cancelled) return;
      highlighted = document.querySelector<HTMLElement>(selector);
      if (!highlighted && attempts < 20) {
        attempts += 1;
        window.setTimeout(findTarget, 120);
        return;
      }
      if (!highlighted) return;
      highlighted.dataset.onboardingActive = "true";
      highlighted.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    findTarget();
    return () => {
      cancelled = true;
      if (highlighted) delete highlighted.dataset.onboardingActive;
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
      persistStage("genres");
      router.push("/genres?guide=genres");
      return;
    }
    if (stage === "genres") {
      persistStage("feed");
      router.push("/feed?guide=feed");
      return;
    }
    if (stage === "feed") {
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
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="first-use-guide-title"
      className="onboarding-panel fixed inset-x-4 bottom-[calc(6.4rem+env(safe-area-inset-bottom))] z-[120] mx-auto w-auto max-w-sm rounded-[22px] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.07] md:inset-x-auto md:bottom-6 md:right-6 md:w-[360px]"
    >
      <button
        type="button"
        onClick={skipGuide}
        aria-label="Close app guide"
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-[color:var(--color-text-muted)] transition hover:bg-black/[0.04] hover:text-[color:var(--color-text-primary)]"
      >
        <X size={17} />
      </button>

      {isWelcome && (
        <>
          <p className="caption pr-10">Welcome to BookSphere</p>
          <h2 id="first-use-guide-title" className="mt-3 text-[24px] font-medium leading-[1.08]">Understand books through people.</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">Find the useful idea, see how readers tested it, then add what you learned.</p>
          <div className="mt-5 flex items-center gap-3">
            <button ref={primaryButtonRef} type="button" onClick={beginGuide} className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-5 text-sm font-medium !text-white transition hover:opacity-85">Take a quick tour</button>
            <button type="button" onClick={skipGuide} className="min-h-11 px-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">Not now</button>
          </div>
        </>
      )}

      {step && (
        <>
          <p className="caption pr-10">{step.count}</p>
          <h2 id="first-use-guide-title" className="mt-3 text-xl font-medium leading-tight">{step.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{step.body}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={skipGuide} className="min-h-11 px-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">Skip</button>
            <button ref={primaryButtonRef} type="button" onClick={nextStep} className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-5 text-sm font-medium !text-white transition hover:opacity-85">{stage === "search" ? "Finish" : "Next"}</button>
          </div>
        </>
      )}

      {isAction && (
        <>
          <span className="grid size-9 place-items-center rounded-full bg-[#f7f2e8] text-[color:var(--color-accent)]"><Check size={18} /></span>
          <p className="caption mt-4">Your first move</p>
          <h2 id="first-use-guide-title" className="mt-2 text-xl font-medium leading-tight">Search something you want to understand.</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">A book, decision, question, or goal all work.</p>
          <div className="mt-5 flex items-center gap-3">
            <button ref={primaryButtonRef} type="button" onClick={startSearching} className="min-h-11 rounded-full bg-[color:var(--color-text-primary)] px-5 text-sm font-medium !text-white transition hover:opacity-85">Start searching</button>
            <button type="button" onClick={skipGuide} className="min-h-11 px-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]">Later</button>
          </div>
        </>
      )}
    </aside>
  );
}

export const FIRST_USE_GUIDE_START_EVENT = START_EVENT;
