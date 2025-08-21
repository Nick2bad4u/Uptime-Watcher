# Function: rowToHistoryEntry()

> **rowToHistoryEntry**(`row`): [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Defined in: [electron/services/database/utils/historyMapper.ts:179](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L179)

Converts a single database row to a [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object.

## Parameters

### row

[`HistoryRow`](../../../../../../shared/types/database/interfaces/HistoryRow.md)

The raw database row to convert.

## Returns

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

The mapped [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object.

## Remarks

Performs safe number conversion and status validation. If a value is invalid,
it defaults to a safe fallback and logs a warning or error.

## Example

```typescript
const entry = rowToHistoryEntry(dbRow);
```

## Throws

Error If mapping fails due to unexpected data types or missing
  fields.
