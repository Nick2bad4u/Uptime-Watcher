# Function: useBackendFocusSync()

> **useBackendFocusSync**(`enabled`): `void`

Defined in: [src/hooks/useBackendFocusSync.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useBackendFocusSync.ts#L17)

useBackendFocusSync
Adds a window focus event listener that triggers fullSyncFromBackend when enabled.
This is useful for ensuring data consistency when the user returns to the app.

## Parameters

### enabled

`boolean` = `false`

Set to true to enable focus-based backend sync (default: false)

## Returns

`void`
