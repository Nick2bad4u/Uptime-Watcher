# Function: findHistoryByMonitorId()

> **findHistoryByMonitorId**(`db`, `monitorId`): [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [electron/services/database/utils/historyQuery.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyQuery.ts#L34)

**`Internal`**

Find all history entries for a specific monitor.

## Parameters

### db

`Database`

Database connection instance

### monitorId

`string`

Unique identifier of the monitor

## Returns

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Array of StatusHistory objects ordered by timestamp (newest first)

## Throws

Error When database query fails

## Remarks

**Repository Context**: Designed to be called from HistoryRepository.findByMonitorId()
which handles async operations and error recovery via withDatabaseOperation().

**Query Performance**: Uses indexed monitor_id field with timestamp ordering for efficiency.
Results are ordered by timestamp DESC to show most recent entries first.
