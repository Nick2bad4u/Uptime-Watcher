# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): `Promise`\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Defined in: [src/utils/monitorValidation.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorValidation.ts#L45)

Validate monitor data using backend registry.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### data

`Record`\<`string`, `unknown`\>

Monitor data to validate

## Returns

`Promise`\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Promise resolving to validation result
