# Function: pruneHistoryForMonitor()

> **pruneHistoryForMonitor**(`db`, `monitorId`, `limit`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:189](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyManipulation.ts#L189)

**`Internal`**

Prune old history entries for a monitor, keeping only the most recent entries.

## Parameters

### db

`Database`

Database connection instance

### monitorId

`string`

Unique identifier of the monitor

### limit

`number`

Maximum number of history entries to retain

## Returns

`void`

## Throws

Error When database operations fail

## Remarks

**Algorithm**: Uses `LIMIT -1 OFFSET ?` to select all entries beyond the most recent `limit` entries.
In SQLite, `LIMIT -1` means "no limit", and combined with `OFFSET`, this efficiently
identifies excess entries for deletion.

**Transaction Context**: Designed to be called from repository methods within transaction context.
Used by HistoryRepository.pruneHistoryInternal() and HistoryRepository.pruneAllHistoryInternal().

**Performance**: Only executes DELETE when excess entries exist to avoid unnecessary operations.
