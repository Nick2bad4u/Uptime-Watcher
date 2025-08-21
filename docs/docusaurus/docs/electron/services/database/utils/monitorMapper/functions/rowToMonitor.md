# Function: rowToMonitor()

> **rowToMonitor**(`row`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [electron/services/database/utils/monitorMapper.ts:271](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/monitorMapper.ts#L271)

Converts a single database row to a monitor object using the dynamic schema
system.

## Parameters

### row

[`MonitorRow`](../../../../../../shared/types/database/interfaces/MonitorRow.md)

The raw database row to convert.

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The mapped monitor object.

## Remarks

- Handles monitor type-specific fields via [mapRowToMonitor](../../dynamicSchema/functions/mapRowToMonitor.md).
- Adds security validation for activeOperations JSON.
- Performs safe type conversions with fallbacks.

## Example

```typescript
const monitor = rowToMonitor(dbRow);
```

## Throws

Error if mapping fails or required fields are invalid.

## See

[mapRowToMonitor](../../dynamicSchema/functions/mapRowToMonitor.md)
