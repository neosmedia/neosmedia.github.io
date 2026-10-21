# Design system — Tyler Lange Portfolio

Source of truth for how the site looks and feels. Tokens live in `app/globals.css`
(global `:root` and the scoped `.fx` editorial wrapper). If you change a value here, change it there.

## Principles
1. **Editorial calm, playful hero.** Quiet type and soft surfaces below; the balloon letters are the one loud moment.
2. **Soft and rounded.** Big radii, no hard edges, no heavy shadows.
3. **Motion has weight.** Physics-based (soft-body, easing), never linear or snappy. Respect `prefers-reduced-motion`.
4. **Light and dark are equal.** Every token has both values; test both.
5. **Content first.** Few colours, one accent, generous space.

## Colour
Two scopes. The hero uses the global tokens; everything below the hero uses `.fx`.

| Token | Light | Dark | Use |
|---|---|---|---|
| Global `--bg` | `#ffffff` | `#000000` | Hero / page background |
| Global `--ink` | `#0a0a0a` | `#f4f4f2` | Hero text, letters |
| Global `--muted` | `#6b6b6b` | `#8f8f8f` | Secondary text |
| Global `--line` | `rgba(10,10,10,.14)` | `rgba(255,255,255,.18)` | Hairlines |
| `.fx --bg` | `#f4f2ee` | `#121110` | Section background |
| `.fx --ink` | `#1a1917` | `#f4f2ee` | Body text |
| `.fx --muted` | `#6b6862` | `#9b978f` | Subtitles, labels |
| `.fx --line` | `rgba(26,25,23,.12)` | `rgba(244,242,238,.14)` | Borders, dividers |
| `.fx --surface` | `#e9e6e0` | `#1e1c1a` | Cards, trays, hover grey |
| `.fx --accent` | `#c0603e` | `#e07a56` | Sparing emphasis |

Semantic colours:
- **Status green** `#2a8a52` (light) / `#5bd08a` (dark): the "Now" chip and the "Booking new projects" dot.
- **Link blue** `#3b6fd8` (light) / `#7ca3f5` (dark): links in the Info modal; the Design icon background.
- Card hover: surface grey. Hero hover/background: white in light, black in dark.

## Typography
| Role | Font | Notes |
|---|---|---|
| Body, UI | Geist (`--font-sans`) | 15px / 1.5 inside `.fx` |
| Labels, meta, tags | Geist Mono (`--font-mono`) | 11px, uppercase, letter-spacing .08em (`.fx .mono`); global body is mono 13px |
| Section headings, company/project names, subtitles, modal text | Gochi Hand (`--font-serif`) | Hand-drawn accent. Fallback "Comic Sans MS", cursive |

| Case-study headings | Geist Mono | Page title (h1) uses `--case-heading-size` (32–48px); first write-up heading is h2 (24–32px); later sub-headings use the **h3** style: 20–24px, weight 400, -0.02em (`.project-copy .h3`) |

Rules:
- Section headings are **centered**, no numbers, no dashes ("Experience", not "(04) — Experience").
- Project subtitles, About card text and the Info modal body all share the same style ("Product Designer & UX" style). Don't introduce a fourth text style.
- Sentence case. Use "&" in job titles. Avoid trailing periods on headings/taglines. Use curly apostrophes (’).

## Layout and spacing
- Page gutter: `--pad: clamp(16px, 2vw, 30px)`.
- `.fx` sheet slides up over the hero with `border-radius: 28px 28px 0 0`.
- Section rhythm: keep vertical spacing equal between sections (Selected work has +8px top by request).
- Max widths: Experience list and CTA **720px**; centered.
- Selected work: 3-column card grid; 9 cards as 3 / 3 / 3.
- Hero letters stay **16px** inside the viewport edge after growth (`EDGE_PX`).
- Mobile breakpoints: 520 / 700 / 800px.

## Shape
| Element | Radius |
|---|---|
| Pills, chips, buttons | 999px |
| About tray | 36px |
| About pillar cards | 26px |
| Experience tray / rows | 28px / 20px |
| Cards | 20px |
| Avatar, icon circles | 50% |

## Components
- **Nav:** T logo (white circle) top-left (toggles Info on the coming-soon page, otherwise links home), uppercase 12px links (Work, About, Contact) with the current page underlined, theme toggle, contact icons (hidden on phones). The first letter must not overlap the avatar.
- **Hero (BalloonName):** soft-body TYLER LANGE, drag to stretch, grows 15% over 15s, random soft jiggles, "Drag the letters" hint fades after first drag. Cursor: 28px move/grab.
- **Info modal:** circular clearing; letters shrink (0.2 desktop / 0.32 mobile) and shove out. Links blue, "INFO" button uppercase.
- **Selected work card:** title (Gochi Hand), subtitle (Gochi Hand, muted), lowercase URL, whole card links to its case study; surface-grey hover. A card with an `image` shows only the image at rest and the text card on hover/focus (on touch screens: text over a faded image). Note below: info icon + "Case studies coming soon".
- **About:** headline, tray of 3 pillar cards (Design / Engineer / Ship) with white icons on solid colour tiles (Design blue, Engineer and Ship solid colours), then "Design stack" toolbox (Figma, Framer, Claude, Cursor, React, Next.js, TypeScript, Vercel as CSS logo, Tailwind CSS, Three.js).
- **Experience:** tray of rows, company in Gochi Hand, role, years; "Now" chip green; date range sits next to the label; "Full resume on LinkedIn" button.
- **Let's build something good:** green status dot pill, headline with shader-filled "good", buttons: email, Book a call, LinkedIn, Send a message.
- **Footer:** "Product Designer & UX Engineer", INFO button.

## Motion and shaders
- Letters: Verlet soft body, snap-back is slow and eased (low `HOME_K`, high damping). See `lib/softbody.ts`.
- Colour shader fades **in only while dragging**, back to ink when idle (`SHADER_RISE_S 3.5`, `FALL_S 2.5`).
- Two variants alternate per visit: rainbow, and glossy blue bubble. `?shader=bubble|rainbow` forces one.
- Shader also fills the word "good" (`ShaderText`). Pause off-screen, 30fps.
- About icon tiles use plain solid colours, not the shader.
- Reduced motion: no continuous shader animation.

## Accessibility
- Visible `sr-only` H1; real text stays in DOM under shader overlays.
- Modal: `role=dialog`, `inert` when closed, Esc and outside-click close.
- Contrast: muted on surface must stay AA for body-size text; check any new colour in both themes.
- TODO: keyboard alternative for dragging letters.

## Voice
First person, short, confident, no fluff. Titles: "Product Designer & UX Engineer", "UX Design Engineer". Booking line: "Booking new projects — Nov ’26".

## Work and case-study pages
- **Archive list** (`/work/`): same grey tray and white row cards as the Experience list. Row = name (17–20px mono) + optional year, short blurb, pill "Website ↗" button.
- **Case study:** "← All Work" pill button top left; title (h1, `--case-heading-size` 32–48px mono) left, summary right; wide cover (16:9, or per-project `coverRatio`) or a bento grid; details column (sticky) left with the "Website ↗" pill; write-up right with one h2 then h3 sub-headings and a final "How AI was used" section. All blocks share a 1280px max width.
- **Bento grids:** 3 or 4 images (tiles with 28px radius on the surface colour); video tiles play silently only while on screen. Layouts: default (wide, tall + two short) and `split` (Fobi). Phones stack to one column.
- **About page:** centered 144px round portrait (colour, black and white on hover) and a name + location chip.
- **404:** "Lost? Same." with two buttons.
- **Voice for copy:** relaxed, short, first person where it fits. Plain words over jargon.
