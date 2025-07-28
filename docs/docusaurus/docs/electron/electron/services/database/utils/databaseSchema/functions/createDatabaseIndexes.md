# Function: createDatabaseIndexes()

> **createDatabaseIndexes**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/databaseSchema.ts#L30)

Creates database indexes for improved query performance.

## Parameters

### db

`Database`

The Database instance to create indexes on.

## Returns

`void`

## Remarks

Creates the following indexes:
- `idx_monitors_site_identifier`: Fast site-based monitor queries
- `idx_monitors_type`: Monitor type filtering
- `idx_history_monitor_id`: Fast history lookups by monitor
- `idx_history_timestamp`: Time-based history queries

## Throws

When index creation fails. Errors are logged and re-thrown for upstream handling.
