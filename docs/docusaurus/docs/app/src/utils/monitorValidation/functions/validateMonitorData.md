# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Defined in: [src/utils/monitorValidation.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorValidation.ts#L45)

Validate monitor data using backend registry.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Monitor data to validate

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Promise resolving to validation result
