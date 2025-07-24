# Function: deleteHistoryByMonitorId()

> **deleteHistoryByMonitorId**(`db`, `monitorId`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/historyManipulation.ts#L151)

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
