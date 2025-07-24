# Function: historyEntryToRow()

> **historyEntryToRow**(`monitorId`, `entry`, `details?`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/historyMapper.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/historyMapper.ts#L40)

Convert StatusHistory to database row format.

## Parameters

### monitorId

`string`

Monitor ID

### entry

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

StatusHistory object

### details?

`string`

Optional details string

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row format
