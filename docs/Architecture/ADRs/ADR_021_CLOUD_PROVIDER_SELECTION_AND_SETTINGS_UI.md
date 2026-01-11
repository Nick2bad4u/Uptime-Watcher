---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-021: Cloud Provider Selection and Settings UI"
summary: "Defines a provider-tabbed Cloud settings UX, enforces a single active provider at a time, and documents a roadmap for future providers (e.g. WebDAV)."
created: "2025-12-15"
last_reviewed: "2026-01-11"
category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "cloud"
 - "sync"
 - "backup"
 - "ui"
 - "oauth"
 - "dropbox"
 - "google-drive"
---

# ADR-021: Cloud Provider Selection and Settings UI

## Table of Contents

1. [Status](#status)
2. [Context](#context)
3. [Decision drivers](#decision-drivers)
4. [Decision](#decision)
5. [UX / Information architecture](#ux--information-architecture)
6. [Provider roadmap](#provider-roadmap)
7. [Why only one provider at a time](#why-only-one-provider-at-a-time)
8. [Multi-provider future (non-blocking)](#multi-provider-future-non-blocking)
9. [Implementation notes](#implementation-notes)
10. [Testing & validation](#testing--validation)
11. [Consequences](#consequences)
12. [Related ADRs](#related-adrs)
13. [Review](#review)

## Status

Accepted (implemented — initial UI refactor complete)

## Context

Cloud Sync / Remote Backups were introduced in ADR-015 and the merge model in ADR-016.

As additional providers are added (e.g. Google Drive), the Settings UI must:

- Scale without becoming a long, confusing list of controls.
- Make the currently active provider obvious.
- Keep setup actions scoped to the selected provider.
- Preserve the security boundary: OAuth and secrets live in Electron main.

## Decision drivers

1. **Scalability**: the UI must support multiple providers without growing vertically into a wall of buttons.
2. **Clarity**: users must understand which provider is active and what actions are safe.
3. **Safety**: avoid ambiguous “two remotes” state until conflict semantics are designed.
4. **Consistency**: provider setup must follow a consistent pattern across providers.
5. **Extensibility**: adding a provider should be incremental (new provider implementation + a new provider panel).

## Decision

### 1) Provider setup is presented as tabs

The Cloud settings section exposes providers using a single tabbed selector:

- Dropbox
- Google Drive
- WebDAV (planned — UI tab exists, provider implementation deferred)
- Local folder (filesystem provider)

Tabs act as an information architecture boundary: provider-specific setup lives inside the tab panel.

### 2) Single active provider at a time (initially)

Uptime Watcher enforces **a single configured provider** for Cloud Sync / Remote Backups.

When a provider is configured, other provider tabs remain visible, but setup actions are disabled with an explicit callout.

## UX / Information architecture

The Cloud settings section is organized into stable groups that do not multiply per provider:

1. **Provider**
   - Provider tabs
   - Provider setup panel
   - Status indicator
   - Refresh status / Disconnect / Clear configuration

2. **Connection & Status**
   - Last Sync / Last Backup

3. **Sync**
   - Enable Sync toggle
   - Sync now

4. **Encryption**
   - Passphrase setup / unlock / lock

5. **Backups**
   - Upload latest / list / restore / delete

6. **Advanced**
   - Backup migration (encrypt/decrypt)
   - Sync maintenance (preview + reset remote sync state)

## Provider roadmap

### Dropbox (implemented)

- OAuth 2.0 Authorization Code + PKCE via system browser.
- Tokens stored via main-process secret storage.
- Provider details expose a safe account label to the renderer.

### Google Drive (implemented)

For each provider we will add:

- A `CloudStorageProvider` implementation in Electron main.
- A `connect<Provider>()` flow owned by main.
- Secret storage via the existing `SecretStore` abstraction.
- A dedicated provider setup tab panel.

Implementation notes:

- Google Drive must follow the same security properties as Dropbox:
  - system browser OAuth
  - PKCE
  - no embedded auth webviews
  - no secrets in the renderer

## Why only one provider at a time

Supporting multiple providers simultaneously (e.g. Dropbox + Google Drive) is not “just add another remote.”

It introduces non-trivial questions:

- Namespacing: are there separate remote roots per provider?
- Conflict semantics: which remote is authoritative for sync objects?
- Cost/latency: duplicate uploads, additional rate limiting, and more failure modes.
- UX: how do we explain “Sync enabled for two remotes” without confusing or misleading users?

Given those costs, the default policy is:

- **Exactly one configured provider** at a time.

## Multi-provider future (non-blocking)

If multi-provider support is ever required, it must be designed explicitly.

A plausible path (not committed):

- Treat each provider as a separate remote namespace (e.g. `remote/<provider>/sync/*`).
- Persist and display a per-provider connection/config status.
- Require users to choose a single “sync authority” provider, while allowing additional providers for backups only.
- Add explicit migration tools between providers.

## Implementation notes

Key renderer modules:

- Provider setup UI: `src/components/Settings/SettingsSections.tsx` (Cloud section)
- Wiring and dialogs: `src/components/Settings/CloudSettingsSection.tsx`
- Cloud store (toasts + OS notifications): `src/stores/cloud/useCloudStore.ts`

Key main-process modules:

- Orchestration: `electron/services/cloud/CloudService.ts`
- Provider: `electron/services/cloud/providers/dropbox/*`
- Provider: `electron/services/cloud/providers/googleDrive/*`

## Testing & validation

- `npm run lint:fix`
- `npm run type-check:all`
- `npm test`

Provider setup UI is validated indirectly through store/service tests and static typing.

## Consequences

- **Pro**: Settings stays readable and scalable as providers are added.
- **Pro**: Clear constraints around “one provider at a time” reduce user confusion and correctness risk.
- **Con**: Users cannot enable redundant remotes (e.g. Dropbox + Google Drive) until an explicit multi-provider design exists.

## Related ADRs

- ADR-005: IPC Communication Protocol
- ADR-009: Validation Strategy
- ADR-012: Notifications and Alerting
- ADR-015: Cloud Sync and Remote Backup Providers
- ADR-016: Multi-Device Sync Model

## Review

- 2025-12-15: Initial version created alongside provider-tab UI refactor.
