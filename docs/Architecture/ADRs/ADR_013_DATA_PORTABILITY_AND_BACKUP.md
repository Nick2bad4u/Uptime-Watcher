---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-013: Data Portability & Backup/Restore"
summary: "Documents export/import/backup guarantees, formats, integrity checks, and retention expectations for local SQLite backups."
created: "2025-12-04"
last_reviewed: "2026-02-12"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "backup"
 - "restore"
 - "data-portability"
 - "sqlite"
---

# ADR-013: Data Portability & Backup/Restore

## Table of Contents

1. [Status](#status)
2. [Context](#context)
3. [Decision](#decision)
4. [Consequences](#consequences)
5. [Implementation](#implementation)
6. [Testing & Validation](#testing--validation)
7. [Related ADRs](#related-adrs)
8. [Review](#review)

## Status

Accepted

## Context

Users need reliable export/import and local backup/restore with clear integrity guarantees. Backups must be versioned and validated to prevent data loss or silent corruption.

## Decision

- **Formats**:
  - **SQLite backup (primary)**: a full database snapshot stored as a `.sqlite` file (plaintext bytes starting with `SQLite format 3\0`).
  - **JSON export/import (secondary)**: a **versioned** portability snapshot (`version: "1.0"`) intended for small-to-medium datasets and cross-app portability.
  - **Encrypted backup artifacts (remote/off-device)**: `.sqlite.enc` files using an authenticated encryption envelope (AES-256-GCM + `UWENC001` magic header; see [Encrypted backup envelope](#encrypted-backup-envelope) and ADR-029).
- **Integrity verification (required)**:
  - **Size verification**: `metadata.sizeBytes` must match the actual byte length.
  - **Checksum verification**: `metadata.checksum` is computed as SHA-256 of the **plaintext SQLite bytes** and must match.
  - **Schema compatibility policy**:
    - Backups whose `schemaVersion` is **newer** than the running application are rejected (fail closed).
    - Older backups are accepted and migrated forward via the normal DB init/migration path.
  - **SQLite structural validation**: the incoming database file must pass `PRAGMA quick_check` before being swapped into place.
- **Encryption at rest (requirements)**:
  - **Local backups** (`.sqlite`) are **plaintext** artifacts. When a user saves/copies them outside the app, they must be stored on an encrypted volume (e.g., BitLocker/FileVault/LUKS) or protected by equivalent OS/enterprise controls.
  - **Any off-device backup** (cloud provider, shared drive, removable media, etc.) is considered higher-risk and must live in a storage system that provides **encryption at rest** (e.g., provider-managed encryption or equivalent enterprise controls). In addition, Uptime Watcher provides optional **client-side encryption** (passphrase-derived key + AES-256-GCM) for remote backups to reduce exposure in provider-compromise scenarios; when remote backup is enabled, we must strongly recommend enabling client-side encryption (ADR-015).
  - Encrypted backups are treated as **untrusted inputs** until decrypted and validated; unknown encryption versions must fail closed.
- **Data export policy (correctness + privacy)**:
  - JSON export is a **logical** snapshot (sites/monitors/history/settings) and is **not** a byte-for-byte DB backup.
  - JSON exports must not include secrets (OAuth tokens, derived encryption keys, refresh tokens, support bundles, etc.).
  - JSON import must be schema-validated (shared Zod schemas) and apply defaults/normalization.
- **No off-device upload by default**: local backup/export operations never upload data anywhere unless the user enables an opt-in provider flow (ADR-015).
- **User messaging**: failures must be actionable and must not leak secrets (URLs/tokens/passphrases are redacted by shared logging utilities).

## Consequences

- Safer restores with checksum validation and version checks.
- Clear user messaging reduces data-loss risk.
- Requires migration hooks and schema version tracking.

## Implementation

### SQLite backup

- Snapshot creation is performed in the main process via `DataBackupService`.
- Backups are created as consistent snapshots using `VACUUM INTO` in a temp directory and then read/validated.
- IPC flows include `download-sqlite-backup` (returns `{ buffer: ArrayBuffer, fileName, metadata }` when within the IPC budget), `save-sqlite-backup` (native save dialog + direct-to-disk write), and `restore-sqlite-backup` (restores an uploaded `ArrayBuffer` after integrity checks).

### Encrypted backup envelope

When client-side encryption is enabled for remote/off-device backups, backup
payloads are stored as a `.sqlite.enc` file.

Envelope format (V1) is:

- Magic: ASCII `UWENC001`
- Version byte: `1`
- IV: 12 bytes
- Auth tag: 16 bytes
- Ciphertext: remaining bytes

Algorithm:

- AES-256-GCM
- Key material is derived from a user passphrase (scrypt) and cached locally in
  the main process secret store (see ADR-015 / ADR-023).

Integrity relationship:

- `metadata.checksum` and `metadata.sizeBytes` refer to the **plaintext** SQLite
  backup bytes.
- Encrypted bytes are validated by AES-GCM authentication during decryption, and
  the resulting plaintext is then validated by checksum + SQLite integrity.

### Restore lifecycle (validated swap)

Restore is intentionally defensive because restore payloads are untrusted inputs:

1. Detect payload format:
   - If the payload begins with `UWENC001`, treat it as an encrypted artifact and
     **decrypt it first** (cloud restore flow handles this in `CloudService`).
   - Otherwise, treat it as a plaintext SQLite payload.
2. Validate the (decrypted) payload header is a SQLite file (`SQLite format 3\0`).
3. Write the SQLite bytes into a temp directory under a sanitized file name.
4. Compute restore metadata by inspecting the file (`PRAGMA user_version`) and computing the SHA-256 checksum.
5. Run `validateDatabaseBackupPayload` (size, checksum, schema policy).
6. Run `PRAGMA quick_check` against the temp file to confirm structural integrity.
7. Create a pre-restore on-disk snapshot (`pre-restore-<timestamp>.sqlite`) under `app.getPath("userData")`.
8. Atomically swap the database file into place via `replaceDatabaseFile` (handles WAL/SHM/journal sidecars and performs rollback on failure).
9. Reinitialize the database connection and apply migrations (normal DB startup path).

### Observability

- Successful restores emit `database:backup-restored` (and the internal command emits `internal:database:backup-restored`).
- Failures emit `database:error` with a redacted, serialized error payload.
- Backup creation is logged with structured fields; no dedicated `database:backup-created` event is emitted today.

## Testing & Validation

- Integration tests cover backup/restore integrity checks (checksum + `PRAGMA quick_check`), IPC budget enforcement, and rollback semantics.
- Property tests cover export/import round-trips for JSON portability snapshots.
- Error-path tests cover corrupted payloads, invalid SQLite headers, and filesystem permission failures.

## Related ADRs

- ADR-002 (Event-driven architecture) for backup events
- ADR-005 (IPC protocol) for backup/import channels
- ADR-014 (Logging/diagnostics) for telemetry and redaction during backup flows
- ADR-015 (Cloud sync and remote backup providers) for opt-in off-device storage

## Review

- Next review: 2026-03-01 or with next schema migration.
