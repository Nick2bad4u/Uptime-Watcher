# Function: rowsToHistoryEntries()

> **rowsToHistoryEntries**(`rows`): [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [electron/services/database/utils/historyMapper.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L110)

Converts an array of raw database rows to an array of [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) objects.

## Parameters

### rows

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>[]

Array of raw database rows.

## Returns

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Array of mapped [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) objects.

## Remarks

Each row is mapped using [rowToHistoryEntry](rowToHistoryEntry.md).

## Example

```typescript
const history = rowsToHistoryEntries(dbRows);
```
