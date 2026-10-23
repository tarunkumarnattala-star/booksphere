import * as Sentry from "@sentry/nextjs";

// Nothing was watching. If the site broke for a real reader, the founder would find out when
// somebody told him - and there is nobody testing it, so in practice that means not at all.
//
// Everything here is off unless NEXT_PUBLIC_SENTRY_DSN is set, which is the same pattern the
// Google client id uses: the wiring ships inert, and deleting one variable turns it back off
// without a code change.
//
// Deliberately lean. No session replay and no performance tracing: both are large additions to
// a client bundle on a product whose whole proposition is reading, and both consume a free
// plan's quota quickly. Errors are the thing that was missing.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
    // A reader's typing is their own - the composer holds unpublished writing - so keystroke
    // breadcrumbs are dropped before anything leaves the browser.
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === "ui.input") return null;
      return breadcrumb;
    },
    ignoreErrors: [
      // Browser extensions and bot frames, not our code.
      "ResizeObserver loop",
      "Non-Error promise rejection captured",
      /^Script error\.?$/
    ]
  });
}
