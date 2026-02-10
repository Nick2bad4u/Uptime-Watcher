---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "UI store"
summary: "Reference for renderer UI-only state: sidebar, panels, view prefs, and other non-domain UI toggles."
created: "2025-12-12"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Uptime Watcher Team"
tags:
 - "stores"
 - "ui"
---

# UI store

## Purpose

`useUiStore` holds **renderer UI-only state** that is not part of the domain
model (sites/monitors/settings). Examples include:

- open/closed UI panels
- currently selected view modes
- UI toggles that should not leak into domain logic

## Source

- `src/stores/ui/useUiStore.ts`

## Error handling

UI stores generally should not push errors into `useErrorStore` unless they are
wrapping a user-triggered action that can fail (for example, opening an external
URL). Prefer:

- log + user-facing alert, or
- log + ErrorStore, depending on whether the error should show globally.

## Testing

- `src/test/stores/ui/*`

## Architecture notes

This store is intentionally **UI-only**. The architectural boundary is:

- Domain stores contain domain state (sites/settings/monitor types).
- UI stores contain interaction state and view preferences.

Keeping UI state out of domain stores reduces coupling and prevents duplicated
logic in the domain layer.
