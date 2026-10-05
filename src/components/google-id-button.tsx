"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Why this exists at all.
//
// The redirect flow (supabase.auth.signInWithOAuth) hands the reader to Google and asks it to
// return to the Supabase project's callback, so Google's screen names the address that will
// receive them: "to continue to dhsophbjhaamucatumqr.supabase.co". A stranger reads a random
// string at the moment they decide whether to trust us, and it reads as a scam. Nothing in
// Supabase or in this codebase can rename it, because Google shows the redirect host until
// the OAuth client is brand verified, and verification needs a domain we can prove we own.
//
// Google Identity Services never redirects. The reader stays on our page, Google returns a
// signed ID token to the browser, and we exchange it with Supabase. The consent screen then
// names this site, because this site is where the sign-in happens.
//
// Supabase expects the provider to have hashed the nonce, so Google gets the SHA-256 of it
// and signInWithIdToken gets the original. A fresh one per attempt.

type CredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export const googleIdFlowEnabled = GOOGLE_CLIENT_ID.length > 0;

async function makeNonce() {
  const raw = crypto.randomUUID();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

export function GoogleIdButton({
  returnPath,
  onError,
  onUnavailable
}: {
  returnPath: string;
  onError: (message: string) => void;
  onUnavailable: () => void;
}) {
  const router = useRouter();
  const holder = useRef<HTMLDivElement>(null);
  const rawNonce = useRef<string>("");
  const [ready, setReady] = useState(false);
  // The parent passes these as inline arrows, so they are new objects on every render. As
  // effect dependencies they re-ran this whole routine each time, and because renderButton
  // materialises its button asynchronously, each pass added another one: two Google buttons
  // stacked on the sign-in card. Held in refs the effect can run exactly once.
  const onErrorRef = useRef(onError);
  const onUnavailableRef = useRef(onUnavailable);
  const returnPathRef = useRef(returnPath);
  const startedRef = useRef(false);
  useEffect(() => {
    onErrorRef.current = onError;
    onUnavailableRef.current = onUnavailable;
    returnPathRef.current = returnPath;
  });

  const handleCredential = useCallback(
    async (response: CredentialResponse) => {
      if (!response.credential || !supabase) return;
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        nonce: rawNonce.current
      });
      if (error) {
        onErrorRef.current(error.message);
        return;
      }
      router.push(returnPathRef.current);
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    let cancelled = false;
    if (startedRef.current) return;
    startedRef.current = true;

    async function start() {
      const { raw, hashed } = await makeNonce();
      if (cancelled) return;
      rawNonce.current = raw;

      // The script tag is shared: a second mount must not load it twice.
      const existing = document.querySelector<HTMLScriptElement>('script[data-gsi="true"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.gsi = "true";
        document.head.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = resolve;
        });
      } else if (!window.google) {
        await new Promise((resolve) => {
          existing.addEventListener("load", resolve, { once: true });
          setTimeout(resolve, 4000);
        });
      }

      if (cancelled) return;
      // Blocked script, a network filter, a client id Google rejects: rather than leave a
      // blank space where the main way in should be, hand back to the redirect button. It
      // shows an ugly address on Google's screen but it does work.
      if (!window.google || !holder.current) {
        onUnavailableRef.current();
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        nonce: hashed,
        use_fedcm_for_prompt: true
      });
      holder.current.innerHTML = "";
      try {
      window.google.accounts.id.renderButton(holder.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "center",
        width: Math.min(Math.round(holder.current.getBoundingClientRect().width) || 320, 400)
      });
      } catch {
        onUnavailableRef.current();
        return;
      }
      setReady(true);
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [handleCredential]);

  return (
    <div className="mt-6">
      <div ref={holder} className="flex min-h-12 w-full justify-center [color-scheme:light]" />
      {/* If the script is blocked - a network filter, an offline tab - the reader is left with
          a blank space where the main way in should be, so say email still works. */}
      {!ready && <p className="text-center text-[12.5px] text-[color:var(--color-text-muted)]">Loading Google sign-in&hellip;</p>}
    </div>
  );
}
