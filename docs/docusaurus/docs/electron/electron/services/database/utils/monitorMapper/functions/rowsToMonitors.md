# Function: rowsToMonitors()

> **rowsToMonitors**(`rows`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)[]

Defined in: [electron/services/database/utils/monitorMapper.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L149)

Converts an array of database rows to an array of monitor objects.

## Parameters

### rows

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>[]

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
