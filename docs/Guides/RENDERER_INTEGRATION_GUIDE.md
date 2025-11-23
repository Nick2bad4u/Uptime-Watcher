---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Renderer Integration Guide"
summary: "Renderer integration guidelines for Uptime Watcher 17.4.0+, focusing on IPC channels, events, and manual check flows."
created: "2025-10-26"
last_reviewed: "2025-11-17"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "renderer"
  - "ipc"
  - "integration"
  - "events"
---

# Renderer Integration Guide

## Table of Contents

1. [1. Executive Summary](#1-executive-summary)
2. [2. Canonical IPC & Event Channels](#2-canonical-ipc--event-channels)
3. [3. Manual Check Flow Enhancements](#3-manual-check-flow-enhancements)
4. [4. History Limit Synchronization](#4-history-limit-synchronization)
5. [5. Migration Checklist](#5-migration-checklist)
6. [6. Tooling & Automation](#6-tooling--automation)
7. [7. Appendix: Reference Implementations](#7-appendix-reference-implementations)

## 1. Executive Summary

Uptime Watcher now exposes a fully normalized renderer event contract that keeps manual monitor checks and history retention settings in lockstep with the backend. Integrators must:

1. Adopt the canonical, verb-first invoke channels (e.g. `get-history-limit`) and documented event names.
2. Listen for `monitor:check-completed` to reconcile manual checks, while also applying optimistic updates from the resolved `MonitoringService.checkSiteNow` payload.
3. Handle the `settings:history-limit-updated` broadcast to keep retention settings and UI affordances aligned across imports, migrations, and CLI tooling.
4. Enforce contract drift detection in CI via `npm run check:ipc`.

Skipping these steps results in stale settings panels, missing toast notifications, and documentation drift that will now fail CI.

---

## 2. Canonical IPC & Event Channels

| Concern                | Invoke Channel(s)                                                           | Renderer Event(s)                             | Notes                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Settings retention     | `get-history-limit`, `update-history-limit`, `reset-settings`               | `settings:history-limit-updated`              | `update-history-limit` returns the canonical limit value; broadcast includes `previousLimit` for analytics.             |
| Manual checks          | `check-site-now` _(renderer abstraction: `MonitoringService.checkSiteNow`)_ | `monitor:check-completed`                     | Event payload delivers enriched snapshots (site + monitor) so the renderer can reconcile history graphs and audit logs. |
| Diagnostics & Metadata | `diagnostics-verify-ipc-handler`, `diagnostics-report-preload-guard`        | `cache:invalidated`, `state-sync-event`, etc. | No renames since 17.4.0, but keep generated inventory authoritative.                                                    |

> 🔗 Authoritative reference: `docs/Architecture/generated/IPC_CHANNEL_INVENTORY.md` (auto-generated; do **not** edit manually).

### Channel Normalization Checklist

- ✅ Replace older `domain:action` invoke strings (e.g. `settings:updateHistoryLimit`) with hyphenated, verb-first channels.
- ✅ Update preload wrappers to forward the normalized channel names.
- ✅ Regenerate bridge/doc artifacts after schema changes: `npm run generate:ipc`.
- ✅ Run `npm run check:ipc` in CI/PR validation.

---

## 3. Manual Check Flow Enhancements

### 3.1 Optimistic Renderer Updates

`MonitoringService.checkSiteNow(siteIdentifier, monitorId)` now resolves with an enriched `StatusUpdate` when the backend completes the check synchronously. The renderer must:

1. **Apply the optimistic snapshot** immediately via `applyStatusUpdateSnapshot` (already wired in `createSiteMonitoringActions`).
2. **Log telemetry** using `logStoreAction("SitesStore", "checkSiteNow", …)` to preserve parity with event-driven updates.
3. **Avoid duplicate mutations** when the `monitor:status-changed`/`monitor:check-completed` events arrive. The shared reducer is idempotent, so double-application is safe.

### 3.2 Event Reconciliation

- `monitor:check-completed` always emits after the manual check finishes.
- Payload shape: `{ checkType: "manual" | "scheduled", monitorId, siteIdentifier, result: StatusUpdate, timestamp }`.
- When the payload lacks `site` or `monitor` snapshots, the orchestrator hydrates them from caches before emission. Renderer logic should trust this payload as authoritative.

### 3.3 Testing Guidance

| Test Suite     | Command                                                                    | Purpose                                                      |
| -------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Renderer store | `vitest run src/test/stores/sites/useSiteMonitoring.comprehensive.test.ts` | Validates optimistic update path.                            |
| Orchestrator   | `vitest run electron/test/UptimeOrchestrator.test.ts -t "manual-check"`    | Ensures rebroadcast carries enriched payload.                |
| E2E            | `npm run test:playwright`                                                  | Confirms UI feedback is instant during manual health checks. |

---

## 4. History Limit Synchronization

### 4.1 Event Payload Contract

```ts
interface HistoryLimitUpdatedEventData {
 limit: number;
 previousLimit?: number;
 operation: "history-limit-updated";
 timestamp: number;
}
```

- The orchestrator tracks `previousLimit` internally to surface meaningful diffs.
- Renderer stores guard against redundant writes: if the incoming `limit` matches the existing value, the callback no-ops.
- Documentation and telemetry should reference the renderer channel `settings:history-limit-updated` (not the internal `internal:database:history-limit-updated`).

### 4.2 Renderer Integration Steps

1. **Subscribe once**: `await EventsService.onHistoryLimitUpdated(callback);` is invoked during `SettingsStore.initializeSettings` and guarded against duplicate subscriptions.
2. **Persist fallback**: On initialization failures, default settings are still applied; the subscription is retried.
3. **Update derived UI**: Refresh retention-related toggles, tooltips, and charts in the callback to avoid stale views.
4. **Document behavior**: Surface the dual-source nature (UI vs. imports) in release notes and admin guides to set expectations.

### 4.3 Validation Playbook

- Run `vitest run electron/test/UptimeOrchestrator.test.ts -t "history limit"` to confirm event forwarding.
- Execute `vitest run src/test/stores/settings/useSettingsStore.comprehensive.test.ts -t "history limit"` to ensure the store updates correctly.
- Confirm Storybook stories (e.g. `Settings.stories.tsx`) respond to mocked broadcasts by launching `npm run storybook` with `setMockHistoryLimit` helpers.

---

## 5. Migration Checklist

| Task                                                            | Status | Notes                                                                   |
| --------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Normalize all invoke channels and preload bridges               | ✅      | Run `npm run generate:ipc` after refactors.                             |
| Update renderer services (`EventsService`, `MonitoringService`) | ✅      | Ensure new listeners return cleanup functions.                          |
| Wire optimistic manual-check handling into stores               | ✅      | Verify `createSiteMonitoringActions` is in use.                         |
| Handle `settings:history-limit-updated` in all settings views   | ✅      | Remember to invalidate cached retention copy in Redux/Zustand wrappers. |
| Add CI drift detection (`npm run check:ipc`)                    | ✅      | Integrate into lint/test workflows.                                     |
| Update product docs & release notes                             | ✅      | Reference this guide and the changelog entry.                           |

Mark each item off during integration reviews. Pull requests must demonstrate automation via CI logs and include targeted tests when modifying IPC contracts.

---

## 6. Tooling & Automation

- **Drift detection**: `npm run check:ipc` compares generated artifacts with the canonical schema. Required in CI. See the [IPC Automation Workflow](./IPC_AUTOMATION_WORKFLOW.md) guide for full instructions.
- **Artifact regeneration**: `npm run generate:ipc` refreshes `shared/types/eventsBridge.ts` and `docs/Architecture/generated/IPC_CHANNEL_INVENTORY.md` (documented in [IPC Automation Workflow](./IPC_AUTOMATION_WORKFLOW.md)).
- **Benchmarks**: When tweaking event payloads, run `npm run bench:tsnode` to ensure typed event bus throughput remains acceptable.

---

## 7. Appendix: Reference Implementations

| Component               | File                                                  | Responsibility                                                                               |
| ----------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Orchestrator forwarding | `electron/UptimeOrchestrator.ts`                      | Rebroadcasts `monitor:check-completed` and `settings:history-limit-updated` with enrichment. |
| Application bridge      | `electron/services/application/ApplicationService.ts` | Pipes orchestrator output to `RendererEventBridge`.                                          |
| Preload guard           | `electron/preload/domains/eventsApi.ts`               | Validates renderer payloads and reports guard failures.                                      |
| Renderer subscription   | `src/services/EventsService.ts`                       | Provides typed listener helpers with automatic initialization.                               |
| Settings store          | `src/stores/settings/operations.ts`                   | Applies history-limit updates and handles subscription lifecycle.                            |
| Sites monitoring store  | `src/stores/sites/useSiteMonitoring.ts`               | Applies optimistic manual-check snapshots.                                                   |

Consult these modules when extending or troubleshooting integrations.

---

Need help? Drop issues or questions in `#uptime-watcher-dev` with links to failing CI runs (`check:ipc`) or include manual-check telemetry samples for faster triage.
