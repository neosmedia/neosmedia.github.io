# Changelog

## Unreleased

- Removed the blue water shader and the random pick: the rainbow is the only shader.
- Hero info balloon: a slow-drifting balloon with an info icon and a pullable string. Click or tap it to open a short "how to play" note; the letters move aside and open a hole for it. Esc or a tap elsewhere closes it.

## v0.1.0 — coming soon page

- Full-screen coming soon page with interactive "inner tube" balloon letters:
  drag them, hover to nudge, a gentle jiggle every 5 or 10 seconds, slow 10% growth over a minute.
- Info modal (button bottom right, or tap the photo) that pushes the letters aside.
- Dark / light mode, email, phone and LinkedIn icons top right.
- Daily toolbox below the first screen.
- Full portfolio (home preview at `/preview/`, work + 8 project pages, about, contact form)
  built but hidden behind `NEXT_PUBLIC_LAUNCHED`.

## v0.4.0
- Performance: broad-phase letter collisions, paint skipped when the scene is at rest, lazy WebGL creation (hero + "good" text), allocation-free path tracing, dead code/CSS removed (ShaderDisc, wordmark mode).
- Dev docs: header comments and TODOs across physics, shader, hero and home sections.
- Launch: full site is on by default (`NEXT_PUBLIC_LAUNCHED !== "false"`); sitemap lists every page; per-page canonical/Open Graph/Twitter metadata (`lib/seo.ts`); case studies get CreativeWork + breadcrumb JSON-LD; About page has an h1.
- Contact page: removed the Book a call button.
- Work, About, Contact pages and 9 case studies (bento image grids, per-project copy), archive list, T logo in the nav, About portrait + name chip.

## v0.5.0
- Work grid is 2 per row (1 on phones), 16:9 covers, 8 projects (secureWISE hidden for now); Finning bento with banner, laptop and phones.
- Hero avatar that opens into a speech bubble (job title), dark/light aware; big static TYLER LANGE (10% opacity) under the footer; footer page links, design-stack icons, contact icons.
- Press and hold a balloon letter for 3s to pop it (with the shader on the droplets); the shader (rainbow or bubble) is now picked at random on every page load.
- Contact page redesigned (Vancouver chip with live GMT offset, email pill, X / LinkedIn / Dribbble icons); contact form delivers through Formspree (`xnpparbe`).
- About: bio, philosophy, specialties, "Dive into my work" cards; archive list with company icon tiles and years; 404 reads "Error 404: Poof!".
- SEO, mobile/touch and hover fixes (see below).
- SEO pass: `lang="en-CA"`, keyword titles for Work / About / Contact, unique case-study titles and descriptions (from each write-up), Twitter handle, Person schema (job title, current employer, X + Dribbble in `sameAs`, portrait), ProfilePage / CollectionPage+ItemList / ContactPage JSON-LD.
- Archive list: AutoTrader and Modo added, placeholder rows removed, ordered newest first, relaxed copy.
- Case studies: Aurora, Cimetrix and Finning written; fallback copy no longer Lorem ipsum.
- Footer year is now automatic; custom 404 page; `public/.nojekyll`; Aurora image recompressed.
- README rewritten (pages, adding a project, launch checklist, domain/HTTPS setup); DESIGN.md covers work/case-study pages.
- Hero: 20px space below, small avatar over the balloons with a job-title tooltip (shows on load, fades, then on hover) (`components/HeroAvatar.tsx`, `ROLE_TITLE` in `lib/site.ts`). Footer: email / phone / LinkedIn icons (`components/ContactIcons.tsx`, shared with the nav).
- Balloon letters (home hero, 404): press and hold a letter for 3 seconds and it swells, trembles, then pops (ink droplets + ring); it grows back after ~3s. Tunables `POP_MS`, `POP_SWELL`, `REGROW_MS` in `components/BalloonName.tsx`.
- Footer: big static one-line TYLER LANGE under the footer, cropped at 80% (`components/FooterName.tsx`, the hero's exact letters, 10% opacity, no animation). Name chip is now `components/NameChip.tsx` (About + Contact) and shows the live Vancouver GMT offset.
- 404 page: balloon-letter "404" using the hero physics (`buildWorld` accepts custom `letters`; new "4" and "0" glyphs).
- 404: Contact button removed, "See the work" is the primary button. New `Button` component and pill-button system (primary/outline, sm/md/lg, icon left/right/only), documented in DESIGN.md with a noindex `/styleguide/` specimen page.
