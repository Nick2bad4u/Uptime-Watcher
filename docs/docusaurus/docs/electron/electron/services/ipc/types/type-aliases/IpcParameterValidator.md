# Type Alias: IpcParameterValidator()

> **IpcParameterValidator** = (`params`) => `null` \| `string`[]

Defined in: [electron/services/ipc/types.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L28)

Validation function type for IPC parameters.

## Parameters

### params

`unknown`[]

The parameters to validate

## Returns

`null` \| `string`[]

Array of error messages, or null if validation passes
