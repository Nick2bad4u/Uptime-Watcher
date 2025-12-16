---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Confirm dialog store"
summary: "Reference for the renderer store that manages confirm dialog state and promise resolution."
created: "2025-12-12"
last_reviewed: "2025-12-12"
category: "guide"
author: "Uptime Watcher Team"
tags:
 - stores
 - ui
 - dialogs
---

# Confirm dialog store

## Purpose

`useConfirmDialogStore` manages global confirm dialogs with a promise-based API.

This is **UI-only** state. It coordinates:

- dialog visibility + config
- resolving/rejecting the pending confirmation promise

## Source

- `src/stores/ui/useConfirmDialogStore.ts`

## Usage guidelines

- Prefer using the store action API rather than setting dialog state directly.
- Always ensure promise resolution happens exactly once.

## Testing

- `src/test/stores/ui/*`

## Architecture notes

This is an example of the **"UI workflow store"** pattern: a store that
coordinates short-lived UI flows (like confirmation) without leaking that logic
into domain stores.
