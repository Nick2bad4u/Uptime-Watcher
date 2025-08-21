# Function: createDatabaseSchema()

> **createDatabaseSchema**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:273](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/databaseSchema.ts#L273)

Creates the full database schema (tables and indexes) within a transaction.

## Parameters

### db

`Database`

The Database instance to create the schema on.

## Returns

`void`

## Remarks

Creates all tables and indexes within coordinated operations to ensure
consistent schema creation. Uses explicit transaction handling via
BEGIN/COMMIT. Rolls back on error to maintain database integrity.

## Throws

When schema creation fails. Errors are logged and re-thrown for
  upstream handling.
