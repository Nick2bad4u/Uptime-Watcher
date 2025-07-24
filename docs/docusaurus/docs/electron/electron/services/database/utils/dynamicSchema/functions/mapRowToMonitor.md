# Function: mapRowToMonitor()

> **mapRowToMonitor**(`row`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/dynamicSchema.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L160)

Map database row to monitor object with dynamic field handling.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row to convert

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Monitor object with proper type conversions

## Remarks

**Boolean Mapping**: Uses explicit comparison (=== 1) for SQLite boolean consistency.
**Field Mapping**: enabled and monitoring both map to the same database field for
backward compatibility - monitoring is the frontend-preferred field name.
