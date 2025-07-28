# Function: rowToMonitorOrUndefined()

> **rowToMonitorOrUndefined**(`row`): `undefined` \| [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [electron/services/database/utils/monitorMapper.ts:253](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L253)

Converts a database row to a monitor object, or returns `undefined` if the row is missing.

## Parameters

### row

The raw database row or `undefined`.

`undefined` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

`undefined` \| [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The mapped monitor object, or `undefined` if the row is missing.

## Remarks

- Returns `undefined` if the input row is `undefined` or `null`.
- Otherwise, delegates to [rowToMonitor](rowToMonitor.md).
- Used by repository methods where a missing monitor is not an error.

## Throws

Error if mapping fails for a valid row.

## Example

```typescript
const monitor = rowToMonitorOrUndefined(dbRowOrUndefined);
```

## See

[rowToMonitor](rowToMonitor.md)
