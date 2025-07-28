# Function: rowToMonitor()

> **rowToMonitor**(`row`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [electron/services/database/utils/monitorMapper.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L174)

Converts a single database row to a monitor object using the dynamic schema system.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

The raw database row to convert.

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The mapped monitor object.

## Remarks

- Maps snake_case DB fields to camelCase.
- Handles monitor type-specific fields via [mapRowToMonitor](../../dynamicSchema/functions/mapRowToMonitor.md).
- Applies default values for missing/invalid fields.
- Does not load history (history is loaded separately).
- Logs and re-throws errors for full traceability.

## Throws

Error if mapping fails or required fields are invalid.

## Example

```typescript
const monitor = rowToMonitor(dbRow);
```

## See

[mapRowToMonitor](../../dynamicSchema/functions/mapRowToMonitor.md)
