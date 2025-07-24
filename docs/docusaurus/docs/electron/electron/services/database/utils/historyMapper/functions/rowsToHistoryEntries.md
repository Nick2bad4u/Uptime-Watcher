# Function: rowsToHistoryEntries()

> **rowsToHistoryEntries**(`rows`): [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [electron/services/database/utils/historyMapper.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L77)

Convert multiple database rows to history entries.

## Parameters

### rows

`Record`\<`string`, `unknown`\>[]

Array of raw database rows

## Returns

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Array of mapped StatusHistory objects
