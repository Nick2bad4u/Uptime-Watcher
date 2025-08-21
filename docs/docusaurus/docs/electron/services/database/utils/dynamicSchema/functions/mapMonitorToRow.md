# Function: mapMonitorToRow()

> **mapMonitorToRow**(`monitor`): [`MonitorRow`](../../../../../../shared/types/database/interfaces/MonitorRow.md)

Defined in: [electron/services/database/utils/dynamicSchema.ts:606](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L606)

Maps a monitor object to a database row, including dynamic fields.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Monitor object to map.

## Returns

[`MonitorRow`](../../../../../../shared/types/database/interfaces/MonitorRow.md)

Database row object suitable for SQL operations.

## Remarks

Converts monitor properties to database-compatible values. Handles both
static and dynamic fields.

## Example

```typescript
const row = mapMonitorToRow(monitor);
```
