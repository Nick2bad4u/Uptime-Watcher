# Function: bulkInsertHistory()

> **bulkInsertHistory**(`db`, `monitorId`, `historyEntries`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyManipulation.ts#L72)

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
