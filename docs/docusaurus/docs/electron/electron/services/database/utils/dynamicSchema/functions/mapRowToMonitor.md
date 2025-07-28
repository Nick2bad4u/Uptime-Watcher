# Function: mapRowToMonitor()

> **mapRowToMonitor**(`row`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/dynamicSchema.ts:231](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L231)

Maps a database row to a monitor object, including dynamic fields.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row to convert.

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Monitor object with all properties mapped.

## Remarks

Converts database values to JavaScript types.
Maps `enabled` to both `enabled` and `monitoring` for frontend compatibility.

## Example

```typescript
const monitor = mapRowToMonitor(row);
```
