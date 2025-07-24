# Function: createDatabaseTables()

> **createDatabaseTables**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/databaseSchema.ts#L64)

Create all required database tables if they don't exist.

## Parameters

### db

`Database`

SQLite database instance

## Returns

`void`

## Throws

When table creation fails

## Remarks

Creates the following tables:
- sites: Site configuration and monitoring status
- monitors: Monitor configuration and runtime data (dynamic schema)
- history: Historical monitoring data
- settings: Application configuration
- stats: Runtime statistics
- logs: Application logs
