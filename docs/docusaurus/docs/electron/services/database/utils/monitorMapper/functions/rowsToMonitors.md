# Function: rowsToMonitors()

> **rowsToMonitors**(`rows`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)[]

Defined in: [electron/services/database/utils/monitorMapper.ts:317](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/monitorMapper.ts#L317)

Converts an array of database rows to an array of monitor objects.

## Parameters

### rows

[`MonitorRow`](../../../../../../shared/types/database/interfaces/MonitorRow.md)[]

Array of raw database rows.

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)[]

Array of mapped monitor objects.

## Remarks

Each row is mapped using [rowToMonitor](rowToMonitor.md). History is not loaded here.

## Example

```typescript
const monitors = rowsToMonitors(dbRows);
```

## See

[rowToMonitor](rowToMonitor.md)
