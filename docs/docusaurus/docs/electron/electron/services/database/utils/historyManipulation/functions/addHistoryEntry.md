# Function: addHistoryEntry()

> **addHistoryEntry**(`db`, `monitorId`, `entry`, `details?`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyManipulation.ts#L35)

**`Internal`**

Add a new history entry for a monitor.

## Parameters

### db

`Database`

Database connection instance

### monitorId

`string`

Unique identifier of the monitor

### entry

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

StatusHistory object containing check results

### details?

`string`

Optional additional details about the check

## Returns

`void`

## Throws

Error When database insertion fails

## Remarks

**Transaction Context**: This utility function is designed to be called from
repository methods that manage transaction context and error handling.

**Usage Pattern**: Always called from HistoryRepository.addEntryInternal()
within an existing transaction context for proper atomicity.
