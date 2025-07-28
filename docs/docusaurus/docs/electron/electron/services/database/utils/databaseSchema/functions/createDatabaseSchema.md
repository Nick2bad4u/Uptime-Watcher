# Function: createDatabaseSchema()

> **createDatabaseSchema**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/databaseSchema.ts#L61)

Creates the full database schema (tables and indexes) within a transaction.

## Parameters

### db

`Database`

The Database instance to create the schema on.

## Returns

`void`

## Remarks

Creates all tables and indexes within coordinated operations to ensure consistent schema creation. Uses explicit transaction handling via BEGIN/COMMIT. Rolls back on error to maintain database integrity.

## Throws

When schema creation fails. Errors are logged and re-thrown for upstream handling.
