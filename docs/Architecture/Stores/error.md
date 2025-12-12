---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Error store"
summary: "Reference for the renderer ErrorStore used for consistent error/loading reporting across stores and services."
created: "2025-12-12"
last_reviewed: "2025-12-12"
category: "guide"
author: "Uptime Watcher Team"
tags:
  - stores
  - error-handling
  - observability
---

# Error store

## Purpose

`useErrorStore` is the renderer’s **single source of truth** for:

- store-scoped errors (`storeErrors`)
- operation-scoped loading (`operationLoading`)

This enables consistent UI surfaces (error banners, spinners, retry controls)
without each domain store inventing its own `lastError/isLoading` state.

## Source

- `src/stores/error/useErrorStore.ts`

## Public API expectations

Callers should prefer:

- `setStoreError(storeKey, message)` / `clearStoreError(storeKey)`
- `setOperationLoading(operationName, boolean)`
- `getStoreError(storeKey)`
- `getOperationLoading(operationName)`

Domain stores should normally integrate via:

- `createStoreErrorHandler(storeKey, operationName)`
  - `src/stores/utils/storeErrorHandling.ts`

## Architecture notes

This store is a **cross-cutting architectural pattern**: it centralizes error
and loading state so that domain stores don’t duplicate error-handling logic.

Boundary rule:

- Domain stores write to `useErrorStore` (directly or via
  `createStoreErrorHandler`).
- UI components **read** from `useErrorStore` to render consistent banners,
  spinners, and retry surfaces.

## Store keys

Store keys should be stable strings used consistently across the renderer.
Examples:

- `"monitor-types"`
- `"sites"`
- `"settings"`

## Notes on legacy fields

`isLoading` / `lastError` may exist for broader UI compatibility, but **domain
stores must not add their own store-local equivalents**. Prefer the per-store
and per-operation APIs above.

## Testing

Search by usage:

- `src/test/**/*useErrorStore*`
