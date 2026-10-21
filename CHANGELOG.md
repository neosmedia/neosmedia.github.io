# Changelog

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
