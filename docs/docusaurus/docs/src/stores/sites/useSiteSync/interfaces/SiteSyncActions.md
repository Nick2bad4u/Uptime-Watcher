# Interface: SiteSyncActions

Defined in: [src/stores/sites/useSiteSync.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L40)

Site synchronization actions interface.

## Remarks

Defines all available site synchronization operations that can be performed.
These actions are designed to work within the Zustand store architecture and
provide consistent error handling and logging.

## Properties

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L51)

Performs a complete synchronization from the backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when synchronization is complete

#### Remarks

Triggers a full sync operation that updates all local site data with the
latest information from the backend. This is typically used during
application startup or when recovering from errors.

***

### getSyncStatus()

> **getSyncStatus**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

Defined in: [src/stores/sites/useSiteSync.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L68)

Retrieves current synchronization status from the backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

Promise resolving to sync status information

#### Remarks

Provides detailed information about the sync state including:

- Last synchronization timestamp
- Current site count
- Overall synchronization status
- Success/failure indicators

Uses `safeExtractIpcData` to handle IPC response safely.

***

### subscribeToStatusUpdates()

> **subscribeToStatusUpdates**: (`callback`) => `object`

Defined in: [src/stores/sites/useSiteSync.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L94)

Establishes subscription to real-time status updates.

#### Parameters

##### callback

(`update`) => `void`

Function to call when status updates are received

#### Returns

Subscription result with success indicators

##### message

> **message**: `string`

Human-readable description of the operation

##### subscribed

> **subscribed**: `boolean`

Whether subscription was successful

##### success

> **success**: `boolean`

Overall operation success status

#### Remarks

Sets up event listeners for monitor status changes from the backend. Uses
the shared StatusUpdateManager to handle:

- Race condition prevention
- Fallback mechanisms
- Efficient incremental updates

***

### subscribeToSyncEvents()

> **subscribeToSyncEvents**: () => () => `void`

Defined in: [src/stores/sites/useSiteSync.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L118)

Establishes subscription to backend synchronization events.

#### Returns

Cleanup function to remove event listeners

> (): `void`

##### Returns

`void`

#### Remarks

Listens for various sync events including:

- Bulk synchronization events
- Individual site updates
- Site deletions

Automatically handles different event types and triggers appropriate
local state updates.

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:132](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L132)

Synchronizes all sites from the backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when sync is complete

#### Remarks

Fetches the latest site data from the backend and updates the local store
state. Includes comprehensive error handling and logging for debugging
purposes.

This is the core synchronization method used by other sync operations.

***

### unsubscribeFromStatusUpdates()

> **unsubscribeFromStatusUpdates**: () => `object`

Defined in: [src/stores/sites/useSiteSync.ts:144](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L144)

Removes subscription to status updates.

#### Returns

Unsubscription result with success indicators

##### message

> **message**: `string`

Human-readable description of the operation

##### success

> **success**: `boolean`

Overall operation success status

##### unsubscribed

> **unsubscribed**: `boolean`

Whether unsubscription was successful

#### Remarks

Cleanly unsubscribes from status update events and releases associated
resources. Should be called when components unmount or when status
updates are no longer needed.
