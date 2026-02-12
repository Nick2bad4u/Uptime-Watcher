---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-011: Scheduler and Backoff Strategy"
summary: "Defines monitor scheduling cadence, jitter/backoff, timeout defaults, and integration of manual checks with the scheduler."
created: "2025-12-04"
last_reviewed: "2026-02-11"
doc_category: "guide"
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
>   `electron/services/monitoring/MonitorScheduler.ts`. It owns per-monitor
>   jobs, jittered intervals, timeouts, and exponential backoff with capping.
> - `MonitorManager` delegates scheduling and emits
>   `monitor:schedule-updated`, `monitor:backoff-applied`,
>   `monitor:manual-check-started`, and `monitor:timeout` in line with this ADR.
> - Scheduler state is reconstructed deterministically on startup from the
>   current monitor configuration. **Backoff attempts and next-run timestamps
>   are not persisted**, so backoff resets after app restart.
> - Persisting scheduler state across restarts (at minimum `backoffAttempt` and
>   a next-run timestamp) is a planned enhancement tracked under this ADR.

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
- **Backoff**: Per-monitor exponential backoff with max cap; reset on success; per-monitor backoff state to avoid cross-talk.
- **Timeouts**: Per-check timeouts propagated to monitor execution via an `AbortSignal`, with a small buffer to allow cleanup.
- **Manual checks**: If the monitor is idle, run immediately and reset backoff. If the monitor is already running, queue exactly one manual run to execute immediately after the in-flight check settles (no forced cancellation of the in-flight check).
- **Queue ownership**: A single main-process scheduler owns the per-monitor timers and emits typed lifecycle events (correlation IDs and timestamps) for diagnostics.
- **Resource constraints**: The scheduler does not currently enforce a global concurrency limit. Some monitor implementations apply their own shaping (for example, the shared HTTP rate limiter) to prevent resource exhaustion.

### Parameters (current implementation)

| Parameter              | Value                 | Notes                                                                            |
| ---------------------- | --------------------- | -------------------------------------------------------------------------------- |
| Minimum check interval | 5s                    | `MIN_CHECK_INTERVAL` clamp                                                       |
| Jitter                 | ±10%                  | Applied to the computed target interval                                          |
| Backoff multiplier     | `2 ** backoffAttempt` | Attempt increments on failure/timeout                                            |
| Backoff cap            | 60m                   | `MAX_BACKOFF_DELAY_MS`, but never clamps below the base interval                 |
| Timeout default        | 30s + 5s buffer       | Defaults come from shared timeout utilities; per-monitor overrides are supported |

## Consequences

- Consistent jitter/backoff reduces coordinated spikes and limits retries on persistent failures.
- Manual checks remain responsive while keeping schedule coherence.
- Timeout propagation reduces hung monitor executions.
- Scheduler state must be persisted or reconstructed on restart to avoid burst runs after downtime.

## Implementation

### Scheduler state model

The `MonitorScheduler` maintains one in-memory job per active monitor, keyed by:

- `${siteIdentifier}|${monitorId}`

Each job tracks (non-exhaustive):

- `baseIntervalMs` (validated + clamped)
- `timeoutMs` (resolved via shared timeout utilities)
- `backoffAttempt`
- `isRunning` and `needsReschedule` (overlap protection)
- `correlationId` (rotated per scheduled run)
- `pendingManualCheckCorrelationId` (at most one queued manual run)
- `timer` (a `setTimeout` handle; `unref()` is used so timers do not keep the process alive)

### Delay computation (base interval + backoff + jitter)

For a job with base interval `B` and attempt `n`:

1. Compute target interval: `target = B * 2 ** n`.
2. Cap target interval: `cap = max(B, MAX_BACKOFF_DELAY_MS)` and `target = min(target, cap)`.
3. Apply jitter: add a random offset in `[-round(target*0.1), +round(target*0.1)]`.
4. Clamp: `delayMs = max(MIN_CHECK_INTERVAL, jitteredTarget)`.

### Timeouts and cancellation

Monitor execution is wrapped in a `Promise.race` between:

- The monitor check callback.
- A timeout promise that aborts an `AbortController` after `timeoutMs`.

If the timeout wins, `MonitorScheduler` emits `monitor:timeout` and increments
backoff. The in-flight check is expected to honor the `AbortSignal` (best
effort); the scheduler avoids starting an overlapping run for that same monitor.

### Manual checks

Manual checks are handled as an override on top of the schedule:

- If the job is idle, the scheduler clears the timer, resets backoff, emits
  `monitor:manual-check-started`, and runs the job immediately.
- If the job is already running, the scheduler clears any pending timer and
  records exactly one `pendingManualCheckCorrelationId`. When the current run
  settles, the queued manual check runs immediately.

### Persistence across restarts (planned)

The current implementation rebuilds in-memory schedules from monitor
configuration on startup.

If we add persistence, we will persist **only the minimum state needed** to
avoid post-restart floods and to preserve user expectations:

- `backoffAttempt`
- a computed `nextRunAt` timestamp (or `lastAttemptAt` + algorithm version)

Persistence must include a staleness window (for example, if the app was closed
for hours, we should not resume a long backoff attempt blindly).

## Testing & Validation

- Unit/integration coverage exists under `electron/test/services/monitoring/`.
- Scheduler-specific suites include:
  - `MonitorScheduler.test.ts`
  - `MonitorScheduler.comprehensive.test.ts`
  - `MonitorScheduler.backoff-regression.test.ts` (cap semantics)

Tests typically stub `node:crypto.randomInt` to make jitter deterministic and
use fake timers to validate scheduling without wall-clock waits.

## Related ADRs

- ADR-005 (IPC protocol) for scheduler control commands
- ADR-008 (Monitor registry) for monitor-type-specific defaults
- ADR-010 (Testing strategy) for coverage expectations

## Review

- Next review: 2026-03-01 or alongside major scheduler changes.
