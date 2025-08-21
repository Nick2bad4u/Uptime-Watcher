# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Defined in: [src/utils/monitorValidation.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorValidation.ts#L79)

Validate monitor data using backend registry.

## Parameters

### type

Monitor type

`"http"` | `"port"` | `"ping"` | `"dns"`

### data

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`MonitorFormData`](../../../types/monitorFormData/type-aliases/MonitorFormData.md)\>

Monitor data to validate

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Promise resolving to validation result
