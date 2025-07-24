# Function: isValidMonitorRow()

> **isValidMonitorRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/monitorMapper.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/monitorMapper.ts#L84)

Validate that a row contains the minimum required fields for a monitor.

## Parameters

### row

`Record`\<`string`, `unknown`\>

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
