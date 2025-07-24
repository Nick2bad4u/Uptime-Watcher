# Function: rowToHistoryEntryOrUndefined()

> **rowToHistoryEntryOrUndefined**(`row`): `undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Defined in: [electron/services/database/utils/historyMapper.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/historyMapper.ts#L126)

Convert database row to history entry or return undefined if not found.

## Parameters

### row

Database row data or undefined

`undefined` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

`undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Converted history entry or undefined
