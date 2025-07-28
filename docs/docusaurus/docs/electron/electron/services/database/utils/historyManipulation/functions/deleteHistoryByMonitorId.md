# Function: deleteHistoryByMonitorId()

> **deleteHistoryByMonitorId**(`db`, `monitorId`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:156](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyManipulation.ts#L156)

**`Internal`**

Delete history entries for a specific monitor.

## Parameters

### db

`Database`

Database connection instance

### monitorId

`string`

Unique identifier of the monitor

## Returns

`void`

## Throws

Error When database deletion fails

## Remarks

**Transaction Context**: Designed to be called from repository methods
that manage transaction context. Used within HistoryRepository.deleteByMonitorIdInternal().
