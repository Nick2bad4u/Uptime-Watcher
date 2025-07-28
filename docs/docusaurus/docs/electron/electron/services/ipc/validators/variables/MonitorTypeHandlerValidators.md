# Variable: MonitorTypeHandlerValidators

> `const` **MonitorTypeHandlerValidators**: `object`

Defined in: [electron/services/ipc/validators.ts:392](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/validators.ts#L392)

Parameter validators for monitor type IPC handlers.

## Type declaration

### formatMonitorDetail()

> `readonly` **formatMonitorDetail**: (`params`) => `null` \| `string`[]

Validates parameters for the "format-monitor-detail" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects two parameters: monitor type (string) and details (string).

### formatMonitorTitleSuffix()

> `readonly` **formatMonitorTitleSuffix**: (`params`) => `null` \| `string`[]

Validates parameters for the "format-monitor-title-suffix" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects two parameters: monitor type (string) and monitor object.

### getMonitorTypes()

> `readonly` **getMonitorTypes**: (`params`) => `null` \| `string`[]

Validates parameters for the "get-monitor-types" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### validateMonitorData()

> `readonly` **validateMonitorData**: (`params`) => `null` \| `string`[]

Validates parameters for the "validate-monitor-data" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects two parameters: monitor type (string) and data (any).
Only the monitor type is validated for type.

## Remarks

Each property is a validator for a specific monitor type-related IPC channel.
