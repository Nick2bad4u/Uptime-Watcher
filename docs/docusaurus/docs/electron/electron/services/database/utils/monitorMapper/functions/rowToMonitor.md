# Function: rowToMonitor()

> **rowToMonitor**(`row`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [electron/services/database/utils/monitorMapper.ts:134](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/monitorMapper.ts#L134)

Convert database row to monitor object using dynamic schema.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row data

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Converted monitor object

## Throws

Error When row mapping fails or required fields are invalid

## Remarks

**Dynamic Schema Integration**: Uses `mapRowToMonitor()` from dynamic schema system
to handle monitor type-specific fields automatically.

**Property Mapping**: Maps database conventions to TypeScript conventions:
- `enabled` (DB) → `monitoring` (Frontend): Technical field vs user-facing state
- snake_case (DB) → camelCase (TypeScript): Architectural consistency

**Default Value Behavior**:
- Missing numeric fields default to sensible values (checkInterval: 300000ms, timeout: 5000ms)
- Invalid IDs default to "-1" for error tracking
- Missing status defaults to "down" for safety
- Missing responseTime uses complex fallback: dynamicMonitor.responseTime → row.responseTime → -1

**Error Handling**: Catches and logs mapping failures with full context for debugging.
All errors are re-thrown to ensure proper error propagation.
