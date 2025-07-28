# Variable: MonitoringHandlerValidators

> `const` **MonitoringHandlerValidators**: `object`

Defined in: [electron/services/ipc/validators.ts:155](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/validators.ts#L155)

Parameter validators for monitoring control IPC handlers.

## Type declaration

### checkSiteNow()

> `readonly` **checkSiteNow**: (`params`) => `null` \| `string`[]

Validates parameters for the "check-site-now" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects two parameters: site identifier and monitor ID (both strings).

### startMonitoring()

> `readonly` **startMonitoring**: (`params`) => `null` \| `string`[]

Validates parameters for the "start-monitoring" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### startMonitoringForSite()

> `readonly` **startMonitoringForSite**: (`params`) => `null` \| `string`[]

Validates parameters for the "start-monitoring-for-site" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects one or two parameters: site identifier (string), and optional monitor ID (string).

### stopMonitoring()

> `readonly` **stopMonitoring**: (`params`) => `null` \| `string`[]

Validates parameters for the "stop-monitoring" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### stopMonitoringForSite()

> `readonly` **stopMonitoringForSite**: (`params`) => `null` \| `string`[]

Validates parameters for the "stop-monitoring-for-site" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects one or two parameters: site identifier (string), and optional monitor ID (string).

## Remarks

Each property is a validator for a specific monitoring-related IPC channel.
