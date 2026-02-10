---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-029: Backup Format, Encryption, and Compatibility Policy"
summary: "Defines the on-disk and cloud backup artifact format expectations, how encryption is versioned, and what compatibility guarantees the app provides across versions."
created: "2025-12-15"
last_reviewed: "2025-12-16"
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
- The restore process replaces or rebuilds the application state from that database.

### 2) Metadata format (local and remote)

Backup metadata must include, at minimum:

- creation timestamp
- size
- whether the payload is encrypted

Remote backups may store metadata as provider-native metadata or as a sidecar representation.

### 3) Encryption format versioning

Encrypted backup payloads must be versioned.

Policy:

- encrypted payloads must include a versioned header or envelope structure
- decrypt/restore must fail closed if the encryption version is unknown
- new encryption versions must include a migration path or an explicit support policy

This avoids “silent corruption” where bytes are interpreted with the wrong format.

### 4) Compatibility guarantees

The application guarantees:

- **Forward compatibility** within a support window:
  - New app versions must be able to restore backups created by older versions.
- **Best-effort backward restore** is not guaranteed:
  - Older app versions may not restore backups created by newer versions.

When schema changes occur, they must be paired with:

- explicit migration logic (ADR-028)
- update/restore validation tests where practical

### 5) Remote backup migration boundaries

The app provides migration tooling for remote backups:

- plaintext ↔ encrypted

The app does not provide automatic provider-to-provider migration.

If provider-to-provider migration is introduced, it must be documented explicitly in ADR-024.

## Implementation notes

- Cloud backup listing entries include encryption indicators and metadata:
  - `shared/types/cloud.ts`
- Backup migration tooling:
  - see cloud store and main-process cloud service

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
