# Tyler Lange — Portfolio

Personal portfolio site for Tyler Lange, Product Designer and UX Engineer.

**Status: v0.1.0.** The live site is a *coming soon* page with interactive balloon letters.
The full portfolio (home, work, 8 project pages, about, contact) is already built and
hidden behind a single launch switch (see [Launching the full site](#launching-the-full-site)).

- **Stack:** Next.js (App Router, static export) · React · TypeScript · plain CSS · Geist Mono
- **Hosting:** GitHub Pages (`neosmedia/neosmedia.github.io`), deployed by GitHub Actions
- **Dependencies:** none beyond Next/React. The balloon physics is hand-written, with no physics library.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
npm run lint       # type-check (tsc --noEmit)
```

Requires Node 20+ (Node 22 is used in CI). `next/font` downloads Geist Mono at build time,
so the first build needs internet access.

---

## What's in v0.1

**Coming soon page (`/`)**

- Full-screen *TYLER LANGE* in soft-body "inner tube" letters (drawn on a canvas):
  - **Drag** any letter. The tube bends and trails behind your finger, then eases home.
  - **Hover** (mouse) and the letter leans a little toward the cursor.
  - **Idle motion:** a gentle jiggle for the first 3 seconds, then at rest. After that, every
    5 or 10 seconds a few random letters jiggle. Over one minute the letters slowly grow 10%.
  - Hand-drawn / fat-marker look: wobbly strokes, uneven thickness, random letter sizes
    (the opening **T** is biggest, the closing **E** a touch smaller), small resting tilts.
  - Phones lay the name out on 3 lines (TYL / ERL / ANGE: top two rows 10% larger, bottom row 20% smaller).
- **Info** button (bottom right) or tapping your **photo** (top left) opens a modal: the letters
  are pushed aside to leave a clearing in the middle. Esc, or a click/tap outside, closes it.
- Top right: dark / light toggle, a divider, then email, phone and LinkedIn icons.
  - Light mode: black letters with a 1px white border. Dark mode: inverted (white letters, black border).
- **Daily toolbox** icon row below the first screen, then "Projects and case studies coming soon".
- Respects `prefers-reduced-motion` (no jiggle, hover, growth or pop-in).

**Built but hidden until launch**

- `/preview/` — full home page (balloon hero, work grid, about band, contact, footer)
- `/work/` and `/work/<slug>/` — 8 project pages from a shared template
- `/about/`, `/contact/` — with a working contact form (Formspree)
- Primary navigation (Work / About / Contact) — commented out in `components/SiteNav.tsx`

---

## Project structure

```
app/
  layout.tsx            Root layout: Geist Mono, theme script, nav, metadata
  page.tsx              "/" → ComingSoon, or Home once launched
  preview/page.tsx      Full home page, available before launch (noindex)
  work/                 Work index + [slug] project template (noindex until launch)
  about/  contact/      Pages (noindex until launch)
  globals.css           All styles + light/dark theme variables
components/
  BalloonName.tsx       Canvas renderer + pointer handling for the letters
  ComingSoon.tsx        Coming soon screen: info modal, footer, toolbox
  SiteNav.tsx           Top bar (photo, theme toggle, email, phone, LinkedIn)
  NavAvatar.tsx         Photo: opens the info modal on "/", links home elsewhere
  ThemeToggle.tsx       Dark / light switch (saved in localStorage)
  Toolbox.tsx           Daily toolbox icon row
  Home.tsx  ProjectGrid.tsx  ProjectCover.tsx  AboutBand.tsx
  ContactSection.tsx  ContactForm.tsx  SiteFooter.tsx
lib/
  glyphs.ts             Letter shapes (stroke centerlines) + stroke / width / height knobs
  softbody.ts           Physics + layout for the letters (all the tunables live here)
  site.ts               Name, email, phone, LinkedIn, launch flag, form + booking config
  projects.ts           The 8 projects
  toolbox.ts            Toolbox icons (SVG paths)
public/
  logo.png   Nav logo (T on a white circle, same as the favicon)
.github/workflows/deploy.yml   Build + deploy to GitHub Pages on push to main
```

---

## Configuration

Copy `.env.example` to `.env.local` for local work. For the live site, add the same names as
**repository variables** (Settings → Secrets and variables → Actions → *Variables*).
The deploy workflow passes them to the build.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_LAUNCHED` | `true` | `false` brings back the coming soon page at `/` and hides inner pages from search |
| `NEXT_PUBLIC_FORMSPREE_ID` | *(empty)* | Contact form endpoint. Empty = form opens the visitor's email app |
| `NEXT_PUBLIC_BOOKING_URL` | *(empty)* | "Book a time to chat" link (Cal.com, Calendly…). Empty = email |

Because this is a static export, `NEXT_PUBLIC_*` values are baked in at build time:
change a variable, then re-run the deploy workflow.

Contact details (email, phone, LinkedIn), services and the footer tool list are in `lib/site.ts`.

---

## Deploying

1. In the repo: **Settings → Pages → Source: GitHub Actions** (one time).
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` runs `npm ci`,
   `npm run build`, and publishes `./out`.
3. It's a user site (`neosmedia.github.io`), so it's served from the domain root and needs no `basePath`.

`next.config.mjs` sets `output: "export"`, `trailingSlash: true` and unoptimised images.
`public/.nojekyll` stops GitHub Pages from ignoring `_next/`.

---

## Launching the full site

Everything is already built. To go live:

1. **Content:** replace the colour-block covers in `lib/projects.ts` / `components/ProjectCover.tsx`
   with real images (put them in `public/work/<slug>/`) and write the case studies.
2. **Form:** create a Formspree form delivering to tylerlangebc@gmail.com and set
   `NEXT_PUBLIC_FORMSPREE_ID`. Send a test message. Optionally set `NEXT_PUBLIC_BOOKING_URL`.
3. **Navigation:** uncomment the logo and links block in `components/SiteNav.tsx`.
4. **Check** every page on a real phone and in dark mode (review the home page at `/preview/`).
5. **Launch:** the full site is on by default. To go back to "coming soon", set `NEXT_PUBLIC_LAUNCHED=false` and re-run the deploy workflow.
   To roll back, set it to `false` and re-run.

Until launch, `/preview/`, `/work/`, `/about/` and `/contact/` are reachable by URL but marked `noindex`.

---

## Editing content

| To change… | Edit |
| --- | --- |
| Info modal text and company links | `components/ComingSoon.tsx` |
| Footer line ("Product Designer and UX Engineer") | `components/ComingSoon.tsx` |
| Email / phone / LinkedIn | `lib/site.ts` |
| Toolbox icons (add, remove, reorder) | `lib/toolbox.ts` (24×24 SVG paths, e.g. from Simple Icons) |
| Projects (title, tagline, category, year, colours) | `lib/projects.ts` |
| Nav logo | replace `public/logo.png` (square, ~120px) |
| Colours / spacing / light-dark theme | `app/globals.css` (`:root` and `:root[data-theme="dark"]`) |
| Font | `app/layout.tsx` (`Geist_Mono`) |

---

## Tuning the balloon letters

Letter **shapes** — `lib/glyphs.ts`

| Constant | Effect |
| --- | --- |
| `STROKE` | Stroke thickness (fatter = chunkier; much above ~31 closes the E's slits) |
| `SX` / `SY` | Horizontal stretch / vertical squash of the letters |

Layout, size and feel — top of `lib/softbody.ts`

| Constant | Effect |
| --- | --- |
| `WIDE_LINES` / `TALL_LINES` | Letters per line (desktop `TYLER / LANGE`, phone `TYL / ERL / ANGE`) |
| `TALL_LINE_SCALE` | Per-line size on phones (`[1.1, 1.1, 0.8]` = top two rows 10% larger, bottom row 20% smaller) |
| `GAP` / `LINE_GAP` | Space between letters / lines |
| `UNEVEN_GAP` / `UNEVEN_Y` | How unevenly letters are spaced (random gap multipliers) and how far each sits above / below its neighbours |
| `HERO_SCALE` (in `BalloonName.tsx`) | Overall lettering size (`1` = fills the screen, `0.9` = 10% smaller; now 1.0) |
| `SIZE_MIN` / `SIZE_MAX` / `FIRST_SIZE` / `LAST_SIZE` | Random per-letter size range; fixed sizes for the first and last letter |
| `TILT` | Resting rotation of each letter (degrees) |
| `SHAPE_K` | How firmly letters keep their shape (lower = floppier) |
| `HOME_K` | How fast dragged letters drift back (`0` = they stay where dropped) |
| `DAMPING` | Air drag (higher = more glide) |
| `HOVER_FOLLOW` / `HOVER_MAX` / `HOVER_EASE` | Hover lean strength, limit and smoothness |
| `IDLE_SECONDS` | How long the opening jiggle takes to fade to rest |
| `JIGGLE_STRENGTH` / `JIGGLE_KICK` / `JIGGLE_SECONDS` / `JIGGLE_STAGGER` | The random 5 / 10 second jiggle |

The hand-drawn marker feel (line wobble `A1` / `A2`, thickness variation `rA`, per-stroke thickness
`strokeK`) is set where letters are built in `buildWorld`.

Rendering — top of `components/BalloonName.tsx`: `GROW_BY` / `GROW_MS` (slow inflate),
`FILL` / `BORDER` / `BORDER_PX` (colours per theme).

### How it works (short version)

Each letter is a chain of particles with a variable radius (a tube). Particles are linked by
distance constraints and gently pulled back to their resting shape (shape matching), so grabbing
one point bends the tube instead of moving a rigid block. Letters push each other apart through
particle collisions. The Info modal adds an elliptical "no-go" zone in the middle. The canvas draws
each tube as a smooth Catmull-Rom curve of overlapping circles, with a 1px halo for the border.
Physics is simulated in `lib/softbody.ts` with no DOM access, so it can be tested headlessly.

---

## Notes and limitations

- Dragging works with mouse and touch. On touch, only a gesture that starts on a letter drags;
  anywhere else scrolls the page.
- Hover nudge is mouse-only. Dark mode is saved per browser, defaulting to light.
- The toolbox icon set was modelled on a reference site's row (it includes Three.js, Vercel,
  Next.js and Tailwind), so it may not match your actual stack. Edit `lib/toolbox.ts` to match.
- The about and project-page copy is placeholder until the case studies are written.
- Design reference: the *Tyler Lange Portfolio 27* Figma file (home frame).

See [CHANGELOG.md](CHANGELOG.md) for release notes.
