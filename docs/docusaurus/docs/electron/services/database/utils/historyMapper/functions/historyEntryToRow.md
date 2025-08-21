# Function: historyEntryToRow()

> **historyEntryToRow**(`monitorId`, `entry`, `details?`): [`HistoryRow`](../../../../../../shared/types/database/interfaces/HistoryRow.md)

Defined in: [electron/services/database/utils/historyMapper.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L113)

Converts a [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object to a database row format.

## Parameters

### monitorId

`string`

The unique identifier of the monitor.

### entry

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

The [StatusHistory](../../../../../../shared/types/interfaces/StatusHistory.md) object to convert.

### details?

`string`

Optional details string to include in the row.

## Returns

[`HistoryRow`](../../../../../../shared/types/database/interfaces/HistoryRow.md)

An object representing the database row for the history entry.

## Remarks

Used when inserting or updating history entries in the database.

## Example

```typescript
const row = historyEntryToRow("monitor-123", {
    status: "up",
    responseTime: 120,
    timestamp: 1680000000000,
});
```
