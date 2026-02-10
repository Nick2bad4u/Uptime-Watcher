---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-028: Database Schema Versioning and Migrations"
summary: "Defines how the SQLite database schema is versioned and migrated, including idempotent schema creation, upgrade paths, and backup compatibility expectations."
created: "2025-12-15"
last_reviewed: "2025-12-16"
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

### 1) Schema versioning is explicit

The database schema has a single source of truth:

- `electron/services/database/utils/databaseSchema.ts`

The schema definition includes:

- schema version number
- table creation statements
- indexes

### 2) Migrations are performed during initialization

Database initialization applies:

1. schema creation statements (idempotent)
2. schema upgrades when the on-disk schema version is older

### 3) Migration rules

- upgrades must be forward-only
- destructive migrations require explicit backup considerations
- schema version increments must accompany any schema change

### 4) Backup compatibility

Backups represent the full SQLite database.

When changing schema:

- ensure migration path from older versions exists
- keep restore behavior deterministic

## Implementation notes

- Database service:
  - `electron/services/database/DatabaseService.ts`
- Schema + migration helpers:
  - `electron/services/database/utils/databaseSchema.ts`

## Consequences

- **Pro**: schema evolution is explicit and reviewable.
- **Pro**: database initialization is deterministic.
- **Con**: schema changes require disciplined versioning and migration testing.

## Related ADRs

- ADR-013: Data Portability and Backup
- ADR-016: Multi-Device Sync Model
