---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-014: Logging, Telemetry, and Diagnostics"
summary: "Standardizes log levels/fields, correlation IDs, diagnostics IPC flows, and privacy/redaction bounds."
created: "2025-12-04"
last_reviewed: "2025-12-04"
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

Draft

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

- Introduce shared log fields helper; enforce correlationId generation per request/event.
- Add diagnostics schema for preload guard reports; reuse Zod validation and limit payload size.
- Emit `diagnostics:report-created` events for observability; guard against recursive logging loops.
- Document log rotation defaults and user override knobs.

## Testing & Validation

- Unit tests for logging helpers ensuring required fields present and PII-stripping of URLs/tokens.
- Integration tests for diagnostics IPC validating schema enforcement and oversize rejection.
- Property tests for redaction to ensure secrets are consistently removed.

## Related ADRs

- ADR-005 (IPC protocol) for diagnostics channels
- ADR-011 (Scheduler) for correlation/logging of scheduled jobs
- ADR-013 (Backup) for logging/redaction in export/import flows

## Review

- Next review: 2026-03-01 or with major logging/diagnostics changes.
