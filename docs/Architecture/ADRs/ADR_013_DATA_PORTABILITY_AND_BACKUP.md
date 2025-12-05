---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-013: Data Portability & Backup/Restore"
summary: "Documents export/import/backup guarantees, formats, integrity checks, and retention expectations for local SQLite backups."
created: "2025-12-04"
last_reviewed: "2025-12-05"
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

Accepted

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

- Embed `schemaVersion`, `appVersion`, `createdAt`, `checksum`, `retentionHintDays`, and `sizeBytes` in every backup metadata payload (propagated through IPC, preload, renderer stores, and UI). Renderer downloads now receive an `ArrayBuffer` plus the serialized metadata so retention guidance and schema version are always visible to the user.
- Provide both `download-sqlite-backup` and `restore-sqlite-backup` flows with validation and progress events. The download handler validates checksum, size, and schema version before transferring to the renderer and exposes metadata for retention guidance.
- The renderer restore button now reads a `.sqlite` file, streams it through the preload bridge, and displays success/error states along with the returned metadata so users can confirm what was restored.
- On restore, run validation before overwriting the existing DB and capture a pre-restore snapshot on disk. **Restore entry points reuse `validateDatabaseBackupPayload` to reject corrupted or mismatched backups and rehydrate schema metadata by inspecting the uploaded file.**
- Document manual recovery steps for corrupted backups and where the pre-restore snapshot is stored.

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
