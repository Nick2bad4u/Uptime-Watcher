# Function: createDatabaseIndexes()

> **createDatabaseIndexes**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/databaseSchema.ts#L28)

Create database indexes for better query performance.

## Parameters

### db

`Database`

SQLite database instance

## Returns

`void`

## Throws

When index creation fails

## Remarks

Creates the following indexes:
- idx_monitors_site_identifier: Fast site-based monitor queries
- idx_monitors_type: Monitor type filtering
- idx_history_monitor_id: Fast history lookups by monitor
- idx_history_timestamp: Time-based history queries
