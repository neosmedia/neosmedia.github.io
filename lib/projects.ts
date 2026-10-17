export type Project = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  role: string;
  /** Placeholder cover colours until real images are added */
  bg: string;
  fg: string;
};

// Copy comes from the Figma home frame. Cover colours stand in for images:
// drop real images in /public/work/<slug>/ and swap them into ProjectCover.
export const PROJECTS: Project[] = [
  { slug: "forma", title: "Forma", tagline: "A calmer way to manage your money", category: "Fintech", year: "2026", role: "Product design", bg: "#f0dc9c", fg: "#2a2410" },
  { slug: "outpost", title: "Outpost", tagline: "Find your kind of anywhere", category: "Travel platform", year: "2026", role: "Product design", bg: "#46604e", fg: "#eef3ea" },
  { slug: "tempo", title: "Tempo", tagline: "Make room for your best work", category: "Productivity", year: "2026", role: "Product design", bg: "#cdc3ea", fg: "#201a3a" },
  { slug: "common-ground", title: "Common Ground", tagline: "Good food, closer to home", category: "Marketplace", year: "2025", role: "Product design", bg: "#b4402f", fg: "#fbece6" },
  { slug: "index", title: "Index", tagline: "A clearer picture of your business", category: "Analytics", year: "2025", role: "Product design", bg: "#0e1424", fg: "#e8edf8" },
  { slug: "still", title: "Still", tagline: "Small rituals. A little more you.", category: "Wellbeing", year: "2025", role: "Product design", bg: "#eadcc8", fg: "#3a2a1c" },
  { slug: "relay", title: "Relay", tagline: "Better care starts with connection", category: "Healthtech", year: "2024", role: "Product design", bg: "#bdd3ea", fg: "#14263b" },
  { slug: "fieldwork", title: "Fieldwork", tagline: "A living system for ambitious teams", category: "Design system", year: "2024", role: "Design systems", bg: "#e4ea3a", fg: "#1c1f05" },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);

export function neighbours(slug: string) {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return {
    prev: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length],
    next: PROJECTS[(i + 1) % PROJECTS.length],
  };
}
