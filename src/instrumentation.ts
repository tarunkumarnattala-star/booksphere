import * as Sentry from "@sentry/nextjs";

// Server and edge. Same rule as the client: entirely off unless the DSN is set.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0
  });
}

// Without this, an error thrown inside a server component is handled by Next and never
// reaches Sentry - which is most of this app, since the scroll, book pages and the composer
// all render on the server.
export const onRequestError = Sentry.captureRequestError;
