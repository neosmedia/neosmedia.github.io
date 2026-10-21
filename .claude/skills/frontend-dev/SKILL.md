---
name: frontend-dev
description: Front-end development conventions for this Next.js static portfolio. Use when editing components, styles, physics/shader code, performance, SEO or deployment.
---

# Front-end dev

## Stack
Next.js 16 (App Router, `output: "export"`, `trailingSlash`), React 19, TypeScript, plain CSS in `app/globals.css`. Fonts via `next/font/google`: Geist, Geist Mono, Gochi Hand. Deploy: push to `main` -> GitHub Actions -> GitHub Pages (`public/CNAME` = tylerlange.ca). Work on `dev`.

## Rules
1. Static export only: no server actions, API routes or runtime image optimisation.
2. Server components by default; add `"use client"` only for state, effects, canvas, WebGL.
3. Style with the CSS variables in `DESIGN.md` / `globals.css`. Below the hero, scope under `.fx`. Dark mode via `:root[data-theme="dark"]`.
4. Content lives in `lib/site.ts` (copy, experience, work links) and `lib/toolbox.ts`. Don't hard-code copy in components.
5. Keep dependencies at zero where possible (physics and shaders are hand-written).
6. TypeScript strict, no `any`. Run `tsc` before committing.

## Key files
- `lib/softbody.ts`: Verlet soft-body letters; tuning constants at top.
- `components/BalloonName.tsx`: canvas loop, pointer input, paint-skip when at rest.
- `lib/rainbow.ts`: WebGL rainbow + bubble shaders, `getShaderVariant()`.
- `components/ShaderText.tsx`: shader-filled text, lazy WebGL.
- `components/HomeSections.tsx`: Selected work, About, Experience, CTA.
- `app/layout.tsx`: fonts, metadata, JSON-LD. `app/robots.ts`, `app/sitemap.ts`.

## Performance
- Never allocate inside per-frame loops. Create WebGL contexts lazily, pause when off-screen, cap shader at 30fps for text.
- Skip repaint when `world.moved` is ~0 and nothing is dirty.
- Cap devicePixelRatio at 2. Keep CSS lean; remove dead rules.

## Env
`NEXT_PUBLIC_LAUNCHED`, `NEXT_PUBLIC_FORMSPREE_ID` (see `.env.example`).

## Before finishing
Type-check, test light + dark, 375px + desktop, reduced motion, and `?shader=bubble` / `?shader=rainbow`.
