export const NAME = "Tyler Lange";
export const SITE_URL = "https://tylerlange.ca";
export const SITE_TAGLINE = "Product Designer & UX Designer in Vancouver";
export const SITE_DESCRIPTION =
  "Tyler Lange is a freelance product designer and UX designer in Vancouver, BC with 18+ years of experience in product design, UX strategy, design systems and AI workflow UX. Available for freelance projects.";
export const KEYWORDS = [
  "freelance product designer",
  "freelance UX designer",
  "product designer Vancouver",
  "UX designer Vancouver",
  "UX engineer",
  "UX design consultant",
  "design systems",
  "AI product design",
  "AI workflow UX",
  "AI UX designer",
  "SaaS product design",
  "Tyler Lange",
];
export const EMAIL = "tylerlangebc@gmail.com";
export const PHONE_TEL = "tel:+16047878130";
export const LINKEDIN_URL = "https://www.linkedin.com/in/tylerlange/";

/** false = "/" shows the coming soon page. true = "/" shows the full home page. */
export const LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED === "true";

/** Formspree form ID (see .env.example). Empty = form falls back to mailto. */
// TODO: create a Formspree form and set NEXT_PUBLIC_FORMSPREE_ID, otherwise the contact form uses mailto.
export const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "";

// TODO: set NEXT_PUBLIC_BOOKING_URL to a real scheduler (Cal.com / Calendly); falls back to email.
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || `mailto:${EMAIL}?subject=Let%27s%20chat`;

// TODO: TOOLS (about page/footer) overlaps lib/toolbox.ts; consolidate into one list.
export const TOOLS = ["Figma", "Framer", "Claude", "Cursor", "React", "TypeScript", "CSS"];

export const SERVICES = [
  { name: "Strategy", blurb: "Finding the right problem before drawing the first screen." },
  { name: "Product design", blurb: "From the first sketch to the last pixel, end to end." },
  { name: "Design systems", blurb: "Shared language and components that help teams move faster." },
];

// TODO: replace About headline/pillar copy (still adapted from the reference site) with Tyler's own words.
/** About copy: placeholder from the reference site (tyl.framer.website). Experience below is from LinkedIn. */
export const ABOUT_HEADLINE =
  "I’m a UX Design Engineer. I design products and build them myself — minor handoff, nothing lost in between.";

export const ABOUT_PILLARS = [
  { name: "Design", blurb: "Flows, systems and pixel-tight interfaces." },
  { name: "Engineer", blurb: "Production front-ends with motion and care." },
  { name: "Ship", blurb: "Launched, measured and kept improving." },
];

export const EXPERIENCE_HEADLINE = "18 years of shipping things";

export const EXPERIENCE = [
  { company: "micro1", role: "AI Product Designer & UX Designer", years: "2026 — Now", now: true },
  { company: "PDF Solutions", role: "Senior Product Designer", years: "2024 — 2026", now: false },
  { company: "Neos Consulting", role: "Senior UX Designer", years: "2023 — 2024", now: false },
  { company: "Ajna Labs", role: "Senior Product Designer", years: "2022 — 2023", now: false },
  { company: "TerraZero", role: "Founding Product Designer", years: "2021 — 2022", now: false },
  { company: "OSI Maritime Systems", role: "Senior UX Designer", years: "2020 — 2021", now: false },
  { company: "Fobi AI", role: "Senior UX / UI Designer", years: "2019", now: false },
  { company: "Finning CAT", role: "Lead UX Designer", years: "2017 — 2019", now: false },
  { company: "GE Digital", role: "Senior UX Design Engineer", years: "2016 — 2017", now: false },
  { company: "EA Sports", role: "User Experience Engineer", years: "2013 — 2015", now: false },
];

export const CTA_STATUS = "Booking new projects — Nov ’26";

// TODO: add case-study pages (8 project sub-pages per project brief) and point `url` at them.
/** Selected work: a simple list of links for now. Replace these placeholders with real URLs. */
export const WORK_LINKS: { title: string; subtitle?: string; url: string }[] = [
  { title: "Aurora", subtitle: "AI microchip analytics", url: "https://pdf.com" },
  { title: "Cimetrix", subtitle: "Industrial equipment software", url: "https://www.cimetrix.com/" },
  { title: "secureWISE", subtitle: "Remote Equipment Monitoring", url: "https://www.pdf.com/products/securewise/" },
  { title: "Tilt Rips", subtitle: "Rip Pokémon & Sports Card Packs", url: "https://tiltrips.com" },
  { title: "Fobi AI", subtitle: "Infrastructure for the AI Era", url: "https://www.fobi.ai/" },
  { title: "AgExpert", subtitle: "Formerly Bio Smart Agriculture", url: "https://agexpert.ca/en" },
  { title: "micro1 AI", subtitle: "AI Product Design", url: "https://www.micro1.ai/experts/opportunities" },
  { title: "TerraZero", subtitle: "Bringing Brands into the Intraverse", url: "https://terrazero.com" },
  { title: "Finning", subtitle: "24/7 Customer Platform", url: "https://www.finning.com/en_GB/performance/finning-customer-portal.html" },
];
