# Function: getHistoryCount()

> **getHistoryCount**(`db`, `monitorId`): `number`

Defined in: [electron/services/database/utils/historyQuery.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyQuery.ts#L65)

**`Internal`**

Get the count of history entries for a monitor.

## Parameters

### db

`Database`

Database connection instance

### monitorId

`string`

Unique identifier of the monitor

## Returns

`number`

Number of history entries for the monitor (returns 0 if none found)

## Throws

Error When database query fails

## Remarks

**Repository Context**: Called from HistoryRepository.getHistoryCount() and
HistoryRepository.getHistoryCountInternal() for transaction contexts.

**Fallback Behavior**: Returns 0 if no results found or result is null/undefined.
