---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-024: Cloud Provider Switching and Migration Policy"
summary: "Defines the policy for switching between cloud providers (Dropbox/Google Drive), including single-provider constraints, remote cleanup expectations, and migration tooling boundaries."
created: "2025-12-15"
last_reviewed: "2026-02-11"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "cloud"
 - "sync"
 - "backups"
 - "dropbox"
 - "google-drive"
 - "migration"
---

# ADR-024: Cloud Provider Switching and Migration Policy

## Status

✅ Accepted (policy defined; tooling will expand over time)

## Context

Uptime Watcher supports cloud providers for:

- Cloud Sync (multi-device state merge)
- Remote Backups (upload/restore SQLite backups)

Providers differ in APIs and reliability characteristics, but from the user’s perspective they occupy the same role: “the remote.”

Uncontrolled multi-provider operation introduces ambiguous correctness and UX:

- Which remote is authoritative?
- Should the app upload everything twice?
- How are conflicts presented?

## Decision drivers

1. **Correctness**: sync semantics must remain deterministic.
2. **UX clarity**: users must understand which provider is active.
3. **Operational safety**: avoid silent duplication and data divergence.
4. **Scalability**: keep the UI consistent as providers are added.

## Decision

### 1) Single active provider

Uptime Watcher enforces:

- exactly one configured provider at a time

The Settings UI allows browsing other providers, but disables setup actions when another provider is configured (ADR-021).

### 2) Switching providers is explicit

Switching providers is an explicit user action initiated from Settings.

The app does not automatically “carry” remote state across providers.

Implementation constraint:

- A connect attempt for a new provider must not leave the app in a partially
  switched state.
- The previously configured provider must remain configured if the new connect
  attempt fails.

This is enforced by Electron main:

- capture the previous provider settings + stored tokens
- run the new provider OAuth flow
- verify the new provider connection
- only then commit the provider selection and clear the old provider secrets
- on failure, restore the prior provider configuration

### 3) Remote cleanup is not automatic

When disconnecting, the app may:

- revoke tokens (when supported)

But the app does not automatically delete remote artifacts.

Instead, the UI provides an explicit advanced action:

- **Reset remote sync state** (preview + reset)

This separation avoids accidental data loss.

### 4) Migration tooling boundaries

Current/near-term tooling:

- encryption migration for backups (plaintext ↔ encrypted)
- remote reset tooling for sync artifacts

Not provided by default:

- provider-to-provider remote migration

Recommended manual migration path (current capabilities):

1. Ensure you have a recent local SQLite backup.
2. Connect the new provider.
3. Use sync maintenance tooling (preview + reset) to seed a clean remote sync
   state from the current device when needed.
4. Upload a fresh backup to the newly connected provider.

This path avoids destructive remote deletes and makes failures recoverable.

### Integrity and rollback properties

Provider switching rollback (implemented):

- Dropbox: provider configuration is committed only after OAuth + a
  verification call succeeds. A verification failure restores previous tokens
  and provider settings.
- Google Drive: account label is fetched before persisting configuration; any
  persistence failure restores the previous provider settings and tokens.

Sync reset integrity (implemented):

- Reset tooling is destructive and requires explicit user action.
- Remote deletions are best-effort and conservative: only keys matching the
  sync transport's strict schema are deleted.
- `manifest.resetAt` is advanced so older remote operation objects are ignored
  even if some deletions fail.
- The remote encryption config is preserved.

Backup encryption migration integrity (implemented):

- Migrations refuse to overwrite an already migrated target backup object.
- When `deleteSource` is requested, the source is deleted only after a
  successful upload of the migrated backup.
- Failures are recorded per-object so users can retry.

A provider migration wizard may be introduced later if user demand warrants it.

## Consequences

- **Pro**: deterministic sync model and simple mental model.
- **Pro**: reduces accidental destructive operations.
- **Con**: switching providers is not one-click; users must explicitly decide what to do with remote data.

## Related ADRs

- ADR-015: Cloud Sync and Remote Backup Providers
- ADR-016: Multi-Device Sync Model
- ADR-021: Cloud Provider Selection and Settings UI
- ADR-022: OAuth Loopback Redirect and Callback Routing

## Implementation notes

- Provider switching + rollback:
  - `electron/services/cloud/CloudService.providerOperations.ts`
- Sync reset preview/apply:
  - `electron/services/cloud/migrations/syncResetPreview.ts`
  - `electron/services/cloud/migrations/syncReset.ts`
- Backup encryption migration:
  - `electron/services/cloud/migrations/backupMigration.ts`
