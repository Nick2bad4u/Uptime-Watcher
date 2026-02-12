---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-018: Maintenance Windows and Scheduled Silencing"
summary: "Defines scheduled silence/maintenance windows that can pause monitoring checks and/or suppress notifications while preserving correctness and observability."
created: "2025-12-12"
last_reviewed: "2026-02-12"
doc_category: "guide"
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

This must integrate with scheduler/backoff (ADR-011) and notification rules
(ADR-012).

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

Maintenance windows are evaluated in a timezone-aware manner.

#### Supported schedule types

1. **One-time window (absolute instants)**

- Store `startAtMs` and `endAtMs` as UTC epoch milliseconds.
- Optionally store `timeZone` (IANA) for display.

2. **Weekly recurring window (local time in a timezone)**

- Store a `timeZone` (IANA, e.g. `"America/New_York"`).
- Store `daysOfWeek` as an array of ISO weekday numbers (`1..7`).
- Store `startLocal` / `endLocal` as local wall-clock times (`HH:mm`).
- Support "wrap" windows where `endLocal` is earlier than `startLocal`
  (crosses midnight).

#### DST and ambiguous local times

Recurring schedules are converted to instants using the window's `timeZone`.
The conversion must be deterministic.

- If `startLocal` is ambiguous (fall-back overlap), resolve using the earlier
  offset.
- If `endLocal` is ambiguous, resolve using the later offset.
- If a local time does not exist (spring-forward gap), resolve using the
  closest valid instant after the gap.

#### Stored offsets

For diagnostics and auditability, persist the offsets (in minutes) used when a
window instance is materialized:

- `startOffsetMinutes`
- `endOffsetMinutes`

Offsets are derived from timezone rules at evaluation time and must not be used
as a replacement for `timeZone`.

#### Settings contract

Store maintenance windows in settings as a normalized JSON contract validated
by Zod (ADR-009):

- `id: string` (UUID)
- `mode: "silence-alerts" | "pause-monitoring"`
- `scope:`
  - `{ level: "global" }`
  - `{ level: "site", siteIdentifier: string }`
  - `{ level: "monitor", siteIdentifier: string, monitorId: string }`
- `schedule:`
  - `{ kind: "one-time", startAtMs: number, endAtMs: number, timeZone?: string }`
  - `{ kind: "weekly", timeZone: string, daysOfWeek: number[], startLocal: string, endLocal: string }`
- `enabled: boolean`

Validation rules:

- `endAtMs > startAtMs` for one-time windows.
- `daysOfWeek` must be non-empty and contain only `1..7`.
- `timeZone` must be an IANA timezone identifier.
- `startLocal` / `endLocal` must be `HH:mm`.

### 4) State transitions and observability

- Emit events when entering/exiting a window:
  - `maintenance:entered`
  - `maintenance:exited`
- For pause-monitoring windows, scheduler emits a clear reason for suppressed runs.

### 5) Interaction rules

- Manual checks remain allowed (user intent overrides pause), but the result is still subject to “silence alerts” windows.
- Backoff state should not grow while paused (no checks are executed).

#### Overlap and precedence rules

Windows can overlap across scopes (global/site/monitor) and across modes.
Evaluation must yield deterministic effective behaviour.

Terminology:

- A window "matches" a monitor if:
  - it is global, or
  - it targets the monitor's site, or
  - it targets the monitor explicitly.

Effective behaviour for a given monitor at time `now`:

- `isPaused` is true if **any matching active** window has
  `mode = "pause-monitoring"`.
- `isSilenced` is true if **any matching active** window has
  `mode = "silence-alerts"`.

Mode interaction:

- Pausing monitoring prevents scheduled checks from executing.
- Silencing alerts prevents outbound alerts (system notifications, in-app
  alerts, and external integrations).
- Pausing does not imply silencing. Manual checks can still produce alerts
  unless `isSilenced` is true.

Scope interaction:

- Scopes are additive. A monitor-level window does not cancel a site/global
  window.
- If multiple windows match, the effective mode is the boolean OR described
  above.

#### Stored state and telemetry

The main process must emit events when a monitor transitions between effective
states:

- `maintenance:entered` (includes `windowIds`, `isPaused`, `isSilenced`)
- `maintenance:exited`

Events must include `siteIdentifier`, `monitorId`, timestamp, and a
`correlationId` (ADR-014).

## Consequences

### Positive

- Less alert noise and better user trust during planned work.
- Clear semantics between “pause checks” and “silence notifications”.

### Negative

- Timezones/recurrence add complexity.
- UI must communicate current suppression status.

## Implementation

- Add a `MaintenanceWindow` contract in `shared/types/settings`.
- Main process evaluates windows for each scheduler job and computes:
  - current effective state (`isPaused`, `isSilenced`)
  - `nextTransitionAtMs` (the next instant where either boolean can change)

### Scheduler integration (ADR-011)

Integrate maintenance evaluation into the per-monitor job loop:

- Before executing a scheduled check, evaluate `isPaused`.
- If paused:
  - do not execute the check
  - do not increment backoff attempts
  - reschedule the job to `nextTransitionAtMs` (or a bounded recheck interval
    if the next transition cannot be computed)
- When exiting a paused period, run the next scheduled check immediately
  (subject to the monitor's `monitoring` flag) and then resume normal jittered
  scheduling.

The maintenance layer must not mutate monitor status (do not mark monitors
DOWN/UP). Maintenance state is separate telemetry.

### Notification integration (ADR-012)

Before emitting alerts, consult `isSilenced` for the matching scope:

- System notifications (`NotificationService`)
- In-app alerts
- External alert integrations (ADR-017)

UI additions:

- Settings → Maintenance
  - create/edit windows
  - show “active now” indicators

## Testing & Validation

- Unit tests for schedule evaluation (including DST boundaries).
- Integration tests ensuring:
  - pause-monitoring stops jobs
  - silence-alerts prevents notifications but does not stop checks

Add test coverage for:

- overlapping windows across scopes (global + site + monitor)
- wrap windows that cross midnight
- ambiguous local times (fall-back overlap)
- invalid schedules rejected by Zod validation

## Related ADRs

- [ADR-011: Scheduler and Backoff Strategy](./ADR_011_SCHEDULER_AND_BACKOFF.md)
- [ADR-012: Notifications and Alerting Policy](./ADR_012_NOTIFICATIONS_AND_ALERTING.md)
- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)

## Review

- Next review: 2026-03-01 or before shipping recurring schedules.
