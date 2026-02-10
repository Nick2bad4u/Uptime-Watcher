---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR implementation punch list"
summary: "A living checklist of remaining work explicitly called out by the project ADRs (Proposed ADRs + accepted ADR follow-ups)."
created: "2025-12-16"
last_reviewed: "2025-12-17"
doc_category: "guide"
author: "Uptime Watcher Team"
tags:
 - "architecture"
 - "adr"
 - "planning"
 - "roadmap"
 - "cloud"
 - "sync"
 - "diagnostics"
 - "maintenance"
 - "integrations"
---

# ADR implementation punch list

This document is a **consolidated checklist** of work that is still outstanding
according to the Architecture Decision Records (ADRs).

It intentionally focuses only on:

- ADRs marked **Proposed** (not implemented yet), and
- ADRs marked **Accepted** but containing explicit **follow-ups** / **non-blocking future enhancements**.

## How to use this

- Treat each bullet as a backlog item.
- When an item is implemented, update the relevant ADR **and** remove (or mark
  as completed) the item here.
- If an item changes scope, update the ADR first (source of truth).

## Proposed ADRs (not implemented yet)

### ADR-017: External Alert Integrations (Webhooks)

Source: [`ADR_017_EXTERNAL_ALERT_INTEGRATIONS.md`](../Architecture/ADRs/ADR_017_EXTERNAL_ALERT_INTEGRATIONS.md)

- Implement outbound-only integration service(s) under `electron/services/integrations/`:
  - `WebhookIntegrationService`
  - provider adapters (Slack webhook, Discord webhook, generic webhook)
- Store webhook URLs/tokens in the OS credential store (no plaintext settings).
- Add shared contracts and validation:
  - `shared/types/integrations/`
  - `shared/validation/integrations/`
- Add IPC endpoints:
  - configure integrations
  - test integration
  - list integration status
- Add UI:
  - Settings → Integrations
  - create integration, test button, last delivery status
- Add tests:
  - payload shaping + redaction
  - throttling/ordering behavior (reuse ADR-012 semantics)
  - integration tests with a local HTTP server mock

### ADR-018: Maintenance Windows and Scheduled Silencing

Source: [`ADR_018_MAINTENANCE_WINDOWS_AND_SILENCING.md`](../Architecture/ADRs/ADR_018_MAINTENANCE_WINDOWS_AND_SILENCING.md)

- Add a shared `MaintenanceWindow` contract + Zod validation in `shared/types/settings`.
- Scheduler integration:
  - Evaluate windows on each scheduler loop (ADR-011 alignment)
  - Support “silence alerts” vs “pause monitoring checks” modes
  - Ensure backoff does not grow while paused
- Notification integration:
  - Suppress notifications during silence windows (ADR-012 alignment)
- Emit events when entering/exiting windows:
  - `maintenance:entered`
  - `maintenance:exited`
- Add UI:
  - Settings → Maintenance
  - CRUD windows + “active now” indicators
- Add tests:
  - DST boundaries + recurrence correctness
  - pause-monitoring stops jobs
  - silence-alerts blocks notifications but does not stop checks

### ADR-019: Templates and Bulk Operations

Source: [`ADR_019_TEMPLATES_AND_BULK_OPERATIONS.md`](../Architecture/ADRs/ADR_019_TEMPLATES_AND_BULK_OPERATIONS.md)

- Define versioned template format (JSON) + shared Zod validation.
- Implement preview-first import flow (diff/preview must be shown before apply).
- Implement service-boundary execution (renderer calls service; main validates).
- Add UI surface (Settings or Sites area) for template export/import + preview.
- Add tests:
  - snapshot tests for diff/preview rendering
  - property tests for safe round-trips where practical

### ADR-020: Support Diagnostics Bundle Export

Source: [`ADR_020_SUPPORT_DIAGNOSTICS_BUNDLE.md`](../Architecture/ADRs/ADR_020_SUPPORT_DIAGNOSTICS_BUNDLE.md)

- Implement `electron/services/diagnostics/DiagnosticsBundleService` to produce a `.zip` bundle.
- Create a machine-readable `manifest.json` inside the bundle.
- Add shared contracts + validation:
  - `shared/types/diagnostics/`
  - `shared/validation/diagnostics/`
- Add IPC endpoint to generate the bundle and return bytes/metadata.
- Add UI:
  - Settings → Diagnostics → “Export diagnostics bundle”
  - confirmation dialog describing contents and privacy
- Add tests:
  - redaction correctness
  - explicit checks that secrets (OAuth tokens, webhook URLs) are never included

## Accepted ADRs with explicit follow-ups / future work

### ADR-015: Cloud Sync and Remote Backup Providers

Source: [`ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md`](../Architecture/ADRs/ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md)

- Provider roadmap:
  - Implement **WebDAV** provider (currently “follow-up”).
- Storage + performance:
  - Add chunked/resumable uploads (explicit follow-up).
  - Consider date bucketing for sync ops key layout (explicit follow-up).
- UX + correctness:
  - Add explicit conflict surfacing UI (explicit future enhancement).
  - Consider enforcing encryption by default once encryption UX is mature (explicit future enhancement).
  - Consider multi-provider / multiple-account support later (explicit future enhancement; see ADR-021).

### ADR-021: Cloud Provider Selection and Settings UI

Source: [`ADR_021_CLOUD_PROVIDER_SELECTION_AND_SETTINGS_UI.md`](../Architecture/ADRs/ADR_021_CLOUD_PROVIDER_SELECTION_AND_SETTINGS_UI.md)

- Implement **WebDAV** tab/provider (currently shown as “coming soon”).
- Multi-provider future (explicitly non-blocking):
  - Namespacing (separate remote roots per provider)
  - Per-provider status display
  - Select a single “sync authority” provider
  - Allow additional providers for backups-only
  - Add explicit provider-to-provider migration tooling

### ADR-024: Cloud Provider Switching and Migration Policy

Source: [`ADR_024_CLOUD_PROVIDER_SWITCHING_AND_MIGRATION_POLICY.md`](../Architecture/ADRs/ADR_024_CLOUD_PROVIDER_SWITCHING_AND_MIGRATION_POLICY.md)

- Provider-to-provider migration is explicitly **not provided by default**.
  - If user demand warrants it, implement a migration wizard/tooling layer.

### ADR-032: Support and Diagnostics Data Policy

Source: [`ADR_032_SUPPORT_AND_DIAGNOSTICS_DATA_POLICY.md`](../Architecture/ADRs/ADR_032_SUPPORT_AND_DIAGNOSTICS_DATA_POLICY.md)

- Implement the user-initiated diagnostics bundle tooling described in ADR-020
  while conforming to the data boundary rules in ADR-032:
  - explicit user acknowledgement for sensitive-but-useful data (e.g. site URLs)
  - explicit “exclude site URLs” option
  - never include secrets (OAuth tokens, PKCE verifier, webhook URLs)
- Maintain and test a layered redaction strategy:
  - structured redaction for known fields (headers, token fields)
  - pattern-based redaction for common token shapes
  - add regression tests using representative payload samples

## Policy guardrails (recommended test backstops)

These are not “feature work”, but they are **high-leverage** guardrails to keep
the accepted ADR policies enforceable over time.

### ADR-029: Backup Format, Encryption, and Compatibility Policy

Source: [`ADR_029_BACKUP_FORMAT_ENCRYPTION_AND_COMPATIBILITY_POLICY.md`](../Architecture/ADRs/ADR_029_BACKUP_FORMAT_ENCRYPTION_AND_COMPATIBILITY_POLICY.md)

- Add CI-level tests that enforce the invariants the ADR requires:
  - encrypted backup payloads must include a versioned envelope/header
  - decrypt/restore must fail closed when an encryption version is unknown
  - migration expectations are explicit whenever the encryption format evolves

## Notes

- This checklist is intentionally conservative: if an ADR does **not** call an item
  out explicitly as future work, it is not listed here.
- If you want a broader roadmap (including non-ADR work), use the repo-level
  task backlog file in the project root.
