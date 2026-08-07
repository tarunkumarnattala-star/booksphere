import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME, APP_PROMISE } from "@/lib/config";
import { AppShell } from "@/components/app-shell";
import { PageViewTracker } from "@/components/page-view-tracker";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3016";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  // A template, not a fixed string. Every page but the landing served this one title -
  // all 394 books, every genre, privacy and terms - so search engines saw hundreds of
  // identical pages, browser history was unusable, and a link shared in a chat showed the
  // tagline instead of the book someone meant to send. Pages set their own title now and
  // this fills the gap for any that do not.
  title: {
    default: `${APP_NAME} - Book-centered knowledge sharing`,
    template: `%s - ${APP_NAME}`
  },
  description: APP_PROMISE,
  manifest: "/manifest.webmanifest",
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} - Understand books through people`,
    description: APP_PROMISE,
    url: appUrl
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Understand books through people`,
    description: APP_PROMISE
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f7"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <PageViewTracker />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
