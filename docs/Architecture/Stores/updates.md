---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Updates store"
summary: "Reference for the renderer store managing app update availability and user-triggered update actions."
created: "2025-12-12"
last_reviewed: "2026-02-01"
category: "guide"
author: "Uptime Watcher Team"
tags:
 - stores
 - updates
 - ui
---

# Updates store

## Purpose

`useUpdatesStore` models update state for:

- update lifecycle status (`updateStatus`) and errors (`updateError`)
- update progress (`updateProgress`) for UI affordances
- user action for applying a downloaded update (`applyUpdate`)

## Source

- `src/stores/updates/useUpdatesStore.ts`

## Notes on error state

This store currently keeps `updateError` locally.

That’s acceptable if the UI renders update errors _only_ in the updates surface.
If we decide update errors should participate in the global error surfaces, this
store can be migrated to `useErrorStore` + `createStoreErrorHandler`.

## Integration points

- Any UI that displays update status or triggers update checks.

This store also subscribes to update lifecycle broadcasts emitted from the main
process over the `update-status` renderer event channel (see
`shared/ipc/rendererEvents.ts`). The subscription is established via
`EventsService.onUpdateStatus` inside `subscribeToUpdateStatusEvents()`.

## Testing

- `src/test/stores/updates/*`

## Architecture notes

This store represents an **application-level workflow** rather than domain
state (sites/monitors). It may keep some UI-local error state (`updateError`)
because the updates UI owns the presentation.

If update failures should appear in global error surfaces, migrate this store to
`useErrorStore` + `createStoreErrorHandler`.
