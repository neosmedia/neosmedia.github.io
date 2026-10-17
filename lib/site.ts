export const NAME = "Tyler Lange";
export const EMAIL = "tylerlangebc@gmail.com";
export const PHONE_TEL = "tel:+16047878130";
export const LINKEDIN_URL = "https://www.linkedin.com/in/tylerlange/";

/** false = "/" shows the coming soon page. true = "/" shows the full home page. */
export const LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED === "true";

/** Formspree form ID (see .env.example). Empty = form falls back to mailto. */
export const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "";

export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || `mailto:${EMAIL}?subject=Let%27s%20chat`;

export const TOOLS = ["Figma", "Framer", "Claude", "Cursor", "React", "TypeScript", "CSS"];

export const SERVICES = [
  { name: "Strategy", blurb: "Finding the right problem before drawing the first screen." },
  { name: "Product design", blurb: "From the first sketch to the last pixel, end to end." },
  { name: "Design systems", blurb: "Shared language and components that help teams move faster." },
];
