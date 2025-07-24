# Function: validateMonitorFormData()

> **validateMonitorFormData**(`type`, `data`): `Promise`\<\` `errors`: `string`[]; `success`: `boolean`; `warnings`: `string`[]; \`\>

Defined in: [src/utils/monitorValidation.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/utils/monitorValidation.ts#L172)

Validate monitor form data with only the fields that are provided.
Used for form validation where not all monitor fields are available yet.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### data

`Record`\<`string`, `unknown`\>

Partial monitor data from form

## Returns

`Promise`\<\` `errors`: `string`[]; `success`: `boolean`; `warnings`: `string`[]; \`\>

Promise resolving to validation result
