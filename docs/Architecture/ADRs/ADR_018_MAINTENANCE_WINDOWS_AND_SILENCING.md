---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-018: Maintenance Windows and Scheduled Silencing"
summary: "Defines scheduled silence/maintenance windows that can pause monitoring checks and/or suppress notifications while preserving correctness and observability."
created: "2025-12-12"
last_reviewed: "2025-12-12"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "monitoring"
  - "scheduler"
  - "maintenance"
  - "notifications"
---

# ADR-018: Maintenance Windows and Scheduled Silencing

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

Users need “quiet hours” and planned maintenance handling:

- suppress notifications during planned work
- optionally pause monitoring checks to reduce noise and compute

This must integrate cleanly with scheduler/backoff (ADR-011) and notification rules (ADR-012).

## Decision

### 1) Two window modes

Each maintenance window can be configured as one of:

1. **Silence alerts**: checks continue, but alerts are suppressed.
2. **Pause monitoring**: checks are not scheduled/executed.

Both modes record state for diagnostics.

### 2) Scope levels

Windows can apply to:

- a single monitor
- a site (all monitors)
- globally (all sites)

### 3) Time model

- Use explicit timezone handling.
- Support one-time windows and recurring schedules (weekly patterns).
- Store in settings as a normalized JSON contract validated by Zod.

### 4) State transitions and observability

- Emit events when entering/exiting a window:
  - `maintenance:entered`
  - `maintenance:exited`
- For pause-monitoring windows, scheduler emits a clear reason for suppressed runs.

### 5) Interaction rules

- Manual checks remain allowed (user intent overrides pause), but the result is still subject to “silence alerts” windows.
- Backoff state should not grow while paused (no checks are executed).

## Consequences

### Positive

- Less alert noise and better user trust during planned work.
- Clear semantics between “pause checks” and “silence notifications”.

### Negative

- Timezones/recurrence add complexity.
- UI must communicate current suppression status.

## Implementation

- Add a `MaintenanceWindow` contract in `shared/types/settings`.
- Main process evaluates windows in the scheduler loop.
- Notification pipeline consults the maintenance policy before sending.

UI additions:

- Settings → Maintenance
  - create/edit windows
  - show “active now” indicators

## Testing & Validation

- Unit tests for schedule evaluation (including DST boundaries).
- Integration tests ensuring:
  - pause-monitoring stops jobs
  - silence-alerts prevents notifications but does not stop checks

## Related ADRs

- [ADR-011: Scheduler and Backoff Strategy](./ADR_011_SCHEDULER_AND_BACKOFF.md)
- [ADR-012: Notifications and Alerting Policy](./ADR_012_NOTIFICATIONS_AND_ALERTING.md)
- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)

## Review

- Next review: 2026-03-01 or before shipping recurring schedules.
