import type { Metadata } from "next";
import { APP_NAME, APP_PROMISE } from "@/lib/config";

// Why this exists.
//
// The root layout sets openGraph.title, openGraph.description and openGraph.url to fixed
// strings. Next inherits a parent's openGraph object wholesale into every child that does
// not define its own, and a page-level `title` does NOT flow into openGraph.title. So the
// per-page titles that landed on August 6 fixed the browser tab and did nothing at all for
// the link card: every book, every perspective, every profile and every reading path was
// shared as "BookSphere - Understand books through people", described with the site
// tagline, and - worst of the three - carrying og:url pointing at the site root. Scrapers
// that treat og:url as the canonical identity of the object collapse all of them onto the
// homepage, which defeats the entire reason discussion permalinks were built.
//
// Every page that wants its own identity calls this. It keeps `title` short so the layout's
// "%s - BookSphere" template still applies to the tab, and computes the same string in full
// for the social card, where no template runs.

const SITE_SOCIAL_TITLE = `${APP_NAME} - Understand books through people`;

type PageMetadataInput = {
  /** Short title. The root layout appends " - BookSphere" for the browser tab. */
  title?: string;
  /** Use verbatim, no template. For the landing page, which already names the product. */
  absoluteTitle?: string;
  description?: string;
  /** Route path, e.g. "/explore". Resolved against metadataBase for canonical and og:url. */
  path?: string;
  /** Account and moderation surfaces that should never be indexed. */
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  noIndex
}: PageMetadataInput): Metadata {
  const resolvedDescription = description || APP_PROMISE;
  const socialTitle = absoluteTitle || (title ? `${title} - ${APP_NAME}` : SITE_SOCIAL_TITLE);
  const url = path || "/";

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title: socialTitle,
      description: resolvedDescription,
      url
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: resolvedDescription
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true }
  };
}
