import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME, APP_PROMISE } from "@/lib/config";
import { AppShell } from "@/components/app-shell";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3016";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: `${APP_NAME} - Book-centered knowledge sharing`,
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
    card: "summary",
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
