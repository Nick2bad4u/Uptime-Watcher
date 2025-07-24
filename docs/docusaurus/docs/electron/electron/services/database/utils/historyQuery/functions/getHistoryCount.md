# Function: getHistoryCount()

> **getHistoryCount**(`db`, `monitorId`): `number`

Defined in: [electron/services/database/utils/historyQuery.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/historyQuery.ts#L64)

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
