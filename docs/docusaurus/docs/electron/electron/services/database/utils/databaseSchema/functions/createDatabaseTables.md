# Function: createDatabaseTables()

> **createDatabaseTables**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/databaseSchema.ts#L100)

Creates all required database tables if they do not exist.

## Parameters

### db

`Database`

The Database instance to create tables on.

## Returns

`void`

## Remarks

Creates the following tables:
- `sites`: Site configuration and monitoring status
- `monitors`: Monitor configuration and runtime data (dynamic schema)
- `history`: Historical monitoring data
- `settings`: Application configuration
- `stats`: Runtime statistics
- `logs`: Application logs

Uses dynamic schema generation for the monitors table. All table creation operations are idempotent.

## Throws

When table creation fails. Errors are logged and re-thrown for upstream handling.
