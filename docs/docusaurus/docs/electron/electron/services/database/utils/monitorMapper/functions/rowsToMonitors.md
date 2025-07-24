# Function: rowsToMonitors()

> **rowsToMonitors**(`rows`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)[]

Defined in: [electron/services/database/utils/monitorMapper.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/monitorMapper.ts#L103)

Convert multiple database rows to monitor objects.

## Parameters

### rows

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>[]

Array of database rows

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)[]

Array of converted monitor objects
