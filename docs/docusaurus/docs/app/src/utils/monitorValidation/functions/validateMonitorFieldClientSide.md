# Function: validateMonitorFieldClientSide()

> **validateMonitorFieldClientSide**(`type`, `fieldName`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Defined in: [src/utils/monitorValidation.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorValidation.ts#L141)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Promise resolving to validation result
