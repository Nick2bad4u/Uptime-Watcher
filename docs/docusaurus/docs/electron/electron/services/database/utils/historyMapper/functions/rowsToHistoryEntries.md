# Function: rowsToHistoryEntries()

> **rowsToHistoryEntries**(`rows`): [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [electron/services/database/utils/historyMapper.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/historyMapper.ts#L77)

Convert multiple database rows to history entries.

## Parameters

### rows

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>[]

Array of raw database rows

## Returns

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Array of mapped StatusHistory objects
