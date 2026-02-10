---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Style & Layout Guide"
summary: "Guide to shared styling primitives and layout conventions used in the Uptime Watcher renderer UI."
created: "2025-10-07"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "styling"
  - "layout"
  - "ui"
  - "css"
---
# Style & Layout Guide

This guide documents the shared styling primitives that keep the renderer consistent. Follow these practices whenever you add screens, modals, or high-level layout primitives.

## Design Tokens & Surfaces

- Use the theme component utilities defined in `src/theme/styles/components/` (imported via `src/index.css`) first; they expose the gradient surfaces, border radii, and spacing scales expected across the app.
- Reference color tokens such as `--modal-accent`, `--color-surface-overlay`, and `--color-status-up` instead of hard-coded hex values.
- Prefer `color-mix` with existing tokens to derive subtle overlays rather than introducing new palette entries.

## Modal Composition

- Wrap modal shells with the `modal-shell` class and add an accent modifier (`modal-shell--accent-success`, etc.) to inherit the shared gradient and close-button styling.
- Keep content scrollable by nesting a sentinel-free `div` with `modal-shell__body` followed by the domain-specific body classes.
- Use tooltip-enabled controls for action clusters. For header collapse toggling, rely on sentinel observers (see `SiteDetails.tsx`) to avoid scroll jitter.

## Buttons & Iconography

- Use `ThemedButton` variants (`primary`, `secondary`, `warning`, etc.) instead of bespoke button classes.
- Choose icons from `AppIcons`; the shared namespace prevents duplicated glyphs. For “start all” actions, use `AppIcons.actions.playAll`. For single monitor actions, use `AppIcons.actions.play` / `pause`.
- Provide tooltips for destructive or stateful actions so long-press and keyboard focus reveal the intent.

## Toggle & Segmented Controls

- Compose visual states with local CSS custom properties that reference the shared tokens. Example: the dashboard layout selector defines `--site-list-border-weak`, `--site-list-highlight`, etc., all derived from `var(--color-*)` values.
- Avoid hard-coded RGBA values for hover/active states; instead, use `color-mix` with the theme palette so both light and dark themes stay cohesive.
- Keep typography consistent with uppercase labels, `letter-spacing`, and `font-weight` helpers already established in `SiteListLayoutSelector`.

## Section & Card Layouts

- For grouped settings or analytic cards, prefer `ThemedBox` with `surface="elevated"` or `surface="base"` and reuse `.settings-section` or `.site-card` helpers.
- Maintain vertical rhythm by using Tailwind utility clusters (`space-y-*`, `gap-*`) already established in components like `AddSiteForm` and `SiteDetailsNavigation`.

## CSS Authoring Guidelines

- Keep component-level CSS files focused on structural rules; global palettes live under `src/theme`.
- When introducing new structures, factor sharable rules into the theme layer, then consume them via semantic class names.
- Avoid duplicating gradient definitions—inherit from the modal or section helpers and override with tokens only when necessary.

## Modular Stylesheet Structure

- `src/index.css` imports the focused partials in `src/theme/styles/components/`. Group primitives by domain (foundation, buttons, forms, overlays, cards, layout, utilities, icons, and animations) before adding new selectors so styling ownership remains clear.
- Feature-specific surfaces such as the Site Details modal live in `src/components/SiteDetails/styles/`. Each tab or structural region owns its own stylesheet and `src/index.css` pulls them in, keeping the load order centralised. Extend existing partials (for example `history.css` or `header.css`) instead of growing a single monolithic file.
- When adding entirely new domains, prefer creating a new partial rather than bolting selectors onto an unrelated file. Update `src/index.css` with the new `@import` so the fragment participates in the global stack and keep the list alphabetised within its grouping.
- If you introduce additional lint overrides, isolate them within the new partial instead of broadening repository-wide disable comments.

Following these conventions keeps new UI aligned with the existing visual language and makes it simple to evolve palettes in one place.
