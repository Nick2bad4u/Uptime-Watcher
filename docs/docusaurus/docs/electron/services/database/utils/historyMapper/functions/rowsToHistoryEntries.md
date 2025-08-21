# Function: rowsToHistoryEntries()

> **rowsToHistoryEntries**(`rows`): [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [electron/services/database/utils/historyMapper.ts:223](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L223)

Converts an array of raw database rows to an array of [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md)
objects.

## Parameters

### rows

[`HistoryRow`](../../../../../../shared/types/database/interfaces/HistoryRow.md)[]

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
