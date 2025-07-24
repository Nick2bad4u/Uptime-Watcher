# Function: validateMonitorField()

> **validateMonitorField**(`type`, `fieldName`, `value`): `Promise`\<`string`[]\>

Defined in: [src/utils/monitorValidation.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorValidation.ts#L108)

Validate individual monitor field.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### fieldName

`string`

Field name to validate

### value

`unknown`

Field value

## Returns

`Promise`\<`string`[]\>

Promise resolving to validation errors (empty if valid)
