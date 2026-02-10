---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-024: Cloud Provider Switching and Migration Policy"
summary: "Defines the policy for switching between cloud providers (Dropbox/Google Drive), including single-provider constraints, remote cleanup expectations, and migration tooling boundaries."
created: "2025-12-15"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "cloud"
 - "sync"
 - "backups"
 - "dropbox"
 - "google-drive"
 - "migration"
---

# ADR-024: Cloud Provider Switching and Migration Policy

## Status

✅ Accepted (policy defined; tooling will expand over time)

## Context

Uptime Watcher supports cloud providers for:

- Cloud Sync (multi-device state merge)
- Remote Backups (upload/restore SQLite backups)

Providers differ in APIs and reliability characteristics, but from the user’s perspective they occupy the same role: “the remote.”

Uncontrolled multi-provider operation introduces ambiguous correctness and UX:

- Which remote is authoritative?
- Should the app upload everything twice?
- How are conflicts presented?

## Decision drivers

1. **Correctness**: sync semantics must remain deterministic.
2. **UX clarity**: users must understand which provider is active.
3. **Operational safety**: avoid silent duplication and data divergence.
4. **Scalability**: keep the UI consistent as providers are added.

## Decision

### 1) Single active provider

Uptime Watcher enforces:

- exactly one configured provider at a time

The Settings UI allows browsing other providers, but disables setup actions when another provider is configured (ADR-021).

### 2) Switching providers is explicit

To switch providers, the user must:

1. Disconnect / clear current provider configuration.
2. Configure and connect the new provider.

The app does not automatically “carry” the remote state across providers.

### 3) Remote cleanup is not automatic

When disconnecting, the app may:

- revoke tokens (when supported)

But the app does not automatically delete remote artifacts.

Instead, the UI provides an explicit advanced action:

- **Reset remote sync state** (preview + reset)

This separation avoids accidental data loss.

### 4) Migration tooling boundaries

Current/near-term tooling:

- encryption migration for backups (plaintext ↔ encrypted)
- remote reset tooling for sync artifacts

Not provided by default:

- provider-to-provider remote migration

A provider migration wizard may be introduced later if user demand warrants it.

## Consequences

- **Pro**: deterministic sync model and simple mental model.
- **Pro**: reduces accidental destructive operations.
- **Con**: switching providers is not one-click; users must explicitly decide what to do with remote data.

## Related ADRs

- ADR-015: Cloud Sync and Remote Backup Providers
- ADR-016: Multi-Device Sync Model
- ADR-021: Cloud Provider Selection and Settings UI
- ADR-022: OAuth Loopback Redirect and Callback Routing
