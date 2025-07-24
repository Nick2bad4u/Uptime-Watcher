# Function: rowToMonitorOrUndefined()

> **rowToMonitorOrUndefined**(`row`): `undefined` \| [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [electron/services/database/utils/monitorMapper.ts:212](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/monitorMapper.ts#L212)

Convert database row to monitor object or return undefined if not found.

## Parameters

### row

Database row data or undefined

`undefined` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

`undefined` \| [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Converted monitor object or undefined

## Throws

Error When row mapping fails for valid rows (propagated from rowToMonitor)

## Remarks

**Null Safety**: Safely handles undefined/null rows without throwing errors.
Used by repository methods that may not find matching records.

**Error Behavior**: If row exists but is invalid, errors from `rowToMonitor()` are
propagated to allow proper error handling by calling code.

**Usage Pattern**: Commonly used in `MonitorRepository.findByIdentifier()` where
missing monitors are expected and should return undefined.
