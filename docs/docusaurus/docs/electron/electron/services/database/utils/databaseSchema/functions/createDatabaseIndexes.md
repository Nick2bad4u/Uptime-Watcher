# Function: createDatabaseIndexes()

> **createDatabaseIndexes**(`db`): `void`

Defined in: [electron/services/database/utils/databaseSchema.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/databaseSchema.ts#L28)

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
