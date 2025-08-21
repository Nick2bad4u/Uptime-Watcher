# Function: rowToHistoryEntryOrUndefined()

> **rowToHistoryEntryOrUndefined**(`row`): `undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Defined in: [electron/services/database/utils/historyMapper.ts:257](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L257)

Converts a database row to a [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object, or returns
`undefined` if the row is not present.

## Parameters

### row

The database row to convert, or `undefined`.

`undefined` | [`HistoryRow`](../../../../../../shared/types/database/interfaces/HistoryRow.md)

## Returns

`undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

The mapped [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object, or `undefined` if the row is
  not present.

## Remarks

Useful for optional row lookups where the row may be missing.

## Example

```typescript
const entry = rowToHistoryEntryOrUndefined(optionalRow);
```
