# Function: mapRowToMonitor()

> **mapRowToMonitor**(`row`): `Record`\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/dynamicSchema.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/dynamicSchema.ts#L160)

Map database row to monitor object with dynamic field handling.

## Parameters

### row

`Record`\<`string`, `unknown`\>

Database row to convert

## Returns

`Record`\<`string`, `unknown`\>

Monitor object with proper type conversions

## Remarks

**Boolean Mapping**: Uses explicit comparison (=== 1) for SQLite boolean consistency.
**Field Mapping**: enabled and monitoring both map to the same database field for
backward compatibility - monitoring is the frontend-preferred field name.
