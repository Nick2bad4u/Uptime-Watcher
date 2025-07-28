# Function: rowToHistoryEntryOrUndefined()

> **rowToHistoryEntryOrUndefined**(`row`): `undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Defined in: [electron/services/database/utils/historyMapper.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L171)

Converts a database row to a [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object, or returns `undefined` if the row is not present.

## Parameters

### row

The database row to convert, or `undefined`.

`undefined` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

`undefined` \| [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

The mapped [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object, or `undefined` if the row is not present.

## Remarks

Useful for optional row lookups where the row may be missing.

## Example

```typescript
const entry = rowToHistoryEntryOrUndefined(optionalRow);
```
