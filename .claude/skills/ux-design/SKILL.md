---
name: ux-design
description: UX design guidance for the portfolio: information architecture, interaction, accessibility, content and usability review. Use when planning flows, forms, navigation, or auditing usability.
---

# UX design

## Information architecture
Home (hero + sections) · Work (8-9 project sub-pages) · About · Contact (form -> tylerlangebc@gmail.com). "/" is the coming-soon page until `NEXT_PUBLIC_LAUNCHED=true`; the full home previews at `/preview/`.

## Principles
1. Visitors should know who Tyler is, what he does and how to contact him within 5 seconds.
2. Primary action everywhere: get in touch (email, Book a call, form). Keep it one tap away.
3. Playful interaction (dragging letters) must never block content or navigation.
4. Every interactive element has hover, focus-visible, active and disabled states.

## Interaction rules
- Pointer targets at least 44px on touch.
- Modals: focus management, Esc closes, outside click closes, `inert` when hidden.
- Scrolling while opening Info glides gently to the top.
- Forms: label every field, inline errors, clear success state, fall back to `mailto:` without a Formspree ID.
- Hints fade once learned ("Drag the letters" after first drag).

## Accessibility
- Semantic landmarks, one H1 (sr-only on home), logical heading order.
- WCAG AA contrast in both themes. Don't rely on colour alone (status dot has a text label).
- `prefers-reduced-motion`: stop continuous animation, use instant scroll.
- Overlays (shader text) keep real text in the DOM, `aria-hidden` on the overlay.
- Known gap: dragging letters is pointer-only.

## Review checklist
- Can a keyboard user reach everything? Is focus visible?
- Does it work with no WebGL / no JS / small screens?
- Is the content scannable (short lines, clear labels)?
