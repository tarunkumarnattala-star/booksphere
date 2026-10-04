"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
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

// Google's own mark, so the primary button is recognisable at a glance rather than being a
// dark pill with the word Google on it.
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37.1 40.2 44 35 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}


// Supabase's own error strings went straight to the screen. Sign-in mail is rate limited per
// hour, so the first burst of arrivals from one link is exactly when it trips - and the
// person who gets turned away reads "Email rate limit exceeded", which sounds like they did
// something wrong and tells them nothing to do next. Everything else still shows the real
// error; only the cases a reader can act on are rewritten.
function signInErrorMessage(error: { message?: string; status?: number }): string {
  const raw = (error.message || "").toLowerCase();
  const rateLimited = error.status === 429
    || raw.includes("rate limit")
    || raw.includes("too many")
    || raw.includes("only request this after");
  if (rateLimited) {
    const wait = raw.match(/after (\d+) seconds?/)?.[1];
    const when = wait ? `in about ${wait} seconds` : "in a minute";
    return googleAuthEnabled
      ? `Sign-in emails are backed up right now. Try again ${when}, or use Continue with Google above - that works straight away.`
      : `Sign-in emails are backed up right now. Try again ${when} and it will go through. Nothing you did caused this.`;
  }
  if (raw.includes("invalid") && raw.includes("email")) {
    return "That email address does not look right. Check it and try again.";
  }
  return error.message || "That did not go through. Try again in a moment.";
}

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
  // Both paths stay on the screen either way; this only decides which one is the filled
  // button and which sentence the card opens with.
  const googlePrimary = googleAuthEnabled && !inApp;
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
    setMessage(error ? signInErrorMessage(error) : "Check your email for your sign-in link. It works whether or not you have been here before.");
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
      {/* The landing CTA reads "Join the Private Beta" and lands here. This greeted every
          arrival with "Welcome Back" and offered only a log in, so the one screen between a
          stranger and an account told them they were in the wrong place - while the thing
          that actually matters went unsaid: with magic links, entering an email is how you
          join. */}
      <p className="caption">New here or returning</p>
      {/* Google leads because it is one tap, needs no password, and sends no mail - sign-in
          mail is rate limited per hour, which is exactly what a burst of arrivals from one
          shared link runs into. Inside an app's own browser Google cannot finish at all, so
          there the working path is email and the emphasis swaps rather than pointing people
          at a button that will fail. */}
      <h2 className="title-2 mt-2">
        {googlePrimary ? "One tap with Google, or use your email." : "Enter your email to join or log in."}
      </h2>
      <p className="body-copy mt-2 text-[15px] leading-6">
        {googlePrimary
          ? "No password either way. Google signs you in straight away; email sends you a link instead."
          : "No password needed. If this is your first time, your email creates your account."}
      </p>
      {googleAuthEnabled && inApp && (
        <div className="mt-6 rounded-[16px] bg-black/[0.045] p-4">
          <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">Open this in your browser first</p>
          <p className="body-copy mt-1 text-[14px] leading-6">
            Google will not complete sign-in inside an app&apos;s built-in browser. Tap the menu in the
            corner of this window and choose &ldquo;Open in browser&rdquo;, or copy the link and paste
            it into Safari or Chrome.
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold"
          >
            {copied ? "Link copied" : "Copy the link"}
          </button>
        </div>
      )}
      {googleAuthEnabled && (
        <>
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className={`mt-6 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full px-4 py-3 text-sm font-semibold transition ${
              googlePrimary
                ? "bg-[color:var(--color-text-primary)] !text-white hover:opacity-85"
                : "border border-black/10 bg-white text-[color:var(--color-text-primary)] hover:bg-black/[0.035]"
            }`}
          >
            <GoogleMark />
            Continue with Google
          </button>
          {/* Google's own screen says "to continue to dhsophbjhaamucatumqr.supabase.co",
              because it names the address that handles the sign-in and ours is still the
              Supabase project's. A stranger reads a random string at the exact moment they
              decide whether to trust us. Naming it here first makes it recognisable instead
              of alarming. Delete this line once the consent screen says BookSphere. */}
          <p className="mt-2.5 text-center text-[12.5px] leading-5 text-[color:var(--color-text-muted)]">
            Google&rsquo;s next screen will say <span className="font-medium">supabase.co</span> &mdash; that is the
            service that runs our sign-in, not another site.
          </p>
          <div className="my-5 flex items-center gap-3 text-xs font-medium text-[color:var(--color-text-muted)]">
            <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
            or use email
            <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
          </div>
        </>
      )}
      <form onSubmit={signInWithEmail} className={`grid gap-3 ${googleAuthEnabled ? "" : "mt-6"}`}>
        <label htmlFor="login-email" className="text-sm font-medium text-[color:var(--color-text-primary)]">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-h-12 w-full rounded-[16px] bg-black/[0.035] px-4 text-base font-medium outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/20"
        />
        <button disabled={loading} className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:opacity-60 ${
          googlePrimary
            ? "border border-black/10 bg-white text-[color:var(--color-text-primary)] hover:bg-black/[0.035]"
            : "bg-[color:var(--color-text-primary)] !text-white hover:opacity-85"
        }`}>
          <Mail size={17} />
          {loading ? "Sending link..." : "Email me a sign-in link"}
        </button>
      </form>
      <p className="subheadline mt-4" role="status" aria-live="polite">
        {message || (isSupabaseConfigured ? "We will email you a secure link. New readers get an account; returning readers get signed in." : canUseLocalCommunityFallback() ? "Beta preview mode: email creates a local test account on this device." : COMMUNITY_UNAVAILABLE_MESSAGE)}
      </p>
    </div>
  );
}
