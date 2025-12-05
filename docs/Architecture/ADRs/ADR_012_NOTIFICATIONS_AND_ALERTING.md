---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-012: Notifications and Alerting Policy"
summary: "Defines desktop/sound notification rules, throttling, suppression, and reliability expectations for outage/restore signals."
created: "2025-12-04"
last_reviewed: "2025-12-04"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "notifications"
  - "alerting"
  - "throttling"
  - "reliability"
---

# ADR-012: Notifications and Alerting Policy

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

Outage and restore notifications must be reliable, non-noisy, and consistent with user preferences. Sound cues and desktop notifications should be throttled to prevent spamming during flapping incidents while still surfacing critical transitions.

## Decision

- **Channels**: Desktop notification + optional sound cue; both respect global enable/disable and per-site mute.
- **Throttling/Suppression**: Debounce repeat-down events; cool-down window per monitor; coalesce identical status within window.
- **Ordering**: Always emit outage before restore; deduplicate out-of-order restores; mark notifications with correlationId and event timestamp.
- **Content**: Include site name, monitor type, status, last response metrics; keep payload minimal and PII-safe.
- **User Preferences**: Persist notification settings; defaults favor on-device notifications with sounds off.

## Consequences

- Reduced noise during flapping; consistent user experience across platforms.
- Clear sequencing for outage/restore maintains trust in alerts.
- Requires persistent settings and per-monitor throttling state.

## Implementation

- Per-monitor state: `lastStatus`, `lastNotifiedAt`, `suppressionUntil`.
- Debounce `monitor:down` bursts; immediate pass-through for first transition, suppress duplicates within window.
- Emit `notification:sent` with correlationId for diagnostics; log suppression events.
- Integrate with scheduler backoff to avoid duplicate alerts during delayed retries.
- Align with RendererEventPayloadMap and preload validation for notification events.

## Testing & Validation

- Unit tests for suppression windows and ordering (outage then restore).
- Integration tests for per-monitor preferences and sound enablement.
- Property tests for flapping scenarios ensuring bounded notification volume.

## Related ADRs

- ADR-008 (Monitor registry) for monitor-type metadata
- ADR-011 (Scheduler/backoff) for retry cadence and alert suppression alignment
- ADR-014 (Logging/diagnostics) for correlation/logging rules

## Review

- Next review: 2026-03-01 or alongside notification pipeline changes.
