import { WORK_LINKS } from "./site";

/** Case-study pages (/work/<slug>/). Single source of truth is WORK_LINKS in lib/site.ts. */
export type Project = (typeof WORK_LINKS)[number];

export const PROJECTS: Project[] = WORK_LINKS;

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);

export function neighbours(slug: string) {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return {
    prev: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length],
    next: PROJECTS[(i + 1) % PROJECTS.length],
  };
}
