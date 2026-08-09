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
  /**
   * Route of the card image. Defaults to the site card.
   *
   * Declared explicitly rather than left to inheritance. Next attaches a file-convention
   * `opengraph-image` automatically only while a page has no `openGraph` of its own -
   * the moment this helper set one, every book page and reading path lost its card. That
   * shipped to production and was caught by reading the deployed HTML, not by the build.
   * Setting the image here means the card never depends on merge order again.
   */
  image?: string;
  imageAlt?: string;
};

const SITE_CARD = "/opengraph-image";
const SITE_CARD_ALT = "BookSphere — understand books through the people who lived their ideas";

export function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  noIndex,
  image,
  imageAlt
}: PageMetadataInput): Metadata {
  const resolvedDescription = description || APP_PROMISE;
  const socialTitle = absoluteTitle || (title ? `${title} - ${APP_NAME}` : SITE_SOCIAL_TITLE);
  const url = path || "/";
  const cardUrl = image || SITE_CARD;
  const card = {
    url: cardUrl,
    width: 1200,
    height: 630,
    alt: imageAlt || SITE_CARD_ALT
  };

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title: socialTitle,
      description: resolvedDescription,
      url,
      images: [card]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: resolvedDescription,
      images: [cardUrl]
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true }
  };
}
