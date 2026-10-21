# Tyler Lange — Portfolio

Personal portfolio site for Tyler Lange, Product Designer and UX Engineer. **Live at https://tylerlange.ca**

- **Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript · plain CSS · Geist, Geist Mono and Gochi Hand
- **Hosting:** GitHub Pages (`neosmedia/neosmedia.github.io`, custom domain `tylerlange.ca`), deployed by GitHub Actions on push to `main`
- **Dependencies:** none beyond Next/React. The balloon physics and the WebGL shaders are hand-written.
- **Branches:** `dev` is work in progress, `main` is what goes live.
- **Design rules:** see [DESIGN.md](DESIGN.md). Release notes: [CHANGELOG.md](CHANGELOG.md).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
npm run lint       # type-check (tsc --noEmit)
```

Node 20+ (CI uses 22). `next/font` downloads the fonts at build time, so the first build needs internet access.

---

## What's on the site

| Page | Route | Notes |
| --- | --- | --- |
| Home | `/` | Interactive balloon-letter hero, selected work (8 cards), about, experience, contact CTA |
| Work | `/work/` | The same 8 cards plus the Archive list |
| Case study | `/work/<slug>/` | One per project, built from `lib/site.ts` (cover, optional bento, details, write-up, AI note) |
| About | `/about/` | Portrait with hover, name chip, about, experience, CTA |
| Contact | `/contact/` | Contact form (Formspree) and direct links |
| 404 | any unknown URL | `app/not-found.tsx`: "Poof! That page is gone." with a draggable balloon 404 (same letters and physics as the hero) |
| Style guide | `/styleguide/` | Pill button specimen (`noindex`, not linked or in the sitemap) |
| Preview | `/preview/` | Old duplicate of the home page. `noindex`, kept so old links work |

Balloon hero: drag letters (soft-body physics), hover lean, random idle jiggle, slow growth, a colour shader that fades in
only while dragging (rainbow, or a glossy blue bubble on alternate visits; `?shader=bubble|rainbow` forces one), and an
Info modal that clears space in the middle. It respects `prefers-reduced-motion`.

---

## Project structure

```
app/
  layout.tsx              Root layout: fonts, theme script, nav, global metadata + JSON-LD
  page.tsx                "/" → Home (or ComingSoon if NEXT_PUBLIC_LAUNCHED=false)
  work/ about/ contact/   Pages. work/[slug]/page.tsx is the case-study template
  not-found.tsx           404 page
  robots.ts  sitemap.ts   SEO files (sitemap lists every page and case study)
  globals.css             All styles. The `.fx` block is the editorial look below the hero
components/
  BalloonName.tsx         Canvas renderer + pointer handling for the hero letters
  Home.tsx  ComingSoon.tsx  HomeSections.tsx   Page sections (work grid, archive, about, experience, CTA)
  SiteNav.tsx  NavLinks.tsx  NavAvatar.tsx  ThemeToggle.tsx
  BentoVideo.tsx          Looping silent video tile (plays only on screen)
  ShaderText.tsx          Shader-filled text ("good")
  ContactForm.tsx  SiteFooter.tsx  Toolbox.tsx
lib/
  site.ts                 ALL the content: contact details, experience, work, archive, case studies
  seo.ts                  Per-page metadata helper (canonical, Open Graph, Twitter)
  softbody.ts  glyphs.ts  rainbow.ts  toolbox.ts  projects.ts
public/
  work/                   Project images and the Fobi video
  logo.png  ty-color.jpg  ty-bw.jpg  og-image.png  CNAME  .nojekyll
```

---

## Editing content

Almost everything is in **`lib/site.ts`**.

| To change… | Edit |
| --- | --- |
| Email, phone, LinkedIn | `lib/site.ts` (`EMAIL`, `PHONE_TEL`, `LINKEDIN_URL`) |
| Experience list | `EXPERIENCE` |
| Home / Work cards | `WORK_LINKS` |
| Archive list | `ARCHIVE` (newest first; `year` and `url` are optional) |
| Fallback case-study copy | `CASE_STUDY_*` |
| About headline and pillars | `ABOUT_HEADLINE`, `ABOUT_PILLARS` |
| Toolbox icons | `lib/toolbox.ts` (24×24 SVG paths) |
| Colours, spacing, dark mode | `app/globals.css` and [DESIGN.md](DESIGN.md) |
| Nav logo / About photos | `public/logo.png`, `public/ty-color.jpg`, `public/ty-bw.jpg` |

### Adding a project

1. Add an entry to `WORK_LINKS` in `lib/site.ts`: `slug`, `title`, `subtitle`, `url`, `image` (the 4:3 card image).
2. Put images in `public/work/` as WebP (about 1000–1600px wide; videos as a short silent MP4 under ~1 MB plus a `-poster.webp`).
3. Optional fields:
   - `cover`, `coverRatio`: wide hero image for the case study (default ratio 16 / 9).
   - `gallery`: a bento grid of 3 or 4 images (an `.mp4` renders as a looping video). With no `galleryBelow` it replaces the cover; with `galleryBelow: true` it sits below the cover. `bentoLayout: "split"` is the Fobi arrangement.
   - `study`: `role`, `year`, three `headings`, three `paragraphs` and the `ai` note. Without it the fallback copy is used.
4. The page, sitemap entry, canonical URL and structured data are generated automatically.

---

## Configuration

Copy `.env.example` to `.env.local` for local work. For the live site, add the same names as
**repository variables** (Settings → Secrets and variables → Actions → *Variables*). The deploy workflow passes them to the build.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_LAUNCHED` | `true` | `false` brings back the coming soon page at `/` and hides inner pages from search |
| `NEXT_PUBLIC_FORMSPREE_ID` | *(empty)* | Contact form endpoint. Empty = the form opens the visitor's email app |

`NEXT_PUBLIC_*` values are baked in at build time: change a variable, then re-run the deploy workflow.
If a repository variable named `NEXT_PUBLIC_LAUNCHED` is set to `false`, the live site stays on the coming soon page.

---

## Deploying

1. Repo **Settings → Pages → Source: GitHub Actions** (one time).
2. Merge `dev` into `main`. The workflow runs `npm ci`, `npm run build` and publishes `./out`.
3. Custom domain `tylerlange.ca` (`public/CNAME`): the apex needs A records `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`;
   `www` needs a CNAME to `neosmedia.github.io`; then tick **Enforce HTTPS** in Pages settings once the certificate is ready.

`next.config.mjs` sets `output: "export"`, `trailingSlash: true` and unoptimised images (no image server on GitHub Pages).

---

## Launch checklist

- [ ] Replace every `TODO` in `lib/site.ts` (case-study details and AI notes, About copy)
- [ ] Create a Formspree form delivering to tylerlangebc@gmail.com, set `NEXT_PUBLIC_FORMSPREE_ID`, send a test message
- [ ] `npm run lint` and `npm run build` pass
- [ ] Check every page on a real phone, in dark mode, and at a narrow desktop width
- [ ] `https://tylerlange.ca` loads with a valid certificate (and `www` redirects to it)
- [ ] Share preview works (paste the URL into LinkedIn / Slack); submit `https://tylerlange.ca/sitemap.xml` in Google Search Console

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

- Dragging works with mouse and touch. On touch, only a gesture that starts on a letter drags; anywhere else scrolls the page.
- Hover nudge is mouse-only. Dark mode is saved per browser, defaulting to light.
- The letters are pointer-only for now (no keyboard way to drag them). Everything else is keyboard accessible.
- Project images are static WebP files (no image optimizer on GitHub Pages), so keep them small.
- The shaders need WebGL; without it the letters stay plain ink.
