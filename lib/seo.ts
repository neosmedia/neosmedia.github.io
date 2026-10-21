import type { Metadata } from "next";
import { NAME } from "./site";

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
    twitter: { card: "summary_large_image", title: `${title} | ${NAME}`, description, images: [{ url: og.url, alt: og.alt }] },
  };
}
