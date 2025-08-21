# Function: rowToMonitorOrUndefined()

> **rowToMonitorOrUndefined**(`row`): `undefined` \| [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [electron/services/database/utils/monitorMapper.ts:358](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/monitorMapper.ts#L358)

Converts a database row to a monitor object, or returns `undefined` if the
row is missing.

## Parameters

### row

The raw database row or `undefined`.

`undefined` | [`MonitorRow`](../../../../../../shared/types/database/interfaces/MonitorRow.md)

## Returns

`undefined` \| [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The mapped monitor object, or `undefined` if the row is missing.

## Remarks

- Returns `undefined` if the input row is `undefined` or `null`.
- Otherwise, delegates to [rowToMonitor](rowToMonitor.md).
- Used by repository methods where a missing monitor is not an error.

## Example

```typescript
const monitor = rowToMonitorOrUndefined(dbRowOrUndefined);
```

## Throws

Error if mapping fails for a valid row.

## See

[rowToMonitor](rowToMonitor.md)
