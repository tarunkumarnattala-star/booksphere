"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { createLocalProfile } from "@/lib/local-session";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";

// Prefix checks miss what a URL parser accepts: `/\evil.com` and `/<tab>/evil.com` both
// resolve to https://evil.com/ under WHATWG parsing. Neither is exploitable today - the two
// production sinks concatenate onto a fixed origin - but that is one refactor away from
// being an open redirect, and parsing costs nothing. Anything that leaves the sentinel
// origin, or lands back on /login, goes to /explore.
function safeReturnPath(next?: string) {
  if (!next || !next.startsWith("/")) return "/explore";
  try {
    const parsed = new URL(next, "https://booksphere.invalid");
    if (parsed.origin !== "https://booksphere.invalid") return "/explore";
    if (parsed.pathname.startsWith("/login")) return "/explore";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/explore";
  }
}

// The Google button is hidden until the provider is actually enabled in Supabase
// (Authentication -> Providers). Rendering it while the provider is off gives every
// user a dead button: Supabase returns "provider is not enabled" and sign-in fails.
// When Google is turned on, set NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true in Vercel and
// redeploy (NEXT_PUBLIC_* values are inlined at build time).

// Google refuses OAuth inside embedded browsers and answers 403 disallowed_useragent, so a
// tester who taps an invite link inside WhatsApp, Instagram or LinkedIn gets a Google error
// page instead of this product. Invites for this beta are sent by message, which makes the
// in-app browser the most likely first surface, not an edge case. Detect it and say so
// plainly rather than letting Google deliver the bad news.
function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|LinkedInApp|Line\/|MicroMessenger|Snapchat|Pinterest|Twitter|; wv\)/i.test(ua);
}

const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export function LoginForm({ next }: { next?: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof location !== "undefined" ? location.origin : "");
  const returnPath = safeReturnPath(next);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // useSyncExternalStore rather than an effect: the server has no user agent, so the server
  // snapshot is false and the client snapshot is the real answer, with no setState during an
  // effect and no hydration mismatch.
  const inApp = useSyncExternalStore(() => () => {}, isInAppBrowser, () => false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${appUrl || "https://booksphere-iota.vercel.app"}/login`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  async function signInWithGoogle() {
    if (!supabase) {
      setMessage(canUseLocalCommunityFallback() ? "Google login will work once Supabase Auth is connected. Use email below to create a local beta test account now." : COMMUNITY_UNAVAILABLE_MESSAGE);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${appUrl}${returnPath}` }
    });
    if (error) {
      setMessage("Google sign-in could not be started. Please try email instead.");
      setLoading(false);
    }
  }

  async function signInWithEmail(event: React.FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setMessage("Enter your email to continue.");
      return;
    }
    setLoading(true);
    if (!supabase) {
      if (!canUseLocalCommunityFallback()) {
        setMessage(COMMUNITY_UNAVAILABLE_MESSAGE);
        setLoading(false);
        return;
      }
      createLocalProfile(cleanEmail);
      trackEvent("local_signup", { method: "email" });
      setMessage("Local beta account created. Taking you back to BookSphere...");
      setTimeout(() => router.push(returnPath), 350);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: `${appUrl}${returnPath}` }
    });
    setLoading(false);
    setMessage(error ? error.message : "Check your email for your sign-in link. It works whether or not you have been here before.");
  }

  return (
    <div className="section-rule">
      {googleAuthEnabled && inApp && (
        <div className="mb-8 border-l-2 border-[color:var(--ink)] pl-5">
          <p className="caption">Open this in your browser first</p>
          <p className="body-copy measure mt-3">
            Google will not complete sign-in inside an app&apos;s built-in browser. Tap the menu in
            the corner of this window and choose &ldquo;Open in browser&rdquo;, or copy the link and
            paste it into Safari or Chrome.
          </p>
          <button type="button" onClick={copyLink} className="btn-quiet btn-sm mt-5">
            {copied ? "Link copied" : "Copy the link"}
          </button>
        </div>
      )}

      {googleAuthEnabled && (
        <>
          <button type="button" onClick={signInWithGoogle} disabled={loading} className="btn-ink w-full sm:w-auto">
            Continue with Google
          </button>
          <p className="caption caption-muted mt-8">Or use email</p>
        </>
      )}

      {/* With magic links, entering an email is how you join - so the page says that instead
          of greeting a first-time reader with "Welcome back". */}
      <form onSubmit={signInWithEmail} className={googleAuthEnabled ? "mt-5 grid gap-5" : "grid gap-5"}>
        <label htmlFor="login-email" className="field-label">
          <span className="caption caption-muted">Email address</span>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="field"
          />
        </label>
        <div>
          <button disabled={loading} className={googleAuthEnabled ? "btn-quiet w-full sm:w-auto" : "btn-ink w-full sm:w-auto"}>
            {loading ? "Sending the link" : "Email me a sign-in link"}
          </button>
        </div>
      </form>

      <p className="footnote measure mt-5" role="status" aria-live="polite">
        {message || (isSupabaseConfigured
          ? "No password. The link signs you in, and creates your account if this is your first time."
          : canUseLocalCommunityFallback()
            ? "Preview mode: email creates a local test account on this device."
            : COMMUNITY_UNAVAILABLE_MESSAGE)}
      </p>
    </div>
  );
}
