# Variable: SiteHandlerValidators

> `const` **SiteHandlerValidators**: `object`

Defined in: [electron/services/ipc/validators.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/validators.ts#L26)

Parameter validators for site management IPC handlers.

## Type declaration

### addSite()

> `readonly` **addSite**: (`params`) => `null` \| `string`[]

Validates parameters for the "add-site" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects a single parameter: a site object.

### getSites()

> `readonly` **getSites**: (`params`) => `null` \| `string`[]

Validates parameters for the "get-sites" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### removeMonitor()

> `readonly` **removeMonitor**: (`params`) => `null` \| `string`[]

Validates parameters for the "remove-monitor" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects two parameters: site identifier and monitor ID (both strings).

### removeSite()

> `readonly` **removeSite**: (`params`) => `null` \| `string`[]

Validates parameters for the "remove-site" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects a single parameter: the site identifier (string).

### updateSite()

> `readonly` **updateSite**: (`params`) => `null` \| `string`[]

Validates parameters for the "update-site" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects two parameters: site identifier (string) and updates (object).

## Remarks

Each property is a validator for a specific site-related IPC channel.
Validators ensure correct parameter count and types for each handler.
