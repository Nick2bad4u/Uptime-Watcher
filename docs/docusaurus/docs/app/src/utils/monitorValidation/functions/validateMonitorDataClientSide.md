# Function: validateMonitorDataClientSide()

> **validateMonitorDataClientSide**(`type`, `data`): `Promise`\<\` `errors`: `string`[]; `success`: `boolean`; `warnings`: `string`[]; \`\>

Defined in: [src/utils/monitorValidation.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/utils/monitorValidation.ts#L76)

Perform client-side validation using shared Zod schemas.
Provides immediate feedback without IPC round-trip.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### data

`Record`\<`string`, `unknown`\>

Monitor data to validate

## Returns

`Promise`\<\` `errors`: `string`[]; `success`: `boolean`; `warnings`: `string`[]; \`\>

Promise resolving to validation result
