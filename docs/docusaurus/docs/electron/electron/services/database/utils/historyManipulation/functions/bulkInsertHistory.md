# Function: bulkInsertHistory()

> **bulkInsertHistory**(`db`, `monitorId`, `historyEntries`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyManipulation.ts#L77)

**`Internal`**

Bulk insert history entries (for import functionality).

## Parameters

### db

`Database`

Database connection instance

### monitorId

`string`

Unique identifier of the monitor

### historyEntries

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md) & `object`[]

Array of StatusHistory objects with optional details

## Returns

`void`

## Throws

Error When database bulk insertion fails

## Remarks

**Transaction Context**: Assumes it's called within an existing transaction context.
Uses a prepared statement for better performance during bulk operations.

**Performance**: Optimized for large datasets with prepared statement reuse.
The statement is properly finalized in the finally block to prevent resource leaks.

**Status Validation**: StatusHistory.status is always "up" or "down" per domain contract.
