---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-020: Support Diagnostics Bundle Export"
summary: "Defines a privacy-preserving diagnostics bundle export (logs + sanitized config + optional snapshots) for support and troubleshooting workflows."
created: "2025-12-12"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "diagnostics"
  - "support"
  - "privacy"
  - "export"
---
# ADR-020: Support Diagnostics Bundle Export

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

Proposed

## Context

Support and debugging improve dramatically when users can export a consistent diagnostics bundle.

Constraints:

- The bundle must be privacy-preserving (ADR-014).
- It must not accidentally include secrets (tokens, webhook URLs, etc.).
- It must be easy to generate and share.

## Decision

### 1) Bundle format

- Produce a single `.zip` file.
- Include a machine-readable `manifest.json`.

### 2) Bundle contents (default)

- Application version and platform info
- Sanitized settings snapshot
- Recent logs (rotated, bounded)
- Recent sync status if ADR-015/016 is enabled

Optional (explicit user opt-in):

- a current SQLite backup artifact (ADR-013)

### 3) Redaction

- Apply the existing redaction rules from ADR-014.
- Never include OAuth tokens or webhook URLs.

### 4) UI flow

- Settings → Diagnostics → “Export diagnostics bundle”
- Confirm dialog describing contents and privacy.

## Consequences

### Positive

- Higher-quality bug reports.
- Faster troubleshooting.

### Negative

- Must maintain strict redaction guarantees.

## Implementation

- `electron/services/diagnostics/DiagnosticsBundleService`
- `shared/types/diagnostics/` + `shared/validation/diagnostics/`
- IPC endpoint to generate bundle and return bytes/metadata for download.

## Testing & Validation

- Unit tests for bundle manifest and redaction.
- Integration tests that ensure secrets are excluded.

## Related ADRs

- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)
- [ADR-013: Data Portability & Backup/Restore](./ADR_013_DATA_PORTABILITY_AND_BACKUP.md)
- [ADR-015: Cloud Sync and Remote Backup Providers](./ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md)

## Review

- Next review: 2026-03-01 or before first public support workflow.
