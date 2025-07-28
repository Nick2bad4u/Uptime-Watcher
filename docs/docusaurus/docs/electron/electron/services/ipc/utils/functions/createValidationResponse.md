# Function: createValidationResponse()

> **createValidationResponse**(`success`, `errors`, `warnings`, `metadata`): [`IpcValidationResponse`](../../types/interfaces/IpcValidationResponse.md)

Defined in: [electron/services/ipc/utils.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/utils.ts#L143)

Creates a standardized validation response for backward compatibility.

## Parameters

### success

`boolean`

Whether validation passed

### errors

`string`[] = `[]`

Validation errors

### warnings

`string`[] = `[]`

Validation warnings

### metadata

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\> = `{}`

Additional metadata

## Returns

[`IpcValidationResponse`](../../types/interfaces/IpcValidationResponse.md)

Standardized validation response
