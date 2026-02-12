---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-017: External Alert Integrations (Webhooks)"
summary: "Adds opt-in outbound alert delivery via providers like Slack/Discord webhooks while preserving privacy, validation, and throttling guarantees."
created: "2025-12-12"
last_reviewed: "2026-02-12"
doc_category: "guide"
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
- Store them via the Electron main-process secret storage abstraction
  (ADR-023) so they are not written in plaintext to disk.
- Secrets are never returned over IPC to the renderer once stored.

### 3) Payload minimization + redaction

- Default payload includes:
  - site display name (or identifier)
  - monitor type
  - status transition
  - timestamp
  - optional response time
- URLs are omitted by default; users may opt-in to include them.

Safe logging requirements:

- Do not log webhook URLs, request headers, or request bodies.
- If we need to log a destination for diagnostics, log only a derived label
  (for example, hostname + integrationId) and treat it as sensitive.
- When the user opts in to include site URLs in payloads, only include the
  sanitized form used for logging (see ADR-014 URL safety utilities).

### 4) Delivery guarantees

- Best-effort delivery with retry + backoff.
- Never block monitoring or UI responsiveness on webhook delivery.
- Failures surface in Diagnostics UI and a dedicated “Integrations” settings panel.

### 5) Throttling and ordering

- Reuse the same suppression windows / ordering semantics as ADR-012.
- Add an additional per-integration rate limiter to avoid remote abuse.

External delivery must be gated by the same policy decisions as system
notifications:

- per-site mute
- per-monitor down cooldown
- restore gating (UP requires prior DOWN when configured)

If/when we add maintenance windows (ADR-018), "silence alerts" must suppress
external integrations as well.

## Consequences

### Positive

- Routes alerts to external systems without requiring a hosted service.
- Consistent behavior with local notifications.

### Negative

- Increased security footprint (secrets + outbound traffic).
- Delivery is best-effort and can fail due to network conditions or provider
  throttling.

## Implementation

### Main-process services

Integrations must integrate with the existing main-process notification policy
engine (ADR-012).

Current architecture:

- Monitor status transitions emit typed events (`monitor:down`, `monitor:up`).
- `electron/services/application/ApplicationService.ts` forwards these events
  and invokes `electron/services/notifications/NotificationService.ts`, which
  enforces suppression and ordering.

Proposed integration approach:

- Extract the ADR-012 suppression/ordering gate from `NotificationService`
  into a reusable policy component (pure logic + in-memory state keyed by
  `${siteIdentifier}|${monitorId}`).
- Invoke webhook delivery only after the policy gate allows the transition.
- Webhook delivery runs asynchronously and must not block `NotificationService`.

Suggested module layout:

- `electron/services/notifications/integrations/`
  - `WebhookIntegrationService` (queue + retry + rate limiting)
  - `SlackWebhookAdapter`
  - `DiscordWebhookAdapter`
  - `GenericWebhookAdapter`

### Secrets storage

- Reuse the `SecretStore` abstraction described in ADR-023
  (`electron/services/cloud/secrets/SecretStore.ts`) or move it to a shared
  main-process secrets package if/when integrations need it outside cloud.
- Store webhook URLs/tokens in main-process secrets storage.
- Store non-secret integration metadata (name, enabled flag, rate-limit
  settings, payload options) in normal settings.

### IPC surface

IPC endpoints must be request/response style with Zod-validated payloads
(ADR-009), and must not leak secrets:

- configure integration metadata (create/update/delete)
- set/rotate integration secret (webhook URL/token)
- test integration (main process executes a test delivery)
- list integration status (last success/error timestamp + sanitized error)

Renderer APIs must not receive webhook URLs back from main.

### Future OAuth-based integrations

If we add OAuth-backed providers (not webhooks), they must follow the same
constraints as cloud providers:

- use PKCE loopback redirect where possible
- request minimal scopes
- store refresh tokens via `SecretStore`
- never expose tokens over IPC to the renderer

UI:

- Settings → Integrations
  - add integration
  - test button
  - last delivery status

## Testing & Validation

- Unit tests for payload shaping and redaction.
- Integration tests with a local HTTP server mock.
- Property tests for throttling and ordering (leveraging ADR-012 suites).

Add test coverage for:

- "no secrets in logs" (webhook URL and request body never logged)
- suppression/ordering parity with `NotificationService`
- retry + backoff behavior on 429/5xx

## Related ADRs

- [ADR-012: Notifications and Alerting Policy](./ADR_012_NOTIFICATIONS_AND_ALERTING.md)
- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)
- [ADR-011: Scheduler and Backoff Strategy](./ADR_011_SCHEDULER_AND_BACKOFF.md)
- [ADR-023: Secret Storage and Encryption Policy](./ADR_023_SECRET_STORAGE_AND_ENCRYPTION_POLICY.md)

## Review

- Next review: 2026-03-01 or before adding non-webhook providers.
