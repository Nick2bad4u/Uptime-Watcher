---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-029: Backup Format, Encryption, and Compatibility Policy"
summary: "Defines the on-disk and cloud backup artifact format expectations, how encryption is versioned, and what compatibility guarantees the app provides across versions."
created: "2025-12-15"
last_reviewed: "2026-02-12"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "database"
 - "sqlite"
 - "backups"
 - "cloud"
 - "encryption"
 - "compatibility"
---

# ADR-029: Backup Format, Encryption, and Compatibility Policy

## Status

✅ Accepted (policy defined; implementation may evolve, compatibility must not regress)

## Context

Uptime Watcher supports:

- local backups (data portability)
- remote backups via a cloud provider (Dropbox today; others planned)

Backups must remain usable over time, even as:

- the SQLite schema evolves
- cloud providers are added
- encryption capabilities evolve

The app already supports:

- an optional passphrase-based encryption mode for cloud sync artifacts and remote backups
- migration tooling between plaintext and encrypted remote backups

This ADR documents the required compatibility guarantees.

## Decision drivers

1. **Data safety**: backups must be restorable.
2. **Predictability**: users should understand what is encrypted and what is not.
3. **Forward evolution**: encryption format changes must be versioned.
4. **Operational support**: support requests need a clear “what should work” statement.

## Decision

### 1) Backup payload format

A backup payload represents the full SQLite database.

Policy:

- Backups are treated as opaque binary blobs at rest.
- The restore process replaces the live database file with the provided SQLite
  file after validation.

Implementation:

- Export creates a byte-for-byte copy of the SQLite file via
  `electron/services/database/utils/backup/databaseBackup.ts`.
- Restore uses `DataBackupService.restoreDatabaseBackup()` and validates
  untrusted backups before swapping the file.

### 2) Metadata format (local and remote)

Backup metadata is represented by `DatabaseBackupMetadata`:

- `electron/services/database/utils/backup/databaseBackup.ts`

Fields:

- `appVersion`
- `checksum` (SHA-256 hex)
- `createdAt` (epoch ms)
- `originalPath`
- `retentionHintDays`
- `schemaVersion`
- `sizeBytes`

Policy:

- Metadata is **advisory**.
- On restore/apply, the app computes critical values from the actual SQLite file
  (not from user-controlled metadata) before enforcing compatibility.

Remote backups store metadata as a JSON sidecar file next to the binary object.

Implementation:

- The remote listing shape is `CloudBackupEntry`:
  - `shared/types/cloud.ts`
- The sidecar file format is JSON containing `{ encrypted, fileName, key, metadata }`.
  - `electron/services/cloud/providers/CloudBackupMetadataFile.ts`
- Sidecar object key:
  - `backupMetadataKeyForBackupKey(backupKey)` -> `${backupKey}.metadata.json`

### 3) Encryption format versioning

Encrypted backup payloads must be versioned.

Policy:

- encrypted payloads must include a versioned header or envelope structure
- decrypt/restore must fail closed if the encryption version is unknown
- new encryption versions must include a migration path or an explicit support policy

This avoids “silent corruption” where bytes are interpreted with the wrong format.

Implementation (remote artifacts):

- Encryption envelope: `electron/services/cloud/crypto/cloudCrypto.ts`
- Algorithm: AES-256-GCM
- Envelope layout:
  - Magic header: ASCII `UWENC001`
  - Version byte: `1`
  - IV: 12 bytes
  - Auth tag: 16 bytes
  - Ciphertext: remaining bytes
- Encrypted payload detection: `isEncryptedPayload(buffer)` checks the magic header.

### 4) Compatibility guarantees

The application guarantees:

- **Forward compatibility** within a support window:
  - New app versions must be able to restore backups created by older versions.
- **Best-effort backward restore** is not guaranteed:
  - Older app versions may not restore backups created by newer versions.

When schema changes occur, they must be paired with:

- explicit migration logic (ADR-028)
- update/restore validation tests where practical

Implementation notes:

- Schema compatibility is enforced by comparing backup `schemaVersion` to the
  current `DATABASE_SCHEMA_VERSION`.
  - Backups with a newer schema version are rejected.
  - Older backups are allowed and are upgraded by the normal startup migration
    path after restore.
- Restore also validates SQLite file integrity using `PRAGMA quick_check` before
  swapping the file into place.

### 5) Remote backup migration boundaries

The app provides migration tooling for remote backups:

- plaintext ↔ encrypted

The app does not provide automatic provider-to-provider migration.

If provider-to-provider migration is introduced, it must be documented explicitly in ADR-024.

## Implementation notes

### Local backup validation + restore flow

- Export helper + checksum/schema checks:
  - `electron/services/database/utils/backup/databaseBackup.ts`
- Restore/apply logic (untrusted payload validation, pre-restore snapshot,
  atomic swap):
  - `electron/services/database/DataBackupService.ts`

Restore safety invariants (as implemented):

- The incoming payload must start with the SQLite file header.
- The payload checksum and size must match metadata.
- The incoming SQLite file must pass `PRAGMA quick_check`.
- A pre-restore snapshot is captured and persisted under the userData directory
  before swapping in the new database.

### Remote backup storage + encryption

- Cloud backup entry type and metadata shape:
  - `shared/types/cloud.ts`
- Sidecar metadata file parsing/serialization:
  - `electron/services/cloud/providers/CloudBackupMetadataFile.ts`
- Backup upload/restore orchestration:
  - `electron/services/cloud/CloudService.backupOperations.ts`
- Encryption envelope + passphrase KDF:
  - `electron/services/cloud/crypto/cloudCrypto.ts`
  - Passphrase KDF: `scrypt` with a per-encryption-config salt (`saltBase64`)
  - Remote manifest stores **non-secret** encryption config:
    - `shared/types/cloudEncryption.ts` (`CloudEncryptionConfigPassphrase`)
    - `saltBase64` + `keyCheckBase64` (encrypted sentinel used to validate the
      derived key without uploading the passphrase)

### Remote backup migration

- Migration operation (plaintext ↔ encrypted):
  - `electron/services/cloud/CloudService.backupOperations.ts` (`migrateBackups()`)
  - `electron/services/cloud/migrations/backupMigration.ts`

## Consequences

- **Pro**: compatibility constraints are explicit and testable.
- **Pro**: encryption evolution is versioned, reducing long-term risk.
- **Con**: changing encryption format requires careful migration design.

## Related ADRs

- ADR-013: Data Portability and Backup
- ADR-015: Cloud Sync and Remote Backup Providers
- ADR-023: Secret Storage and Encryption Policy
- ADR-024: Cloud Provider Switching and Migration Policy
- ADR-028: Database Schema Versioning and Migrations
