import type { MetadataRoute } from "next";
import { LAUNCHED, SITE_URL } from "@/lib/site";
import { PROJECTS } from "@/lib/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const home = [{ url: `${SITE_URL}/`, lastModified: now, priority: 1 }];
  if (!LAUNCHED) return home;
  return [
    ...home,
    ...["work", "about", "contact"].map((p) => ({ url: `${SITE_URL}/${p}/`, lastModified: now, priority: 0.8 })),
    ...PROJECTS.map((p) => ({ url: `${SITE_URL}/work/${p.slug}/`, lastModified: now, priority: 0.6 })),
  ];
}
