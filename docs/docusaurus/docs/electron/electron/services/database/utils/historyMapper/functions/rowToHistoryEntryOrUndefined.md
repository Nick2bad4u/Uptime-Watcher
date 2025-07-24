# Function: rowToHistoryEntryOrUndefined()

> **rowToHistoryEntryOrUndefined**(`row`): `undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Defined in: [electron/services/database/utils/historyMapper.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L126)

Convert database row to history entry or return undefined if not found.

## Parameters

### row

Database row data or undefined

`undefined` | `Record`\<`string`, `unknown`\>

## Returns

`undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Converted history entry or undefined
