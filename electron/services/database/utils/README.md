# Database utilities

This folder contains **database-layer-only** helpers used by the repositories and
database services under `electron/services/database/*`.

## What belongs here

These helpers are tightly coupled to database concerns such as:

- schema creation/migration helpers (for SQLite)
- typed query helpers
- row ↔ domain mapping
- database-specific validation and conversion
- database maintenance helpers (locks, backup, recovery)

## What does _not_ belong here

If a helper is **cross-cutting** or not inherently database-specific, it should
live under `electron/utils/*` instead.

Examples of cross-cutting utilities:

- operational hooks (`electron/utils/operationalHooks`)
- error serialization (`electron/utils/errorSerialization`)
- logging (`electron/utils/logger`)
- caching (`electron/utils/cache/*`)

## Naming and structure guidelines

- Prefer names that describe the role of the helper:
  - `*Mapper` for row ↔ domain conversion
  - `*Query` / `typedQueries` for SQL query helpers
  - `*Schema` / `dynamicSchema` for schema and parameter generation
  - `*Validation` for DB-layer validations
- Keep these helpers **internal** to the database layer. Avoid importing them
  directly from IPC handlers or higher-level services unless there is a strong
  reason.

## Current folder structure

- `backup/` — database export/backup metadata and validation helpers
- `converters/` — low-level DB value conversion utilities
- `maintenance/` — lock recovery, pruning, and other maintenance routines
- `mappers/` — row ↔ domain mapping helpers (e.g., `SiteRow` → `Site`)
- `queries/` — typed query helpers and query builders
- `schema/` — schema creation + dynamic monitor schema generation
- `validation/` — repository boundary validation (identifier checks, etc.)
