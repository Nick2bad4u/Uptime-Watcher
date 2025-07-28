# Function: validateMonitorFieldClientSide()

> **validateMonitorFieldClientSide**(`type`, `fieldName`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

Defined in: [src/utils/monitorValidation.ts:178](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L178)

Validate a specific monitor field for real-time feedback using shared schemas.
Provides immediate validation without IPC round-trip.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### fieldName

`string`

Field name to validate

### value

`unknown`

Field value to validate

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

Promise resolving to validation result
