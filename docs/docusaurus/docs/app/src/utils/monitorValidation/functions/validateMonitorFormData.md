# Function: validateMonitorFormData()

> **validateMonitorFormData**(`type`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `success`: `boolean`; `warnings`: `string`[]; \`\>

Defined in: [src/utils/monitorValidation.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorValidation.ts#L172)

Validate monitor form data with only the fields that are provided.
Used for form validation where not all monitor fields are available yet.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Partial monitor data from form

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `success`: `boolean`; `warnings`: `string`[]; \`\>

Promise resolving to validation result
