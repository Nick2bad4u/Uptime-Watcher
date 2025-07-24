# Function: validateMonitorFieldClientSide()

> **validateMonitorFieldClientSide**(`type`, `fieldName`, `value`): `Promise`\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Defined in: [src/utils/monitorValidation.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorValidation.ts#L141)

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

`Promise`\<\` `errors`: `string`[]; `success`: `boolean`; \`\>

Promise resolving to validation result
