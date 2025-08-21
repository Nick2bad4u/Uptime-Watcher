# Function: getMonitorValidationErrors()

> **getMonitorValidationErrors**(`monitor`): `string`[]

Defined in: [shared/utils/validation.ts:285](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/validation.ts#L285)

Gets validation errors for monitor fields based on monitor type.

## Parameters

### monitor

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Monitor`](../../../types/interfaces/Monitor.md)\>

Partial monitor data to validate

## Returns

`string`[]

Array of validation error messages (empty if valid)

## Remarks

Validates required fields and type-specific constraints for monitors. Returns
descriptive error messages for any validation failures.
