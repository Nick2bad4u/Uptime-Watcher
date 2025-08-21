# Function: mapRowToMonitor()

> **mapRowToMonitor**(`row`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [electron/services/database/utils/dynamicSchema.ts:636](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L636)

Maps a database row to a monitor object, including dynamic fields.

## Parameters

### row

[`MonitorRow`](../../../../../../shared/types/database/interfaces/MonitorRow.md)

Database row to convert.

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Monitor object with all properties mapped.

## Remarks

Converts database values to JavaScript types. Maps `enabled` to both
`enabled` and `monitoring` for frontend compatibility.

## Example

```typescript
const monitor = mapRowToMonitor(row);
```
