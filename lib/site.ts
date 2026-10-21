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

/**
 * The full site is live by default. Set NEXT_PUBLIC_LAUNCHED=false to bring back the coming soon page at "/"
 * (and hide the inner pages from search engines).
 */
export const LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED !== "false";

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
export type CaseStudy = {
  role: string;
  year: string;
  headings: [string, string, string];
  paragraphs: [string, string, string];
  ai: string;
};

/** Selected work: a simple list of links for now. Replace these placeholders with real URLs. */
export const WORK_LINKS: { slug: string; title: string; subtitle?: string; url: string; /** shown instead of the URL when set */ label?: string; /** card cover shown at rest (public/work/*); hover reveals the text card */ image?: string; /** case-study copy; falls back to the CASE_STUDY_* placeholders */ study?: CaseStudy; /** images for a bento grid on the case study. 4 images: [wide, tall, short, short]. 3 images: [wide, half, half] */ gallery?: string[]; /** wide hero image for the case study (falls back to `image`) */ cover?: string; /** show the cover first and the bento below it */ galleryBelow?: boolean }[] = [
  { slug: "aurora", title: "Aurora", subtitle: "Microchip analysis, AI workflows and Design System", url: "https://pdf.com", image: "/work/aurora.webp" },
  {
    slug: "cimetrix", title: "Cimetrix", subtitle: "Industrial equipment software", url: "https://www.cimetrix.com/",
    image: "/work/cimetrix.webp",
    gallery: ["/work/cimetrix-1.webp", "/work/cimetrix-2.webp", "/work/cimetrix-3.webp", "/work/cimetrix-4.webp"],
  },
  {
    slug: "securewise", title: "secureWISE", subtitle: "Remote Equipment Monitoring", url: "https://www.pdf.com/products/securewise/",
    image: "/work/securewise.webp",
    gallery: ["/work/securewise-3.webp", "/work/securewise-1.webp", "/work/securewise-2.webp"],
    study: {
      role: "Senior Product Designer",
      year: "2024 — 2026",
      headings: ["Secure access without the friction", "One interface for every tool", "Security people can actually use"],
      paragraphs: [
        "secureWISE is PDF Solutions’ remote equipment monitoring and access platform for semiconductor fabs and the toolmakers who support them. It gives secure, end-to-end connectivity to equipment over private networks, so operators can see uptime and utilization and engineers can fix problems without a flight. The design challenge is a classic one: protect valuable intellectual property while still making access fast.",
        "Fab administrators work from a single pane of glass: one interface to control and audit who can reach which piece of equipment, with dashboards that give a 360-degree view of the installed base. Remote experts get permissioned access to the tools they need through one place, and a multilanguage chat helps in noisy fabs without phones, where an operator can paste the exact command needed to troubleshoot.",
        "Security only works if people use it, so the experience leans on familiar patterns: single sign-on across sites, multifactor authentication, a business management portal showing which services are being accessed, and a scheduler that moves files on a set schedule instead of asking for manual downloads. The result is a neutral ground where OEMs and fabs collaborate without either opening up their own systems.",
      ],
      // TODO: Tyler to confirm/edit these design details and the AI note.
      ai: "The platform’s scheduled data transfers feed analytics and AI, so a lot of the UX thinking was about making sure the right data reaches those models safely and visibly. In my own process, AI helped me summarise dense technical documentation and tighten interface copy, while the design decisions were made by hand.",
    },
  },
    {
    slug: "tilt-rips", title: "Tilt Rips", subtitle: "Rip Pokémon & Sports Card Packs", url: "https://tiltrips.com", image: "/work/tilt-rips.webp",
    study: {
      role: "Product design, UX",
      year: "TBD", // TODO: confirm year
      headings: ["Packs worth opening", "Trust you can see", "Four clear choices after every pull"],
      paragraphs: [
        "Tilt Rips is a digital pack-opening platform for collectibles. Every pack holds real, physical Pokémon, One Piece and sports cards, vaulted with professional security partners, so a pull on screen is a card you actually own. The design had to keep the thrill of a live rip while making a new kind of product easy to understand.",
        "People arrive asking one question: is this legit? The interface answers it everywhere. Live market value and price history sit on every card, pack tiers are clearly named and priced from ten cents to three thousand dollars, and any fee is shown before you confirm. Real inventory, clear pricing and free vaulting are part of the story, not fine print.",
        "After a pull, collectors choose what happens next: sell back to Tilt Rips at 90% of market value for instant wallet credit, list the card on the marketplace, vault it for free, or redeem it and have it shipped. The flows keep those four options simple to compare in the moment, across the website and the iOS and Android apps.",
      ],
      // TODO: Tyler to confirm/edit how AI was actually used on this project.
      ai: "AI helped speed up the work around the edges: summarising how competing pack-opening and marketplace flows handle trust, drafting and tightening microcopy for pack tiers and FAQs, and generating layout variations to react to. The product decisions and the final design were made by hand.",
    },
  },
  {
    slug: "fobi-ai", title: "Fobi AI", subtitle: "Infrastructure for the AI Era", url: "https://www.fobi.ai/",
    image: "/work/fobi-ai.webp",
    study: {
      role: "Senior UX / UI Designer",
      year: "2019",
      headings: ["From wallet passes to AI infrastructure", "One platform, two audiences", "Making a deep stack easy to read"],
      paragraphs: [
        "Fobi began in digital wallet passes and ticketing, turning the phone’s wallet into a marketing channel that could be measured in real time. That foundation now reaches over 150 countries and more than 100 million passes, and the company has grown it into infrastructure for the AI era: sovereign intelligence, verified identity, quantum security and trust.",
        "The product speaks to two very different audiences. Enterprises and governments want AI they can own, audit and take offline; investors want the full infrastructure thesis. The experience gives each a clear path of its own, from booking a demo to investor relations, without making either one dig for what matters.",
        "Fobi’s platform is a flywheel of connected products: Fortress for sovereign infrastructure, AltID for verified identity, Agentic Brain for intelligent interaction and FIXYR. The design challenge was making a technical stack legible, using plain language, proof points like nine years of enterprise deployment and a billion data points, and one story that ties the pieces together.",
      ],
      // TODO: Tyler to confirm/edit how AI was actually used on this project.
      ai: "AI helped with the groundwork: summarising dense technical and investor material into plain language, drafting and tightening product and flywheel copy, and exploring layout and diagram variations. Positioning, hierarchy and the final design were decided by hand.",
    },
  },
  {
    slug: "agexpert", title: "AgExpert", subtitle: "Formerly Bio Smart Agriculture", url: "https://agexpert.ca/en",
    image: "/work/agexpert.webp",
    study: {
      role: "Product Designer",
      year: "2025",
      headings: ["Putting AI in the farmer’s pocket", "Ask, look, then act", "From drone flight to diagnosis"],
      paragraphs: [
        "Farming runs on timing, and the people doing it are rarely at a desk. This mobile app brings drone technology and AI together to diagnose plants right on the farm, so growers can spot disease and stress early and decide what to do next. The product direction is simple and dependable, in the spirit of AgExpert’s “Solid. Simple. Built for the farm.”",
        "The home screen starts with one question, “What can I help with?”, and a few quick prompts such as Diagnose, Plan, Almanac and Seed, set over a live satellite view of the farm. Farm, Weather, Crops and Tasks sit in a persistent bar, so the most common jobs are never more than a tap away, even with gloves on and a weak signal.",
        "Drones and fields work as a pair: one-time or recurring flights can be automated, and the results come back as plain-language crop health, with counts of crops and diseases, the current disease pressure and a card for every field. Micro-weather adds warnings such as hail, with the details that matter for the next few hours. A calm palette of deep green and cream keeps the data readable outdoors.",
      ],
      // TODO: Tyler to confirm/edit these design details and the AI note.
      ai: "AI is the core of the product: it reads drone imagery to diagnose plants and answers farmers’ questions in the chat-style home. The UX work centred on making those results understandable and trustworthy, with clear language, visible confidence and an easy way to act. In my own process, AI helped with research summaries and microcopy drafts, while the design decisions were made by hand.",
    },
  },
  {
    slug: "micro1", title: "micro1 Cortex", subtitle: "The visibility layer for agentic AI", url: "https://www.micro1.ai/cortex",
    image: "/work/micro1-cortex.webp",
    cover: "/work/micro1-cover.webp",
    gallery: ["/work/micro1-1.webp", "/work/micro1-2.webp"],
    galleryBelow: true,
    study: {
      role: "AI Product Designer & UX Designer",
      year: "2026",
      headings: ["Making agent reliability legible", "A dashboard built around the evaluation loop", "Showing where automated and human judgment disagree"],
      paragraphs: [
        "As AI agents move into real workflows, teams are missing the basics: clear ways to measure performance, visibility into where and why agents fail, and monitoring once agents are live. Cortex is micro1’s visibility and improvement layer for agentic AI, combining expert human judgment with evaluations drawn from real workflows. The UX challenge was turning a technical, multi-step process into something a team can read at a glance.",
        "Cortex follows a loop: design the evaluation, diagnose failures, produce expert training data, then keep monitoring reliability. The pipeline view mirrors that loop. Four headline numbers sit at the top (total tasks, signed-off rate, average time to sign-off and rework rate), each with its change against the previous 30 days and a green or red cue for direction, so a reviewer knows within seconds whether things are improving. A date-range control keeps the comparison in the user’s hands.",
        "Below the headline numbers, the performance views explain the why. A score-agreement chart plots programmatic scores against an LLM judge, colour-coded by form type, with a diagonal reference line so disagreements stand out immediately. A task-complexity chart groups runs by message count with clear proportions. The interface stays quiet and dark, colour is reserved for data, and every card carries a plain-language title.",
      ],
      // TODO: Tyler to confirm/edit these design details and the AI note.
      ai: "AI is part of the product itself: Cortex pairs programmatic scoring and LLM judges with expert human review, so a lot of the UX work was deciding how to show where they agree and where they don’t. In my own process, AI helped me draft microcopy and prototype dashboard states faster, while the information design was decided by hand.",
    },
  },
  {
    slug: "terrazero", title: "TerraZero", subtitle: "Bringing Brands into the Intraverse", url: "https://terrazero.com",
    image: "/work/terrazero.webp",
    study: {
      role: "Founding Product Designer",
      year: "2021 — 2022",
      headings: ["Duo turns ten", "A seven-day Game Jam on Roblox", "A two-story Duo in Terra Zero"],
      paragraphs: [
        "Duolingo is known for bite-sized lessons, game-like streaks and a memeable mascot, Duo the owl. To celebrate Duo’s 10th birthday, the brand set out to master a new language: the metaverse’s. The plan was a multi-platform takeover of Roblox and Decentraland, meeting people where the spirit of play reigns.",
        "On Roblox, Duolingo dropped a free asset pack and invited every developer to a seven-day, non-competitive Game Jam to build their own Duolingo-inspired games. Developers earned prominent placement on Duolingo’s Roblox hub, and players earned coin multipliers to redeem for a one-of-a-kind Duo avatar. The result was 4M visits to the hub, 23 qualifying games and 3M visits to the Game Jam games.",
        "In Decentraland, a two-story statue of Duo stood in Terra Zero, at the edge of the leisurely Golf Craft, reminding passers-by to keep up their daily streak. The playful, slightly pushy campaign went on to win three Eventex Awards.",
      ],
      // TODO: Tyler to confirm/edit this project's role, year and AI note.
      ai: "This work predates the generative AI tools I use today. Now I would lean on AI to explore asset and environment ideas faster and to draft event copy, while the creative direction and the final experience would still be shaped by hand.",
    },
  },
  { slug: "finning", title: "Finning", subtitle: "24/7 Customer Platform", url: "https://www.finning.com/en_CA/technology/finning-customer-portal.html", label: "finning.com/en/technology/customer-portal", image: "/work/finning.webp" },
];

/** Older projects shown in the Archive list on /work. TODO: replace the Lorem ipsum placeholders with real projects. */
export const ARCHIVE: { name: string; year: string; blurb: string; url?: string }[] = [
  { name: "Lorem Ipsum", year: "2018", blurb: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore." },
  { name: "Dolor Sit", year: "2017", blurb: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo." },
  { name: "Consectetur", year: "2016", blurb: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
  { name: "Adipiscing", year: "2015", blurb: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim." },
  { name: "Eiusmod Tempor", year: "2014", blurb: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium." },
  { name: "Incididunt", year: "2013", blurb: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur." },
];

/**
 * Placeholder copy for every case-study page.
 * TODO: replace with real per-project details and write-ups (move into each WORK_LINKS entry).
 */
export const CASE_STUDY_DETAILS = [
  { label: "Role", value: "Lorem ipsum, dolor sit" },
  { label: "Year", value: "Lorem ipsum" },
];

/** Headings for the write-up rows (3 paragraphs, then "How AI was used"). */
export const CASE_STUDY_HEADINGS = ["Lorem ipsum dolor", "Sit amet consectetur", "Adipiscing elit sed"];

export const CASE_STUDY_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
];

export const CASE_STUDY_AI =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.";
