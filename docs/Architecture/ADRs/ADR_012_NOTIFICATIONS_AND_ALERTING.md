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

> **Implementation Status**
>
> - Global notification preferences (enable/disable, sound) are persisted in
>   the `AppSettings` store and synchronized with the main process via
>   `NotificationPreferenceService` and `update-notification-preferences` IPC.
> - Per-site system notification mute is implemented through the
>   `mutedSiteNotificationIdentifiers` setting (configured from the Site
>   Settings tab) and enforced by `NotificationService`.
> - Per-monitor throttling and ordering are implemented in
>   `NotificationService` using `lastStatus`, `lastNotifiedAt`, and
>   `suppressionUntil`.
> - A `notification:sent` event is emitted on the main event bus whenever a
>   system notification is dispatched, with correlationId and timestamp for
>   diagnostics.
> - Deeper coupling with scheduler backoff signals (for richer flapping
>   semantics) is still a future enhancement under this ADR.

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

### Renderer settings surface (AppSettings)

Notification-related preferences are part of the `AppSettings` interface in
`src/stores/types.ts` and are persisted via `useSettingsStore`:

- `inAppAlertsEnabled`: enable/disable in-app status alerts rendered inside the
  UI shell.
- `inAppAlertsSoundEnabled`: toggle the audible chime for in-app alerts.
- `inAppAlertVolume`: volume multiplier for in-app alert tones, clamped between
  `0` and `1`.
- `systemNotificationsEnabled`: enable operating-system notifications for
  status changes.
- `systemNotificationsSoundEnabled`: allow OS notifications to play sounds
  when supported.
- `mutedSiteNotificationIdentifiers`: identifiers of sites for which **system
  notifications** (desktop) are muted. In-app alerts continue to be controlled
  by the in-app flags above.

These settings are the single source of truth for user-facing notification
preferences in the renderer and are synchronized with the main process via IPC
channels defined in `@shared/types/ipc` and validated by
`@shared/validation/notifications`.

### Main-process configuration surface (NotificationConfig)

The Electron main process aggregates notification preferences into
`NotificationConfig` in
`electron/services/notifications/NotificationService.ts`:

- `enabled`: master switch controlling whether system notifications are
  emitted.
- `playSound`: whether system notifications are allowed to play sounds.
- `showDownAlerts` / `showUpAlerts`: switches for outage and restore
  notifications respectively.
- `downAlertCooldownMs`: per-monitor cooldown window used to throttle repeated
  "down" alerts.
- `restoreRequiresOutage`: whether a "restore" notification is only emitted
  if a prior outage was observed.
- `mutedSiteNotificationIdentifiers?: readonly string[]`: optional list of
  site identifiers for which system notifications are suppressed.

`NotificationService.updateConfig()` is the canonical entry point for applying
preference changes. Internally, it materializes
`mutedSiteNotificationIdentifiers` into a `Set<string>` for fast lookup when
evaluating whether a given site is muted.

### IPC propagation and validation

Renderer → main preference updates are expressed using the
`NotificationPreferenceUpdate` contract in `@shared/types/notifications` and
validated via `notificationPreferenceUpdateSchema` in
`@shared/validation/notifications`.

`electron/services/ipc/handlers/notificationHandlers.ts` wires the
`update-notification-preferences` IPC channel by:

1. Validating the incoming payload with `parseNotificationPreferenceUpdate`.
2. Normalizing to the `NotificationConfig` shape expected by
   `NotificationService.updateConfig()` (enabled, playSound, muted sites).
3. Registering the handler through `registerStandardizedIpcHandler` so it
   participates in the standard IPC validation, logging, and lifecycle
   tracking.

### Per-monitor throttling and event emission

- Per-monitor state: `lastStatus`, `lastNotifiedAt`, `suppressionUntil`.
- Debounce `monitor:down` bursts; immediate pass-through for first transition,
  suppress duplicates within window.
- Emit `notification:sent` with correlationId for diagnostics; log suppression
  events.
- Integrate with scheduler backoff to avoid duplicate alerts during delayed
  retries.
- Align with the typed `UptimeEvents` contract and main-process event
  validation for notification-related diagnostics events.

## Testing & Validation

- Unit tests for suppression windows and ordering (outage then restore).
- Integration tests for per-monitor preferences and sound enablement.
- Property tests for flapping scenarios ensuring bounded notification volume.
  - Electron tests: `electron/test/services/notifications/NotificationService.test.ts` cover
    per-site mute suppression and `notification:sent` diagnostics emission.
  - Renderer tests: `src/test/components/Alerts/alertCoordinator.test.ts` and
    `src/test/services/NotificationPreferenceService.comprehensive.test.ts`
    validate preference synchronization and preload bridge wiring.

## Related ADRs

- ADR-008 (Monitor registry) for monitor-type metadata
- ADR-011 (Scheduler/backoff) for retry cadence and alert suppression alignment
- ADR-014 (Logging/diagnostics) for correlation/logging rules

## Review

- Next review: 2026-03-01 or alongside notification pipeline changes.
