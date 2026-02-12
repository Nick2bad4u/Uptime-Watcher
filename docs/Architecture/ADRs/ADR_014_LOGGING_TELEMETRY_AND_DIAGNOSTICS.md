---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-014: Logging, Telemetry, and Diagnostics"
summary: "Standardizes log levels/fields, correlation IDs, diagnostics IPC flows, and privacy/redaction bounds."
created: "2025-12-04"
last_reviewed: "2026-02-12"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "logging"
 - "telemetry"
 - "diagnostics"
 - "privacy"
---

# ADR-014: Logging, Telemetry, and Diagnostics

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

We need consistent logging and diagnostics with correlation IDs, structured fields, and privacy safeguards. Diagnostics IPC must validate payloads and avoid leaking sensitive data.

## Decision

- **Local-first policy (GDPR/privacy posture)**:
  - By default, logs/diagnostics stay **on-device**.
  - The app does not automatically upload telemetry, logs, or diagnostics artifacts to any Uptime Watcher-controlled server.
  - Any future “remote telemetry” feature must be **explicitly opt-in**, surfaced in Settings as a dedicated toggle, and documented in the privacy policy.
- **Data minimization (required)**:
  - Log only what is needed to debug correctness/performance.
  - Never log authentication material (OAuth tokens, refresh tokens, API keys, passphrases, derived keys) or full request/response bodies.
  - Treat site URLs, hostnames, and site names as **sensitive** (often user-private even when not strictly PII).
- **Log levels and outputs**: logging is implemented via `electron-log`; defaults are environment-sensitive and can be overridden by CLI flags.
- **Structured observability (required)**:
  - Log entries must support a structured context object with:
    - `correlationId` (per-operation identifier)
    - `severity`
    - `timestamp`
  - Optional, standardized fields: `component`, `operation`, `channel`, `event`, `siteHash`, `monitorHash`, `userAction`.
  - Callers must prefer structured fields over string concatenation.
- **Correlation policy (required)**:
  - `correlationId` is generated per event emission / per IPC invocation and is used to correlate renderer/main activity.
  - `correlationId` must never be used as a stable user identifier and must not be persisted as user data.
  - Cross-process request/response IPC must propagate the correlation envelope so logs can be joined.
- **PII/secrets redaction (required, fail-safe guidance)**:
  - Built-in sanitization is **best-effort**:
    - It masks common auth token patterns in strings.
    - It sanitizes URL-like strings by removing credentials and masking known secret query keys.
  - It is **not** a full GDPR anonymization system and must not be treated as one.
  - Identifier hashing (`siteHash`/`monitorHash`) is intended for **low-risk correlation** inside logs, not anonymization.
    - The current hash is non-cryptographic and unsalted; it reduces accidental exposure but is reversible via brute force for small input spaces.
  - When in doubt, log **hashes** / derived identifiers, not raw site names/URLs.
- **Diagnostics IPC**: diagnostics channels (e.g. `diagnostics-report-preload-guard`) must validate payloads, cap payload sizes/previews, and prevent token leakage.
- **User consent**:
  - Exporting logs/diagnostics (or uploading them to a user-configured provider) requires explicit user action.
  - Export flows must display a warning that exported artifacts may contain sensitive operational details.

## Consequences

- More reliable troubleshooting with correlated events across renderer/main.
- Reduced privacy risk via redaction and bounded retention.
- Slight overhead to enforce validation and structured logging.

## Implementation

- Shared structured context and sanitization lives in `shared/utils/loggingContext.ts` and is consumed by Electron main-process loggers (`electron/utils/logger.ts`), IPC infrastructure (standardized handler execution + diagnostics metrics), and preload diagnostics logging (`electron/preload/utils/preloadLogger.ts`).
- Correlation: the typed event bus generates correlation IDs, and typed IPC invocations attach a correlation envelope that standardized IPC handlers forward into logs.
- Redaction: secret masking covers common bearer/basic/token auth patterns and known secret-bearing query keys. URL sanitization is applied to URL-like strings; callers should prefer higher-safety helpers (e.g. `getSafeUrlForLogging`) when logging monitor targets.
- Diagnostics IPC: preload guard violations are reported over `diagnostics-report-preload-guard` and payload previews are size-capped with sensitive keys redacted.
- Retention: Electron main config sets log rotation (5 MB max file size) and supports CLI overrides (`--debug`, `--log-production`, `--log-info`); logs and diagnostics artifacts are stored locally unless explicitly exported by the user.

## Testing & Validation

- Unit tests validate logging-context helpers (hashing + redaction) and diagnostics report sanitization.
- IPC integration tests (IpcService suite) assert metrics updates and `diagnostics:report-created` emissions.
- Existing fuzz/property suites continue to cover diagnostics IPC input validation.

## Related ADRs

- ADR-005 (IPC protocol) for diagnostics channels
- ADR-011 (Scheduler) for correlation/logging of scheduled jobs
- ADR-013 (Backup) for logging/redaction in export/import flows
- ADR-020 (Support diagnostics bundle) for export packaging and redaction guarantees

## Review

- Next review: 2026-03-01 or with major logging/diagnostics changes.
