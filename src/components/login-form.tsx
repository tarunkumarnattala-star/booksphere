"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { createLocalProfile } from "@/lib/local-session";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { canUseLocalCommunityFallback, COMMUNITY_UNAVAILABLE_MESSAGE } from "@/lib/community-runtime";

export function LoginForm() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof location !== "undefined" ? location.origin : "");
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
      options: { redirectTo: `${appUrl}/explore` }
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
      setTimeout(() => router.push("/explore"), 350);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: `${appUrl}/explore` }
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
        <KeyRound size={17} /> Continue with Google
      </button>
      <form onSubmit={signInWithEmail} className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="min-h-11 min-w-0 flex-1 rounded-full bg-black/[0.035] px-4 py-3 text-base font-medium outline-none ring-1 ring-transparent focus:ring-black/20"
        />
        <button disabled={loading} aria-label="Send magic link" className="min-h-11 rounded-full bg-black/[0.035] px-4 py-3 font-medium disabled:opacity-60"><Mail size={17} /></button>
      </form>
      <p className="subheadline mt-4" role="status" aria-live="polite">
        {message || (isSupabaseConfigured ? "We will send a secure sign-in link to your email." : canUseLocalCommunityFallback() ? "Beta preview mode: email creates a local test account on this device." : COMMUNITY_UNAVAILABLE_MESSAGE)}
      </p>
    </div>
  );
}
