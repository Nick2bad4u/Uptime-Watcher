---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Alerts store"
summary: "Reference for the renderer alerts/toast queue store."
created: "2025-12-12"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Uptime Watcher Team"
tags:
 - "stores"
 - "ui"
 - "alerts"
---

# Alerts store

## Purpose

`useAlertStore` is the renderer-side queue for ephemeral user-facing alerts
(toasts/banners). It is intentionally **UI-scoped** state (not persisted).

## Source

- `src/stores/alerts/useAlertStore.ts`

## Key behaviors

- Alerts are queued in `alerts`.
- Each alert has a stable identifier; callers should treat the identifier as the
  dismissal handle.
- Alerts are dismissed via store actions (don’t mutate the array directly).

## Integration points

- `src/components/Alerts/*` (toaster + toast rendering)
- `src/components/Alerts/alertCoordinator.ts` (coordination / lifecycle)

## Error handling

This store does not use `useErrorStore` (alerts are UI state). If an alert is
triggered by an operation failure, the **source** (store/service) should record
the error in `useErrorStore` and then enqueue a user-friendly alert separately.

## Testing

- `src/test/stores/alerts/useAlertStore.test.ts`
- `src/test/components/Alerts/*`

## Architecture notes

This store implements the "UI feedback" pattern: it queues user-facing messages
but must not embed domain rules (for example, retry logic). Domain stores and
services decide _what happened_; the alerts store decides _how to present it_.
