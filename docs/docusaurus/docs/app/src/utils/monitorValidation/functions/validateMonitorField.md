# Function: validateMonitorField()

> **validateMonitorField**(`type`, `fieldName`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Defined in: [src/utils/monitorValidation.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorValidation.ts#L108)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to validation errors (empty if valid)
