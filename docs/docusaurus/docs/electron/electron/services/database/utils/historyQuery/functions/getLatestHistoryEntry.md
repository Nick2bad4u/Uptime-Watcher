# Function: getLatestHistoryEntry()

> **getLatestHistoryEntry**(`db`, `monitorId`): `undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Defined in: [electron/services/database/utils/historyQuery.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyQuery.ts#L95)

**`Internal`**

Get the most recent history entry for a monitor.

## Parameters

### db

`Database`

Database connection instance

### monitorId

`string`

Unique identifier of the monitor

## Returns

`undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Most recent StatusHistory object, or undefined if no entries exist

## Throws

Error When database query fails

## Remarks

**Repository Context**: Called from HistoryRepository.getLatestEntry()
which handles async operations and error recovery via withDatabaseOperation().

**Query Behavior**: Uses ORDER BY timestamp DESC LIMIT 1 to get the most recent entry.
Returns undefined for monitors with no history entries.
