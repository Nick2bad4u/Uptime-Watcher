# Variable: IpcValidators

> `const` **IpcValidators**: `object`

Defined in: [electron/services/ipc/utils.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/utils.ts#L18)

Standard parameter validation utilities for common IPC operations.

## Type declaration

### optionalString()

> `readonly` **optionalString**: (`value`, `paramName`) => `null` \| `string`

Validates an optional string parameter.

#### Parameters

##### value

`unknown`

Value to validate

##### paramName

`string`

Parameter name for error messages

#### Returns

`null` \| `string`

Error message or null if valid

### requiredNumber()

> `readonly` **requiredNumber**: (`value`, `paramName`) => `null` \| `string`

Validates a required number parameter.

#### Parameters

##### value

`unknown`

Value to validate

##### paramName

`string`

Parameter name for error messages

#### Returns

`null` \| `string`

Error message or null if valid

### requiredObject()

> `readonly` **requiredObject**: (`value`, `paramName`) => `null` \| `string`

Validates a required object parameter.

#### Parameters

##### value

`unknown`

Value to validate

##### paramName

`string`

Parameter name for error messages

#### Returns

`null` \| `string`

Error message or null if valid

### requiredString()

> `readonly` **requiredString**: (`value`, `paramName`) => `null` \| `string`

Validates a required string parameter.

#### Parameters

##### value

`unknown`

Value to validate

##### paramName

`string`

Parameter name for error messages

#### Returns

`null` \| `string`

Error message or null if valid
