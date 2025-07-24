# Function: isValidMonitorRow()

> **isValidMonitorRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/monitorMapper.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/monitorMapper.ts#L84)

Validate that a row contains the minimum required fields for a monitor.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row to validate

## Returns

`boolean`

True if row is valid

## Remarks

**Database Schema**: Validates raw database rows using snake_case column names.
This is the correct pattern as database rows use snake_case while TypeScript
interfaces use camelCase after conversion.

**Type Safety**: Checks both existence and type for critical fields to prevent
runtime conversion errors during mapping operations.
