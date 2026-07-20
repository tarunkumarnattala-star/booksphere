"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { createLocalProfile } from "@/lib/local-session";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";

function safeReturnPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return "/explore";
  return next;
}

export function LoginForm({ next }: { next?: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof location !== "undefined" ? location.origin : "");
  const returnPath = safeReturnPath(next);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    setMessage(error ? error.message : "Check your email for a magic link.");
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-8">
      <p className="caption">Welcome Back</p>
      <h2 className="title-2 mt-2">Log in to write, follow, and save books.</h2>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-text-primary)] px-4 py-3 text-sm font-medium !text-white transition hover:opacity-85"
      >
        Continue with Google
      </button>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-[color:var(--color-text-muted)]">
        <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
        or use email
        <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
      </div>
      <form onSubmit={signInWithEmail} className="grid gap-3">
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
        <button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-black/[0.035] disabled:opacity-60">
          <Mail size={17} />
          {loading ? "Sending link..." : "Send login link"}
        </button>
      </form>
      <p className="subheadline mt-4" role="status" aria-live="polite">
        {message || (isSupabaseConfigured ? "We will send a secure sign-in link to your email." : canUseLocalCommunityFallback() ? "Beta preview mode: email creates a local test account on this device." : COMMUNITY_UNAVAILABLE_MESSAGE)}
      </p>
    </div>
  );
}
