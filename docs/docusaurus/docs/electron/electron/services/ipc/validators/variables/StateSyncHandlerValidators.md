# Variable: StateSyncHandlerValidators

> `const` **StateSyncHandlerValidators**: `object`

Defined in: [electron/services/ipc/validators.ts:500](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/validators.ts#L500)

Parameter validators for state synchronization IPC handlers.

## Type declaration

### getSyncStatus()

> `readonly` **getSyncStatus**: (`params`) => `null` \| `string`[]

Validates parameters for the "get-sync-status" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

### requestFullSync()

> `readonly` **requestFullSync**: (`params`) => `null` \| `string`[]

Validates parameters for the "request-full-sync" IPC handler.

#### Parameters

##### params

`unknown`[]

The parameters passed to the handler.

#### Returns

`null` \| `string`[]

`null` if valid, or an array of error messages.

#### Remarks

Expects no parameters.

## Remarks

Each property is a validator for a specific state sync-related IPC channel.
