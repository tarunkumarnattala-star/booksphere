import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Reports go to the address inside the DSN, so the policy has to allow that exact origin.
// Derived rather than wildcarded, and derived rather than typed: a wrong or missing entry
// here does not break the site, it silently drops every error report - which is the worst
// possible failure for the thing whose entire job is telling you something broke.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryOrigin = (() => {
  if (!sentryDsn) return null;
  try {
    return new URL(sentryDsn).origin;
  } catch {
    return null;
  }
})();

const isProduction = process.env.NODE_ENV === "production";
const isHttpsDeployment = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") === true;
const contentSecurityPolicy = [
  "default-src 'self'",
  // Google Identity Services is loaded from accounts.google.com and renders its button in a
  // frame there. Without these three the script is blocked by the policy and the button
  // simply never appears - with the failure only visible in the console.
  `script-src 'self' 'unsafe-inline' https://accounts.google.com${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "img-src 'self' data: blob: https://covers.openlibrary.org https://books.google.com https://books.googleusercontent.com",
  "font-src 'self' data:",
  ["connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googleapis.com https://openlibrary.org https://accounts.google.com", sentryOrigin].filter(Boolean).join(" "),
  "frame-src https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttpsDeployment ? ["upgrade-insecure-requests"] : [])
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isHttpsDeployment ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : [])
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Only the two hosts covers.ts can actually produce. placehold.co, images.unsplash.com
    // and lh3.googleusercontent.com were allowlisted and used by nothing - no reference in
    // src/, no such cover_url in the database, every avatar_url null, Google auth disabled -
    // and each of them serves arbitrary paths, which made /_next/image an unmetered image
    // transformation endpoint for anyone on the internet. Verified on production before this
    // change: three random placehold.co URLs each returned 200 with x-vercel-cache: MISS,
    // and 15 distinct widths are accepted per source, so every unique URL an attacker
    // invents is 15 more billable transformations. A host that is not on this list is
    // refused with 400, so the allowlist works - it was the choice of hosts that did not.
    //
    // If Google sign-in is ever enabled and avatars are rendered through next/image, add
    // lh3.googleusercontent.com back deliberately, with a pathname restriction.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org"
      },
      {
        protocol: "https",
        hostname: "books.google.com"
      },
      {
        protocol: "https",
        hostname: "books.googleusercontent.com"
      }
    ]
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  }
};

// Only wrapped when a DSN exists. With no Sentry project configured the build is exactly what
// it was before, and removing the variable is a complete, code-free off switch.
//
// Source map upload is skipped unless SENTRY_AUTH_TOKEN is present. Without it the build would
// warn on every run, and a warning everybody learns to scroll past is worse than minified
// stack traces. Adding the token later is what turns readable traces on.
export default sentryDsn
  ? withSentryConfig(nextConfig, {
      silent: true,
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
      telemetry: false
    })
  : nextConfig;
