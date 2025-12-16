---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-011: Scheduler and Backoff Strategy"
summary: "Defines monitor scheduling cadence, jitter/backoff, timeout defaults, and integration of manual checks with the scheduler."
created: "2025-12-04"
last_reviewed: "2025-12-15"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "scheduler"
  - "backoff"
  - "monitoring"
  - "timeouts"
---

# ADR-011: Scheduler and Backoff Strategy

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

✅ Accepted

> **Implementation status**
>
> - The centralized scheduler is implemented via `MonitorScheduler` in
>   `electron/services/monitoring/MonitorScheduler.ts`, which owns
>   per-monitor jobs, jittered intervals, and exponential backoff with
>   capping.
> - `MonitorManager` delegates scheduling and emits
>   `monitor:schedule-updated`, `monitor:backoff-applied`,
>   `monitor:manual-check-started`, and `monitor:timeout` in line with this ADR.
> - Scheduler state is reconstructed deterministically on startup from the
>   current monitor configuration rather than being persisted, which satisfies
>   the "persist or rebuild" constraint for now.
> - Future refinements (for example, persisting next-run state across
>   restarts) remain open and will be tracked under this ADR.

## Context

Monitor execution needs predictable cadence with resilience to flapping or slow endpoints. Manual checks must coexist with scheduled runs without starving the queue or duplicating work. Timeouts and jitter/backoff must be consistent across monitor types and respect user-configured intervals.

### Why jitter/backoff when users set intervals?

- **Thundering herd avoidance**: Identical user intervals align and spike network/CPU. Jitter staggers start times.
- **Flapping mitigation**: Backoff tempers rapid retries on down hosts, preventing self-induced DOS.
- **Timeout recovery**: Stuck checks can overlap the next scheduled tick; backoff plus timeout-aware cancellation prevents piling on.
- **Manual check coexistence**: Manual/preemptive checks should not immediately re-trigger scheduled runs; backoff reconciles next-run after overrides.
- **Resource fairness**: Spreading load protects the main process and ensures other monitors still run during incident storms.

## Decision

- **Scheduling model**: Fixed-base interval per monitor with configurable jitter to prevent thundering herds.
- **Backoff**: Exponential with max cap; reset on success; per-monitor backoff state to avoid cross-talk.
- **Timeouts**: Per-check defaults (overridable per monitor type) propagated to worker execution and cancellation tokens.
- **Manual checks**: High-priority jobs supersede in-flight scheduled jobs for the same monitor; reconcile next-run-at based on outcome and backoff state.
- **Queue ownership**: Single main-process scheduler with typed job descriptors (correlationId, timestamps) for logging/diagnostics.
- **Parameters**: ±10% jitter; backoff factor 2.0; backoff cap 5 minutes; default timeout = monitor timeout + buffer (35s by default); minimum interval enforced (5s).

## Consequences

- Consistent jitter/backoff reduces coordinated spikes and limits retries on persistent failures.
- Manual checks remain responsive while keeping schedule coherence.
- Timeout propagation reduces hung monitor executions.
- Scheduler state must be persisted or reconstructed on restart to avoid burst runs after downtime.

## Implementation

- Job shape: `monitorId`, `siteIdentifier`, `scheduledAt`, `deadline`, `backoffState`, `correlationId`, `priority`.
- Helpers: jittered interval calculation; exponential backoff with ceiling; timeout/abort token creation; reconciliation for manual overrides.
- Events: emit `monitor:schedule-updated`, `monitor:backoff-applied`, `monitor:timeout`, `monitor:manual-check-started` for observability and AI alignment.
- Persistence: persist next-run/backoff state or rebuild deterministically on startup to avoid floods.

## Testing & Validation

- Property tests for jitter/backoff bounds and monotonic backoff increments.
- Integration tests for manual-check pre-emption and next-run reconciliation.
- Timeout tests to confirm cancellation propagates to monitor workers and event emission.

## Related ADRs

- ADR-005 (IPC protocol) for scheduler control commands
- ADR-008 (Monitor registry) for monitor-type-specific defaults
- ADR-010 (Testing strategy) for coverage expectations

## Review

- Next review: 2026-03-01 or alongside major scheduler changes.
