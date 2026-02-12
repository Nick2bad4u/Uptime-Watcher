---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-028: Database Schema Versioning and Migrations"
summary: "Defines how the SQLite database schema is versioned and migrated, including idempotent schema creation, upgrade paths, and backup compatibility expectations."
created: "2025-12-15"
last_reviewed: "2026-02-12"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "database"
 - "sqlite"
 - "migrations"
 - "backups"
---

# ADR-028: Database Schema Versioning and Migrations

## Status

✅ Accepted (implemented)

## Context

Uptime Watcher persists state in SQLite.

Over time, table layouts and indexes evolve. The app must:

- create a new schema on first run
- migrate old schemas on upgrade
- keep backups restorable across app versions

## Decision drivers

1. **Data safety**: upgrades must not silently corrupt data.
2. **Idempotency**: schema creation should be safe to run multiple times.
3. **Backwards restore**: backups should remain restorable for a practical window of versions.
4. **Testability**: migrations should be deterministic and easy to validate.

## Decision

### 1) Schema versioning uses SQLite `PRAGMA user_version`

The SQLite schema version is tracked using SQLite's built-in integer:

- `PRAGMA user_version`

The application's expected schema version is defined in:

- `electron/services/database/utils/schema/databaseSchema.ts` (`DATABASE_SCHEMA_VERSION`)

Policy:

- `DATABASE_SCHEMA_VERSION` is the single source of truth.
- On startup, the app **fails closed** when the on-disk `user_version` is newer
  than this build (user must upgrade the app).

### 2) Initialization applies schema + upgrades deterministically

Database initialization is performed by:

- `electron/services/database/DatabaseService.ts` (`initialize()`)

Order of operations:

1. Resolve database file path: `path.join(app.getPath("userData"), DB_FILE_NAME)`.
2. Apply connection pragmas for resiliency:
   - `PRAGMA busy_timeout = 5000`
   - `PRAGMA journal_mode = WAL`
   - `PRAGMA synchronous = NORMAL`
   - `PRAGMA temp_store = MEMORY`
   - `PRAGMA foreign_keys = ON`
3. Create base schema (idempotent) via `createDatabaseSchema()`.
4. Synchronize/upgrade schema version via `synchronizeDatabaseSchemaVersion()`.

### 3) Migration/upgrade strategy: additive + idempotent

The current migration strategy is **forward-only** and primarily additive.

Implementation details (all inside `electron/services/database/utils/schema/databaseSchema.ts`):

- Tables and indexes are created with `IF NOT EXISTS`.
- Monitor configuration uses a **dynamic column schema**.
  - When new monitor-type fields are introduced, upgrades add missing columns
    via `ALTER TABLE monitors ADD COLUMN ...`.
- `user_version === 0` is treated as “legacy/unknown”: the app still performs
  additive upgrades before stamping `user_version`.

### 4) Transactional integrity guarantees

Schema creation and version synchronization are transactional:

- `createDatabaseSchema()` wraps table/index creation in `BEGIN TRANSACTION` /
  `COMMIT` and rolls back on error.
- `synchronizeDatabaseSchemaVersion()` also performs upgrades inside a
  transaction and rolls back on error.

Policy for future migrations/backfills:

- Any data backfill must be **idempotent** and must not leave partially written
  state that breaks startup.
- If a migration is not safely expressible as an atomic transaction, it must be
  implemented as a resumable, explicitly versioned, multi-step procedure and
  documented with tests.

### 5) Locked DB handling during startup

SQLite lock errors during initialization are handled by retry + recovery.

Implementation:

- `DatabaseService.initialize()` retries initialization up to
  `DATABASE_INITIALIZATION_MAX_ATTEMPTS`.
- When a lock error is detected while applying pragmas or creating/upgrading the
  schema, the app quarantines stale lock artifacts via:
  - `electron/services/database/utils/maintenance/databaseLockRecovery.ts`
  - Artifacts such as `-wal`, `-shm`, `-journal`, `.lock`, `.tmp` are moved into
    `stale-lock-artifacts/` under the database directory.

### 6) Backup compatibility expectations

Backups represent the full SQLite database.

Implementation notes:

- Backup metadata includes a `schemaVersion`.
- Restore rejects backups with `schemaVersion` newer than
  `DATABASE_SCHEMA_VERSION`.
- Restoring an older backup is allowed; after the restored file is swapped into
  place, the next app startup will run the normal schema upgrade flow.

Policy:

- Schema changes must include an upgrade path and tests where practical.
- Downgrades are not supported.

## Implementation notes

- Database service (initialization + pragmas + lock recovery retries):
  - `electron/services/database/DatabaseService.ts`
- Schema helpers (tables/indexes + dynamic monitor schema + version sync):
  - `electron/services/database/utils/schema/databaseSchema.ts`
- Stale lock artifact quarantine:
  - `electron/services/database/utils/maintenance/databaseLockRecovery.ts`

## Consequences

- **Pro**: schema evolution is explicit and reviewable.
- **Pro**: database initialization is deterministic.
- **Con**: schema changes require disciplined versioning and migration testing.
- **Con**: complex/destructive migrations require additional design work and
  cannot “hide” behind `IF NOT EXISTS` upgrades.

## Related ADRs

- ADR-013: Data Portability and Backup
- ADR-016: Multi-Device Sync Model
