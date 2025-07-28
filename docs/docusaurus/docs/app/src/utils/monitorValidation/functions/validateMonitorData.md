# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

Defined in: [src/utils/monitorValidation.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L67)

Validate monitor data using backend registry.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Monitor data to validate

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

Promise resolving to validation result
