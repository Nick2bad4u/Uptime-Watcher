---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Scheduler Job Template"
summary: "Template for monitor scheduling jobs with jitter/backoff, timeouts, and manual-check pre-emption."
created: "2025-12-04"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "template"
 - "scheduler"
 - "backoff"
 - "monitoring"
 - "timeouts"
---

# Scheduler Job Template

## Table of Contents

1. [Purpose](#purpose)
2. [Job Descriptor](#job-descriptor)
3. [Steps](#steps)
4. [Helpers](#helpers)
5. [Testing Guidance](#testing-guidance)
6. [Checklist](#checklist)

## Purpose

Define a consistent job shape and helper flow for monitor scheduling that aligns with ADR-011 (Scheduler and Backoff Strategy).

## Job Descriptor

```typescript
interface MonitorJob {
 monitorId: string;
 siteIdentifier: string;
 scheduledAt: number;
 deadline: number;
 backoffState: {
  attempt: number;
  nextDelayMs: number;
 };
 correlationId: string;
 priority: "scheduled" | "manual";
}
```

## Steps

1. **Calculate next delay** using jittered base interval and exponential backoff (capped).
2. **Enqueue job** with `priority` and `correlationId`.
3. **Execute** with timeout token; propagate abort to monitor worker.
4. **On success** reset backoff; schedule next run from base interval.
5. **On failure/timeout** apply backoff and reschedule.
6. **Manual checks** pre-empt queued scheduled job for same monitor; cancel in-flight scheduled job if necessary.

## Helpers

- `computeJitteredDelay(baseMs, jitterPct)`
- `computeBackoff({ attempt, baseMs, maxMs, factor })`
- `createTimeoutAbortSignal(deadline)`
- `reconcileNextRun({ lastOutcome, baseInterval, backoffState })`

## Testing Guidance

- Property tests for delay within bounds (jitter/backoff).
- Integration tests for manual-check pre-emption and next-run reconciliation.
- Timeout tests to confirm cancellation reaches monitor workers and emits events.

## Checklist

- [ ] Job shape matches ADR-011 fields
- [ ] Jitter/backoff helpers unit-tested
- [ ] Timeout/abort propagation verified
- [ ] Manual check pre-emption handled
- [ ] Events emitted for schedule/backoff/timeout
