# Function: validateMonitorFormData()

> **validateMonitorFormData**(`type`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Defined in: [src/utils/monitorValidation.ts:401](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorValidation.ts#L401)

Validate monitor form data with only the fields that are provided. Used for
form validation where not all monitor fields are available yet.

## Parameters

### type

Monitor type

`"http"` | `"port"` | `"ping"` | `"dns"`

### data

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`MonitorFormData`](../../../types/monitorFormData/type-aliases/MonitorFormData.md)\>

Partial monitor data from form

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Promise resolving to validation result
