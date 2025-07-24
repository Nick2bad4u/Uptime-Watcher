# Function: getHistoryCount()

> **getHistoryCount**(`db`, `monitorId`): `number`

Defined in: [electron/services/database/utils/historyQuery.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyQuery.ts#L64)

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
