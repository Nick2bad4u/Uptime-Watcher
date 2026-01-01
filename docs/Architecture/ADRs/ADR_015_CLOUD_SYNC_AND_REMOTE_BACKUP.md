---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-015: Cloud Sync and Remote Backup Providers"
summary: "Defines an opt-in cloud sync + remote backup architecture using provider-backed storage (Dropbox/Google Drive/WebDAV), secure auth, and validated payloads."
created: "2025-12-12"
last_reviewed: "2025-12-14"
category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "sync"
 - "backup"
 - "cloud"
 - "oauth"
 - "security"
---

# ADR-015: Cloud Sync and Remote Backup Providers

## Table of Contents

1. [Status](#status)
2. [Context](#context)
3. [Decision drivers](#decision-drivers)
4. [Decision](#decision)
5. [Detailed design](#detailed-design)
6. [Security & privacy](#security--privacy)
7. [Consequences](#consequences)
8. [Implementation plan](#implementation-plan)
9. [Testing & Validation](#testing--validation)
10. [Future enhancements (non-blocking)](#future-enhancements-non-blocking)
11. [Related ADRs](#related-adrs)
12. [Review](#review)

## Status

Accepted (implemented — complete)

> **Implementation status (as of 2025-12-14)**
>
> - ✅ Provider-backed object store abstraction implemented via
>   `electron/services/cloud/providers/CloudStorageProvider.types.ts`.
> - ✅ Dropbox provider implemented (OAuth PKCE + token refresh + account label)
>   under `electron/services/cloud/providers/dropbox/`.
> - ✅ Google Drive provider implemented (OAuth PKCE + token refresh + hidden
>   `appDataFolder` storage) under
>   `electron/services/cloud/providers/googleDrive/`.
> - ✅ Filesystem provider implemented (sandboxed under `uptime-watcher/`)
>   under `electron/services/cloud/providers/FilesystemCloudStorageProvider.ts`.
> - ✅ Cloud orchestration implemented in
>   `electron/services/cloud/CloudService.ts` (connect/disconnect, backups,
>   sync-now).
> - ✅ True sync engine implemented in `electron/services/sync/SyncEngine.ts`
>   (see ADR-016).
> - ✅ Background polling implemented via
>   `electron/services/cloud/CloudSyncScheduler.ts` (jitter + backoff).
> - ✅ Dropbox retry/backoff for transient failures / 429 implemented via
>   `withDropboxRetry`.
> - ✅ Optional client-side encryption implemented (default **off**) via a
>   passphrase-derived key (scrypt) and AES-256-GCM.
> - ✅ Backup migration tool implemented (encrypt existing plaintext backups,
>   optionally delete originals).
> - ✅ Remote sync reset maintenance tool implemented with a preflight preview
>   (counts remote `sync/` objects and shows known devices before allowing
>   reset).

## Context

Users want **true multi-device sync** (not just local backups) and optional cloud backups for recovery.

Constraints:

- Uptime Watcher is an **offline-first desktop app**. We prefer **no always-on Uptime Watcher server**.
- Electron security: OAuth must use **system browser** (no embedded auth webviews) and secrets must be stored securely.
- SQLite is local. **Syncing raw SQLite files is not safe** as a continuous sync mechanism (risk of corruption and impossible merges).

We already have local backup/restore semantics (ADR-013). This ADR adds **opt-in remote storage** and **sync**.

Key clarification:

- **Remote backup** is a _recovery_ feature.
- **True sync** is a _collaboration across devices_ feature.

They share a provider/transport, but have different correctness requirements.

## Decision drivers

1. **Offline-first**: the app must remain fully usable without internet.
2. **No always-on Uptime Watcher server** (at least for V1): prefer provider-backed storage.
3. **Security**: OAuth via system browser, no secrets in renderer, tokens stored in OS keychain.
4. **Consistency**: minimize duplicated codepaths; keep validation at service boundaries.
5. **Recoverability**: a user must be able to restore state even if sync is broken.
6. **Determinism**: multi-device merges must converge (see ADR-016).

## Decision

### 1) Two distinct capabilities

We will treat remote functionality as two related but distinct product capabilities:

1. **Remote backup**: upload/download a validated backup artifact (ADR-013). This is one-way “copy to cloud” with restore.
2. **True sync**: synchronize _domain state_ (sites/monitors/settings) across devices using a mergeable model.

Remote backup is optional and can exist without sync. True sync requires ADR-016.

### 2) Provider abstraction

We implement a provider abstraction owned by the Electron main process.

In code this is split into:

- `CloudService` (orchestration / config / secrets)
  - `connectDropbox()`
  - `configureFilesystemProvider()`
  - `disconnect()`
  - `getStatus()`
  - `requestSyncNow()`
  - backup operations (`listBackups`, `uploadLatestBackup`, `restoreBackup`)
- `CloudStorageProvider` (pure object store + backup helpers)
  - `listObjects(prefix)`
  - `downloadObject(key)`
  - `uploadObject({ key, buffer, overwrite })`
  - `deleteObject(key)`
  - `listBackups()` / `uploadBackup()` / `downloadBackup()`

Initial target providers:

- **Dropbox** (MVP)
- **Google Drive** (MVP parity)
- **WebDAV** (power-user follow-up)

### 3) Storage layout (provider folder convention)

All remote data is stored under a single app folder prefix, for example:

- `uptime-watcher/`
  - `manifest.json`
  - `sync/` (see ADR-016)
  - `backups/` (validated local backup artifacts)
  - `diagnostics/` (optional user-uploaded bundles; see ADR-020)

The prefix is **not** configurable in V1 to avoid support fragmentation.

### 4) Job ownership (main process)

All network operations are owned by Electron main:

- OAuth connect/disconnect
- Upload/download
- Sync polling and compaction jobs
- Rate limiting and retry/backoff

Renderer interacts via request/response IPC only.

### 5) OAuth + credential storage

- OAuth is performed via the **system browser**.
- Access/refresh tokens are persisted via an internal `SecretStore`
  implementation backed by Electron `safeStorage`.
  - Tokens are encrypted at rest using OS-provided encryption.
  - Tokens are never exposed to the renderer.

### 6) Privacy + encryption

- Remote backup and sync are **opt-in** and require explicit user consent.

Client-side encryption is supported as an **opt-in mode**.

Default behavior:

- Sync artifacts and backups are stored **unencrypted** (plaintext).

Optional passphrase mode:

- A user may enable **passphrase-derived encryption**.
- A per-user random salt is stored in `manifest.json` and used with `scrypt` to
  derive a 32-byte key.
- The derived key is stored locally via `SecretStore` (Electron `safeStorage`)
  to avoid prompting users every app start.
- Sync artifacts and backups are encrypted with **AES-256-GCM**.
  - Sync artifacts keep their existing filenames (`.json`, `.ndjson`) and are
    encrypted via a content header format.
  - Backups use a `.sqlite.enc` filename and `CloudBackupEntry.encrypted: true`.

Notes:

- Encryption is **per-provider folder**, not per-device.
- Enabling encryption does not retroactively re-encrypt historical backups.

### 7) Maintenance operations

Two explicit maintenance operations exist to help users transition between
plaintext/encrypted storage and to clean up older artifacts.

#### 7.1 Backup migration (plaintext → encrypted)

- Operation: `cloud-migrate-backups`
- Behavior:
  - Downloads each plaintext backup.
  - Encrypts it with AES-256-GCM (passphrase-derived key).
  - Uploads a new `.sqlite.enc` object and corresponding metadata.
  - Optionally deletes the original plaintext backup + metadata only after a
    successful upload.

This is user-initiated and does not run automatically.

#### 7.2 Remote sync reset + re-seed (advanced)

- Preflight/preview: `cloud-preview-reset-remote-sync`
  - Counts remote objects under `sync/`.
  - Shows known device IDs from the remote manifest.
  - Shows per-device operation-log object breakdown (based on op key timestamps)
    and flags mismatches between manifest devices and ops-derived devices.
- Operation: `cloud-reset-remote-sync`
  - Performs best-effort deletion of existing `sync/` objects.
  - Writes `manifest.resetAt` and re-seeds remote state from the current device.

The sync engine ignores any operation-log objects whose embedded
`createdAtEpochMs` is older than `manifest.resetAt`, preventing older plaintext
ops from resurfacing even if remote deletions are incomplete.

### 7) Retry, backoff, and rate limiting

- Dropbox network operations are wrapped in a retry/backoff policy that:
  - retries 429/5xx/network failures
  - respects `Retry-After` when present
  - uses capped exponential backoff with jitter

Chunked/resumable uploads are a follow-up (not required for the current SQLite
backup sizes).

### 8) Renderer integration

Renderer must not call provider SDKs directly.

- All cloud operations are invoked via request/response IPC (ADR-005).
- Payloads are validated using shared Zod schemas (ADR-009).

## Detailed design

### Remote object types

Remote storage is treated as a simple object store.

Required objects:

- `manifest.json`
  - global pointers: sync schema version, latest snapshot key(s), last known
    compaction, and provider metadata
- `sync/`
  - per-device append-only logs and compacted snapshots (see ADR-016)
- `backups/`
  - portable, validated SQLite backup artifacts (ADR-013)

Optional objects:

- `diagnostics/`
  - user-initiated support bundles (ADR-020)

### Key naming conventions

All keys are ASCII and stable.

Current implemented layout:

- `uptime-watcher/manifest.json`
- `uptime-watcher/backups/uptime-watcher-backup-{createdAtEpochMs}.sqlite`
- `uptime-watcher/backups/uptime-watcher-backup-{createdAtEpochMs}.sqlite.enc`
- `uptime-watcher/sync/devices/{deviceId}/ops/{createdAtEpochMs}-{firstOpId}-{lastOpId}.ndjson`
- `uptime-watcher/sync/snapshots/{syncSchemaVersion}/{timestampEpochMs}.json`

Notes:

- Sync ops are per-device to reduce write conflicts.
- Date bucketing is reserved for a follow-up.

### Optimistic concurrency

Where supported (e.g., ETag / revision IDs):

- uploads include an expected revision
- conflicts return a specific error that triggers a re-fetch

Where not supported:

- fall back to compare-by-hash for immutable keys
- avoid overwriting mutable keys except `manifest.json`

### IPC surface (implemented)

All IPC endpoints are request/response style and validated.

Implemented channels (see `shared/types/ipc.ts` for the canonical map):

- `cloud-get-status`
- `cloud-connect-dropbox`
- `cloud-configure-filesystem-provider`
- `cloud-disconnect`
- `cloud-enable-sync`
- `cloud-request-sync-now`
- `cloud-list-backups`
- `cloud-upload-latest-backup`
- `cloud-restore-backup`
- `cloud-set-encryption-passphrase`
- `cloud-clear-encryption-key`
- `cloud-migrate-backups`
- `cloud-preview-reset-remote-sync`
- `cloud-reset-remote-sync`

Note: The MVP does not rely on event-driven cloud status notifications; the
renderer explicitly re-queries status/backups after user-initiated actions.

## Security & privacy

### Threat model (V1)

We assume:

- Provider account compromise is possible.
- Network traffic can be observed.
- A malicious local process may attempt to read app files.

Mitigations:

- OAuth via system browser (avoid embedded credential phishing).
- Tokens stored in OS credential store only.
- Optional client-side encryption for all remote artifacts.
- Redaction of any logs containing provider identifiers or URLs.

### Data classification

- Site URLs and monitor configuration are treated as **sensitive**.
- Backups and sync artifacts must be encrypted by default once the encryption
  pipeline is available.

## Consequences

### Positive

- Enables multi-device sync without requiring an Uptime Watcher server.
- Backups become portable and restorable on any device.
- Security posture remains strong (no embedded OAuth, secrets in keychain).

### Negative

- True sync is a large feature (data model, merge rules, migrations).
- Provider APIs vary; must build robust retry + conflict detection.
- Users will expect conflict resolution and predictable results.

### Neutral

- Some user data may be considered sensitive even if not strictly PII (site URLs). We must treat it as sensitive.

## Implementation plan

Phase 0 (internal scaffolding):

- Introduce a provider-neutral `CloudStorageProvider` interface.
- Implement a `FilesystemProvider` for local end-to-end integration tests.
- Define shared IPC contracts and Zod schemas.

Phase 1 (remote backup MVP):

- Implement Dropbox provider.
- Implement “upload backup” and “list backups” UI.

Phase 2 (sync transport):

- Implement sync logs + snapshots transport primitives (ADR-016).
- Add sync status UI + manual “sync now”.

Phase 3 (hardening + usability):

- Robust retries/resume for large files.
- Conflict UI and diagnostics.
- Google Drive / WebDAV follow-ups.

High-level modules (names indicative, not final):

- `electron/services/cloud/`
  - `CloudService` (orchestrates providers + jobs)
  - `providers/DropboxProvider`
  - `providers/GoogleDriveProvider`
  - `providers/WebDavProvider`
  - `secrets/CredentialStore`
  - `crypto/CloudCrypto` (encrypt/decrypt)
- `shared/types/cloud/` (provider-neutral request/response contracts)
- `shared/validation/cloud/` (Zod schemas)
- `src/services/CloudService.ts` (renderer facade)
- `src/stores/settings/` additions for sync config and status

UI surface:

- Settings → “Cloud Sync & Backup”
  - Connect provider
  - Enable sync (ADR-016)
  - Enable scheduled backups
  - Show last sync/backups + errors

## Testing & Validation

- Unit tests for:
  - credential storage adapters
  - encryption/decryption
  - provider request signing and retry policies
- Integration tests using a fake provider (in-memory or filesystem-based).
- End-to-end tests:
  - connect/disconnect
  - upload backup then restore

## Future enhancements (non-blocking)

1. Enforce encryption by default once the encryption UX is mature.
2. Support multiple provider connections (multiple accounts) in a future version.
3. Add conflict surfacing UI for high-risk last-write-wins collisions.

## Related ADRs

- [ADR-005: IPC Communication Protocol](./ADR_005_IPC_COMMUNICATION_PROTOCOL.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)
- [ADR-013: Data Portability & Backup/Restore](./ADR_013_DATA_PORTABILITY_AND_BACKUP.md)
- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)
- [ADR-016: Multi-Device Sync Data Model](./ADR_016_MULTI_DEVICE_SYNC_MODEL.md)
- [ADR-020: Support Diagnostics Bundle](./ADR_020_SUPPORT_DIAGNOSTICS_BUNDLE.md)

## Review

- Next review: 2026-03-01 or before shipping first cloud provider.
