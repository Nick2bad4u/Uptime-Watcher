# Variable: DataHandlerValidators

> `const` **DataHandlerValidators**: `object`

Defined in: [electron/services/ipc/validators.ts:282](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/validators.ts#L282)

Parameter validators for data management IPC handlers.

## Type declaration

### downloadSqliteBackup()

> `readonly` **downloadSqliteBackup**: (`params`) => `null` \| `string`[]

Validates parameters for the "download-sqlite-backup" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### exportData()

> `readonly` **exportData**: (`params`) => `null` \| `string`[]

Validates parameters for the "export-data" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### getHistoryLimit()

> `readonly` **getHistoryLimit**: (`params`) => `null` \| `string`[]

Validates parameters for the "get-history-limit" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### importData()

> `readonly` **importData**: (`params`) => `null` \| `string`[]

Validates parameters for the "import-data" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects a single parameter: the data string.

### resetSettings()

> `readonly` **resetSettings**: (`params`) => `null` \| `string`[]

Validates parameters for the "reset-settings" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### updateHistoryLimit()

> `readonly` **updateHistoryLimit**: (`params`) => `null` \| `string`[]

Validates parameters for the "update-history-limit" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects a single parameter: the new history limit (number).

## Remarks

Each property is a validator for a specific data-related IPC channel.
