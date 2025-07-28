# Function: mapMonitorToRow()

> **mapMonitorToRow**(`monitor`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/dynamicSchema.ts:204](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L204)

Maps a monitor object to a database row, including dynamic fields.

## Parameters

### monitor

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Monitor object to map.

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row object suitable for SQL operations.

## Remarks

Converts monitor properties to database-compatible values.
Handles both static and dynamic fields.

## Example

```typescript
const row = mapMonitorToRow(monitor);
```
