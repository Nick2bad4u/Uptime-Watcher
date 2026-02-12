---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-020: Support Diagnostics Bundle Export"
summary: "Defines a privacy-preserving diagnostics bundle export (logs + sanitized config + optional snapshots) for support and troubleshooting workflows."
created: "2025-12-12"
last_reviewed: "2026-02-12"
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

The manifest is required so support can:

- identify the bundle version
- understand which optional data was included
- verify redaction was applied
- verify file integrity (checksums)

### 2) Bundle contents (default)

- Application version and platform info
- Sanitized settings snapshot
- Recent logs (rotated, bounded)
- Recent sync status if ADR-015/016 is enabled

Optional (explicit user opt-in):

- a current SQLite backup artifact (ADR-013)

### 3) Redaction

Redaction is mandatory and must run **before** writing any file into the
bundle.

Policy source of truth:

- ADR-032 defines the allowed/excluded data boundary for support artifacts.

Hard exclusions (must never be present):

- OAuth access/refresh tokens
- authorization codes
- PKCE `code_verifier`
- encryption passphrases
- raw cookies

Redaction strategy (layered):

1. **Structured redaction** for known secret-bearing keys/fields
   (for example, `Authorization`, `refresh_token`, `client_secret`).
2. **Pattern-based redaction** for common token shapes embedded in strings.

Implementation must reuse the same redaction posture used by logs and
user-facing errors (ADR-014), including URL sanitization helpers.

### 4) UI flow

- Settings → Diagnostics → “Export diagnostics bundle”
- Confirm dialog describing contents and privacy.

The UI must include:

- an explicit statement that the bundle is user-generated and not uploaded
  automatically
- an option to exclude sensitive-but-useful fields (for example, site URLs)
  per ADR-032

### 5) Encryption and transmission security

Current stance:

- Diagnostics bundles are generated locally.
- The app does not upload bundles automatically.

Encryption:

- The exported `.zip` is **not encrypted by default**.
- If we add in-app encryption, it must be explicit user opt-in and use modern
  authenticated encryption (AES-256-GCM).
- Encryption keys/passphrases must never be stored in plaintext and must never
  be embedded in the bundle.

Transmission:

- If we add an “upload to support” flow in the future, it must be explicit
  user opt-in.
- Upload must use HTTPS with standard TLS validation.
- Do not embed long-lived credentials or URLs inside the bundle.

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

### Bundle manifest requirements

`manifest.json` must be versioned and validated.

Required fields (indicative):

- `manifestVersion: "1"`
- `generatedAtEpochMs: number`
- `app: { version: string; platform: string; arch: string }`
- `options: { includeSqliteBackup: boolean; includeSiteUrls: boolean; includeFullLogs: boolean }`
- `files: Array<{ path: string; kind: string; bytes: number; sha256: string }>`
- `redaction: { applied: true; rulesVersion: string; summary: { replacements: number }; notes: string[] }`

The `files[].sha256` value is the checksum of the file content **as written
into the bundle** (post-redaction).

### Automatic redaction rules

Redaction must be applied consistently across file types:

- JSON-ish payloads (settings snapshots, diagnostics JSON): apply structured
  redaction by normalizing records (denylist keys) and sanitizing nested
  values.
- Text logs: apply string redaction and URL sanitization before writing.

The bundle generator must also exclude known secret stores entirely:

- never include Electron main secret store contents
- never include OAuth token caches

### Settings snapshot rules

Settings snapshots included in the bundle must:

- omit `cloud.*` keys (provider/sync state and secret-bearing settings)
- redact any remaining secret-like keys defensively

### SQLite backup inclusion

If the user opts in to include a SQLite backup:

- warn that it may contain monitored URLs
- include integrity metadata (schema version + checksum)
- do not attempt automatic data minimization inside the database file

## Testing & Validation

- Unit tests for bundle manifest and redaction.
- Integration tests that ensure secrets are excluded.

Add regression tests for representative secrets:

- OAuth token fields
- `Authorization: Bearer ...`
- secret query params (`access_token=...`, `refresh_token=...`)
- cookie-like headers

## Related ADRs

- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)
- [ADR-013: Data Portability & Backup/Restore](./ADR_013_DATA_PORTABILITY_AND_BACKUP.md)
- [ADR-015: Cloud Sync and Remote Backup Providers](./ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md)
- [ADR-032: Support and Diagnostics Data Policy](./ADR_032_SUPPORT_AND_DIAGNOSTICS_DATA_POLICY.md)
- [ADR-023: Secret Storage and Encryption Policy](./ADR_023_SECRET_STORAGE_AND_ENCRYPTION_POLICY.md)

## Review

- Next review: 2026-03-01 or before first public support workflow.
