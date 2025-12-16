---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-030: App Configuration and Settings Persistence Model"
summary: "Defines where configuration and user settings live (process env, renderer localStorage, and SQLite), which source is authoritative, and how to add new settings safely."
created: "2025-12-15"
last_reviewed: "2025-12-15"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "configuration"
  - "settings"
  - "zustand"
  - "sqlite"
  - "electron"
---

# ADR-030: App Configuration and Settings Persistence Model

## Status

✅ Accepted (implemented)

## Context

Uptime Watcher has multiple “knobs” that affect behavior:

- **Configuration** (deployment/runtime configuration like API keys, data dirs)
- **User settings** (preferences like theme, notifications, history limits)

These have different security and persistence constraints.

This ADR documents the authoritative sources of truth and the rules for adding new settings.

## Decision drivers

1. **Security**: secrets must not be stored in the renderer.
2. **Predictability**: settings must persist across restarts.
3. **Portability**: some settings must be backed up/migrated with the database.
4. **Maintainability**: adding a setting should follow a clear rubric.

## Decision

### 1) Configuration is provided via process environment (main)

Operational configuration is read from `process.env` in Electron main using:

- `electron/utils/environment.ts` (`readProcessEnv`)

Examples include (non-exhaustive):

- `UPTIME_WATCHER_DROPBOX_APP_KEY`
- `UPTIME_WATCHER_USER_DATA_DIR` (portable / custom data dir scenarios)

Policy:

- **Environment variables are configuration**, not user settings.
- Environment variables must not be written by the app.

### 2) Renderer preferences are persisted in localStorage

UI-centric preferences (theme, notification toggles, etc.) are persisted in the renderer using Zustand persist:

- `src/stores/settings/useSettingsStore.ts`
- storage key: `uptime-watcher-settings`

Policy:

- renderer settings are treated as **device-local**
- renderer settings are safe to store in browser storage

### 3) “Durable app behavior” settings are persisted in SQLite (main)

Settings that must be durable, queryable, and/or shared across app subsystems are stored in SQLite:

- table: `settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`
  - `electron/services/database/utils/databaseSchema.ts`
- mapping and validation:
  - `electron/services/database/utils/settingsMapper.ts`

Today, the canonical example is:

- `historyLimit`

Policy:

- any setting that affects **data retention**, **data portability**, or **database behavior** belongs in SQLite
- renderer accesses these values via IPC-backed services

### 4) Adding a new setting: rubric

When adding a setting, choose the source of truth deliberately:

1. **Is it a secret (token, API key, passphrase)?**
   - main-only; store via SecretStore (ADR-023)

2. **Is it “device UI preference” only?**
   - renderer localStorage via Zustand persist

3. **Does it change stored data behavior or retention?**
   - SQLite `settings` table, with explicit validation

4. **Should it sync across devices?**
   - it must participate in Cloud Sync (ADR-016) and cannot be renderer-only

## Consequences

- **Pro**: predictable persistence and clear ownership boundaries.
- **Pro**: secrets remain isolated in main.
- **Con**: some settings exist in multiple stores (renderer + SQLite); care is required to avoid drift.

## Related ADRs

- ADR-005: IPC Communication Protocol
- ADR-009: Validation Strategy
- ADR-016: Multi-Device Sync Model
- ADR-023: Secret Storage and Encryption Policy
- ADR-028: Database Schema Versioning and Migrations
