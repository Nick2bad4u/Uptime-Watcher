---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Settings Store and History Limits"
summary: "Overview of the settings store, history limit semantics, and how renderer consumers should interpret unlimited retention."
created: "2025-12-10"
last_reviewed: "2026-01-10"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "stores"
  - "settings"
  - "history-limit"
  - "configuration"
---
# Settings Store and History Limits

This page documents the renderer settings store and, in particular, the
semantics of the shared history-limit configuration so that future components
and services stay aligned with the backend and shared contracts.

## Key Modules

Renderer and shared modules involved in settings and history-limit handling:

- `src/stores/settings/useSettingsStore.ts` – Primary Zustand store for
  application settings, including `historyLimit` and notification
  preferences.
- `src/stores/settings/operations.ts` – Settings operations and backend/event
  synchronization. Subscribes to `settings:history-limit-updated` so the store
  stays consistent when the backend changes the value.
- `src/components/Settings/Settings.tsx` – Main settings UI, responsible for
  letting users choose a history limit and other preferences.
- `src/constants.ts` – Exposes `DEFAULT_HISTORY_LIMIT` and
  `HISTORY_LIMIT_OPTIONS`, including an "Unlimited" option with a value of `0`.
- `shared/constants/history.ts` – Canonical history-limit rules and
  `normalizeHistoryLimit` helper shared between renderer and main process.
- `electron/services/ipc/handlers/settingsHandlers.ts` – IPC handlers that
  apply history-limit updates to the orchestrator and persistence layer.
- `docs/Architecture/README.md` – Architecture-level description of history
  limit propagation between renderer, IPC, and the database.

## Shared History-Limit Semantics

The shared history-limit rules live in `@shared/constants/history`:

- `DEFAULT_HISTORY_LIMIT_RULES.defaultLimit` is the canonical default
  retention value for monitors.
- `DEFAULT_HISTORY_LIMIT_RULES.minLimit` and `maxLimit` define the allowed
  bounds for finite limits.
- `normalizeHistoryLimit(candidate, rules)` enforces these bounds and has a
  special-case behaviour for zero and negative values.

The important invariants are:

- **`candidate <= 0` is treated as `0`**, representing **unlimited
  retention** (no pruning), both in the database layer and in shared
  contracts.
- Finite, positive values are normalised and clamped to
  `[minLimit, maxLimit]`.

The constants in `src/constants.ts` are intentionally aligned with these
semantics:

- `HISTORY_LIMIT_OPTIONS` includes an **"Unlimited"** option that uses
  `value: 0` and is explicitly documented as disabling pruning via the shared
  history rules.

## Renderer Consumer Guidance

Any renderer code that consumes `historyLimit` from the settings store must
respect the shared semantics:

- Treat `historyLimit === 0` as **unlimited retention**, not as a falsy value
  that should be replaced with some small default.
- Avoid patterns such as `settings.historyLimit || 25` which silently
  override the intended meaning of `0`.
- When a UI element needs its own _display_ cap (for example, a dropdown of
  the number of records to show at once), compute that cap separately from the
  backend history limit rather than overloading `historyLimit`.

### Example: History tab display limit

`src/components/SiteDetails/tabs/HistoryTab.tsx` exposes a "Show" dropdown
that lets the user choose the number of records to display in the monitor history
view. The component now uses a small helper to interpret the backend
history limit correctly:

```ts
import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";

const resolveBackendHistoryLimit = (
 rawLimit: number | undefined,
 historyLength: number
): number => {
 if (rawLimit === 0) {
  // Unlimited retention – cap UI at the number of available records.
  return historyLength > 0
   ? historyLength
   : DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;
 }

 if (typeof rawLimit !== "number" || Number.isNaN(rawLimit)) {
  return DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;
 }

 const normalized = Math.floor(rawLimit);

 if (normalized <= 0) {
  return DEFAULT_HISTORY_LIMIT_RULES.minLimit;
 }

 return normalized;
};
```

Key points:

- A `historyLimit` of `0` is treated as **no backend cap**, so the UI limits
  to `historyLength` rather than to an arbitrary constant.
- Non-numeric or NaN values fall back to the shared default limit.
- Small or negative values are normalised up to `minLimit`.

When additional components or hooks need to derive display-specific history
limits, they should follow the same pattern:

1. Use `DEFAULT_HISTORY_LIMIT_RULES` / `normalizeHistoryLimit` from
   `@shared/constants/history` as the single source of truth.
2. Handle `0` explicitly as the **unlimited** case.
3. Introduce separate UI-level caps where needed instead of relying on
   `||`-style fallbacks.

By following these rules, renderer code stays consistent with the backend
semantics and the architecture documentation, avoiding subtle bugs where a
user-selected "Unlimited" history limit is silently treated as a small
finite value in one part of the UI.

## Event Propagation and Store Synchronization

History limit updates can originate from multiple sources (UI actions, imports,
orchestrator migrations, or database maintenance). Renderer consumers should
not assume the local UI is the only source of truth.

To keep the in-memory settings store aligned, the settings operations layer
subscribes to the `settings:history-limit-updated` renderer broadcast via
`EventsService.onHistoryLimitUpdated`. That broadcast originates in the main
process (see `electron/services/application/ApplicationService.ts`) and carries
both the new `limit` and the `previousLimit` to support contextual messaging.
