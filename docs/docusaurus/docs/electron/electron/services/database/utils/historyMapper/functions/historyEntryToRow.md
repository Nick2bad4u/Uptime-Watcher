# Function: historyEntryToRow()

> **historyEntryToRow**(`monitorId`, `entry`, `details?`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/historyMapper.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L57)

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

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

An object representing the database row for the history entry.

## Remarks

Used when inserting or updating history entries in the database.

## Example

```typescript
const row = historyEntryToRow("monitor-123", { status: "up", responseTime: 120, timestamp: 1680000000000 });
```
