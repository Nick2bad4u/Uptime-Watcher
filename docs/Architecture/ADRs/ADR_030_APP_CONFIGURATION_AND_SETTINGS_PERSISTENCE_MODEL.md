---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-030: App Configuration and Settings Persistence Model"
summary: "Defines where configuration and user settings live (process env, renderer localStorage, and SQLite), which source is authoritative, and how to add new settings safely."
created: "2025-12-15"
last_reviewed: "2026-02-12"
doc_category: "guide"
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

- `@shared/utils/environment` (`readProcessEnv`)

Examples include (non-exhaustive):

- `UPTIME_WATCHER_DROPBOX_APP_KEY`
- `UPTIME_WATCHER_USER_DATA_DIR` (portable / custom data dir scenarios)

Implementation:

- User data directory override is applied during startup in:
  - `electron/main.ts`
  - Supported keys: `UPTIME_WATCHER_USER_DATA_DIR`, `PLAYWRIGHT_USER_DATA_DIR`
- The SQLite database path is then resolved from Electron's userData path:
  - `electron/services/database/DatabaseService.ts`
  - `path.join(app.getPath("userData"), DB_FILE_NAME)`

Policy:

- **Environment variables are configuration**, not user settings.
- Environment variables must not be written by the app.

### 2) Renderer preferences are persisted in localStorage

UI-centric preferences (theme, notification toggles, etc.) are persisted in the renderer using Zustand persist:

- `src/stores/settings/useSettingsStore.ts`
- storage key: `uptime-watcher-settings` (via `createPersistConfig()`)

Notes:

- Persisted renderer state is treated as **device-local**.
- The settings store performs a schema-shape normalization merge on hydration
  (see `normalizeAppSettings()` and the custom `merge` function).
- Zustand persist `version`/`migrate` are not currently used; any future breaking
  shape change should add explicit versioned migrations rather than relying on
  ad-hoc normalization.

Policy:

- renderer settings are treated as **device-local**
- renderer settings are safe to store in browser storage

### 3) “Durable app behavior” settings are persisted in SQLite (main)

Settings that must be durable, queryable, and/or shared across app subsystems are stored in SQLite:

- table:
  - `settings (key TEXT PRIMARY KEY, value TEXT)`
  - `electron/services/database/utils/schema/databaseSchema.ts`
- row mapping:
  - `electron/services/database/utils/mappers/settingsMapper.ts`

Today, the canonical example is:

- `historyLimit`

Renderer access pattern:

- Renderer reads/writes durable settings via IPC-backed services.
  - Example: `src/services/SettingsService.ts` (history limit)

Policy:

- any setting that affects **data retention**, **data portability**, or **database behavior** belongs in SQLite
- renderer accesses these values via IPC-backed services

### 4) Synced settings: conflict resolution + schema expectations

Some SQLite settings are part of the cloud sync domain (ADR-016).

Implementation:

- The sync engine treats settings as a key/value entity set.
  - `electron/services/sync/SyncEngine.ts`
  - `electron/services/sync/syncEngineState.ts`
- Conflict resolution is deterministic LWW at the per-key field level.
  - Ordering: timestamp, then deviceId, then opId (ADR-016)
- Settings keys under the reserved `cloud.` prefix are excluded from cloud sync.
  - `shouldSyncSettingKey(key)` returns `false` for keys starting with `cloud.`
  - These keys are internal bookkeeping (provider config flags, timestamps,
    encryption bookkeeping) and are intentionally device-local.

### 5) Adding a new setting: rubric

When adding a setting, choose the source of truth deliberately:

1. **Is it a secret (token, API key, passphrase)?**
   - main-only; store via SecretStore (ADR-023)

2. **Is it “device UI preference” only?**
   - renderer localStorage via Zustand persist

3. **Does it change stored data behavior or retention?**
   - SQLite `settings` table, with explicit validation

4. **Should it sync across devices?**
   - it must participate in Cloud Sync (ADR-016) and cannot be renderer-only

Sync rule of thumb:

- If a setting should sync across devices, it must be stored in SQLite and its
  key must **not** start with `cloud.`.

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
