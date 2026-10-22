import type { Metadata } from "next";
import { NAME, SITE_URL } from "./site";

const DEFAULT_OG = { url: "/og-image.png", width: 1200, height: 630, alt: "Tyler Lange, Product Designer & UX Engineer" };

/**
 * Per-page SEO: title, description, canonical URL and Open Graph / Twitter cards.
 * Next.js replaces (not merges) the `openGraph` and `twitter` objects from the root layout,
 * so the share image has to be repeated here. `image` can be a page-specific picture (/work/...).
 */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string; // e.g. "/work/"
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const { title, description, path, image, type = "website" } = opts;
  const og = image ? { url: image, width: 1040, height: 780, alt: title } : DEFAULT_OG;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, url: path, siteName: NAME, locale: "en_CA", title: `${title} | ${NAME}`, description, images: [og] },
    twitter: { card: "summary_large_image", creator: "@tylerlangebc", site: "@tylerlangebc", title: `${title} | ${NAME}`, description, images: [{ url: og.url, alt: og.alt }] },
  };
}

/** Trim to a search-snippet length (about 155 characters) at a word boundary. */
export function snippet(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "") + "…";
}

/** JSON-LD for a page that is about Tyler (About) or lists his work (Work) or contacts him (Contact). */
export function pageJsonLd(kind: "ProfilePage" | "CollectionPage" | "ContactPage" | "AboutPage", path: string, name: string, description: string, extra: Record<string, unknown> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": kind,
    "@id": `${SITE_URL}${path}#page`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    ...(kind === "ProfilePage" ? { mainEntity: { "@id": `${SITE_URL}/#person` } } : {}),
    ...extra,
  };
}
