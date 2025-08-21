# Function: validateMonitorFieldClientSide()

> **validateMonitorFieldClientSide**(`type`, `fieldName`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Defined in: [src/utils/monitorValidation.ts:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorValidation.ts#L195)

Validate a specific monitor field for real-time feedback using shared
schemas. Provides immediate validation without IPC round-trip.

## Parameters

### type

Monitor type

`"http"` | `"port"` | `"ping"` | `"dns"`

### fieldName

`string`

Field name to validate

### value

`unknown`

Field value to validate

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Promise resolving to validation result
