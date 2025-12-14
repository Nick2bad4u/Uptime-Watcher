---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-017: External Alert Integrations (Webhooks)"
summary: "Adds opt-in outbound alert delivery via providers like Slack/Discord webhooks while preserving privacy, validation, and throttling guarantees."
created: "2025-12-12"
last_reviewed: "2025-12-12"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "notifications"
  - "integrations"
  - "webhooks"
  - "security"
---

# ADR-017: External Alert Integrations (Webhooks)

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

Users want notifications beyond local desktop alerts:

- Slack channel messages
- Discord webhook posts
- Generic webhook integrations

This expands the data-leak surface area: URLs and monitor metadata can be sensitive.

We already have local notification rules and throttling (ADR-012). External delivery must follow the same ordering and suppression rules.

## Decision

### 1) Integrations are outbound-only and opt-in

- No inbound commands from external systems.
- Every integration is explicitly enabled by the user.

### 2) Secrets handling

- Webhook URLs and tokens are secrets.
- Store them in the OS credential store, not in plaintext settings.

### 3) Payload minimization + redaction

- Default payload includes:
  - site display name (or identifier)
  - monitor type
  - status transition
  - timestamp
  - optional response time
- URLs are omitted by default; users may opt-in to include them.

### 4) Delivery guarantees

- Best-effort delivery with retry + backoff.
- Never block monitoring or UI responsiveness on webhook delivery.
- Failures surface in Diagnostics UI and a dedicated “Integrations” settings panel.

### 5) Throttling and ordering

- Reuse the same suppression windows / ordering semantics as ADR-012.
- Add an additional per-integration rate limiter to avoid remote abuse.

## Consequences

### Positive

- Enables professional alert routing without a hosted service.
- Consistent behavior with local notifications.

### Negative

- Increased security footprint (secrets + outbound traffic).
- Some integrations will be flaky without a server; we must manage user expectations.

## Implementation

- `electron/services/integrations/`
  - `WebhookIntegrationService`
  - `SlackWebhookAdapter`
  - `DiscordWebhookAdapter`
- `shared/types/integrations/` and `shared/validation/integrations/`
- IPC endpoints:
  - configure integrations
  - test integration
  - list integration status

UI:

- Settings → Integrations
  - add integration
  - test button
  - last delivery status

## Testing & Validation

- Unit tests for payload shaping and redaction.
- Integration tests with a local HTTP server mock.
- Property tests for throttling and ordering (leveraging ADR-012 suites).

## Related ADRs

- [ADR-012: Notifications and Alerting Policy](./ADR_012_NOTIFICATIONS_AND_ALERTING.md)
- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)
- [ADR-011: Scheduler and Backoff Strategy](./ADR_011_SCHEDULER_AND_BACKOFF.md)

## Review

- Next review: 2026-03-01 or before adding non-webhook providers.
