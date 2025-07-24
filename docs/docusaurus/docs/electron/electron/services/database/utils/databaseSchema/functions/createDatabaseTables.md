# Function: createDatabaseTables()

> **createDatabaseTables**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/databaseSchema.ts#L64)

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
