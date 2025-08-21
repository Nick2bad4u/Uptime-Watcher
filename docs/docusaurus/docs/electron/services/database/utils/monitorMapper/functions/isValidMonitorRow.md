# Function: isValidMonitorRow()

> **isValidMonitorRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/monitorMapper.ts:235](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/monitorMapper.ts#L235)

Validates that a database row contains the minimum required fields for a
monitor.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

The raw database row to validate.

## Returns

`boolean`

`true` if the row is valid for monitor mapping, otherwise `false`.

## Remarks

Checks for the presence and type of critical fields in a raw database row.
Expects snake_case keys as returned by SQLite.

## Example

```typescript
if (isValidMonitorRow(row)) { ... }
```
