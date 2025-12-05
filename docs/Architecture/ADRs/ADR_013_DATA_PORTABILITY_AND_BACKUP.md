---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-013: Data Portability & Backup/Restore"
summary: "Documents export/import/backup guarantees, formats, integrity checks, and retention expectations for local SQLite backups."
created: "2025-12-04"
last_reviewed: "2025-12-04"
category: "guide"
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

Draft

## Context

Users need reliable export/import and local backup/restore with clear integrity guarantees. Backups must be versioned and validated to prevent data loss or silent corruption.

## Decision

- **Formats**: SQLite DB backup plus optional JSON export for portability; include version metadata and checksum.
- **Integrity**: Generate checksums for backup payloads; validate before restore; reject mismatched versions unless explicit migrate path exists.
- **Retention**: Default retention guidance (e.g., keep last N backups) and user-controlled location; do not auto-upload off-device.
- **Messaging**: Surface errors with actionable remediation; emit `database:backup-created` and diagnostics events for observability.
- **Compatibility**: Define minimum/target schema versions; migrations must be idempotent and recorded.

## Consequences

- Safer restores with checksum validation and version checks.
- Clear user messaging reduces data-loss risk.
- Requires migration hooks and schema version tracking.

## Implementation

- Embed `schemaVersion`, `appVersion`, `createdAt`, `checksum` in backup metadata.
- Provide `download-sqlite-backup` and `import-data` flows with validation and progress events.
- On restore, run validation before overwriting existing DB; take pre-restore snapshot when feasible.
- Document manual recovery steps for corrupted backups.

## Testing & Validation

- Integration tests for backup/restore with checksum validation and version mismatch handling.
- Property tests for export/import round-trips on representative datasets.
- Error-path tests for corrupted payloads and insufficient permissions.

## Related ADRs

- ADR-002 (Event-driven architecture) for backup events
- ADR-005 (IPC protocol) for backup/import channels
- ADR-014 (Logging/diagnostics) for telemetry and redaction during backup flows

## Review

- Next review: 2026-03-01 or with next schema migration.
