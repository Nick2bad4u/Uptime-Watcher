---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-014: Logging, Telemetry, and Diagnostics"
summary: "Standardizes log levels/fields, correlation IDs, diagnostics IPC flows, and privacy/redaction bounds."
created: "2025-12-04"
last_reviewed: "2025-12-11"
category: "guide"
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

- **Log Levels**: electron-log with standardized levels; default `info` in production, `debug` in dev; `error` reserved for actionable faults.
- **Structured Fields**: correlationId, channel/event, siteIdentifier/monitorId (when applicable), timestamp, severity, and optional context; no raw PII.
- **Diagnostics IPC**: Handlers like `diagnostics-report-preload-guard` must validate input, redact PII, and return typed results; deny oversized payloads.
- **Retention**: Bounded log size/rotation; diagnostics artifacts stored locally and optionally user-exported; no auto-upload.
- **Privacy/Redaction**: Strip URLs/auth tokens; hash identifiers when exported; provide user consent prompt for sharing diagnostics.

## Consequences

- More reliable troubleshooting with correlated events across renderer/main.
- Reduced privacy risk via redaction and bounded retention.
- Slight overhead to enforce validation and structured logging.

## Implementation

- Implemented shared logging-context helpers (`withLogContext`, structured severity, automatic correlation IDs, hashed identifiers, passive redaction of URLs/bearer tokens) consumed by both Electron and renderer loggers.
- Introduced an IPC correlation envelope automatically appended to every typed preload invocation (`createTypedInvoker` internally uses `ipcRenderer.invoke`). `registerStandardizedIpcHandler` extracts the ID, injects it into logs/metadata, and echoes it back to the renderer.
- Hardened diagnostics IPC handlers with payload byte limits (metadata/payload preview), automatic redaction, structured logging contexts, and a dedicated `diagnostics:report-created` event emitted through the typed event bus.
- Added rotation defaults (5 MB per file) plus dev/prod log levels, now documented in `README`/guides alongside guidance for overriding via CLI flags.
- Renderer/Electron tests cover the helper, sanitization behavior, payload truncation, and event emissions to prevent regressions.

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
