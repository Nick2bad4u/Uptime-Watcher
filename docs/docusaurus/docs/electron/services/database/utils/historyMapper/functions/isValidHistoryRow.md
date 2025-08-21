# Function: isValidHistoryRow()

> **isValidHistoryRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/historyMapper.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L146)

Validates that a database row contains the minimum required fields for a
history entry.

## Parameters

### row

[`HistoryRow`](../../../../../../shared/types/database/interfaces/HistoryRow.md)

The database row to validate.

## Returns

`boolean`

`true` if the row is valid for a history entry, otherwise `false`.

## Remarks

Ensures that the row has a valid monitor ID, status, and timestamp.

## Example

```typescript
if (isValidHistoryRow(row)) { ... }
```
