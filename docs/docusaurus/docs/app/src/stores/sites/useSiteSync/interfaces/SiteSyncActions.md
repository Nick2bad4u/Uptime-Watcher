# Interface: SiteSyncActions

Defined in: [src/stores/sites/useSiteSync.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteSync.ts#L17)

## Properties

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteSync.ts#L22)

Full sync from backend.
Triggers a complete synchronization of all sites from the backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getSyncStatus()

> **getSyncStatus**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

Defined in: [src/stores/sites/useSiteSync.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteSync.ts#L27)

Get sync status.
Retrieves current synchronization status including last sync time and site count.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

***

### subscribeToStatusUpdates()

> **subscribeToStatusUpdates**: (`callback`) => `object`

Defined in: [src/stores/sites/useSiteSync.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteSync.ts#L38)

Subscribe to status updates.
Establishes subscription to monitor status change events from backend.
Uses shared status update manager to handle race conditions and fallback logic.

#### Parameters

##### callback

(`update`) => `void`

#### Returns

`object`

##### message

> **message**: `string`

##### subscribed

> **subscribed**: `boolean`

##### success

> **success**: `boolean`

***

### subscribeToSyncEvents()

> **subscribeToSyncEvents**: () => () => `void`

Defined in: [src/stores/sites/useSiteSync.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteSync.ts#L47)

Subscribe to sync events.
Establishes subscription to backend sync events for bulk updates and single site changes.

#### Returns

> (): `void`

##### Returns

`void`

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteSync.ts#L53)

Sync sites from backend.
Retrieves latest sites data from backend and updates local store state.
Handles error cases and provides centralized error logging.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### unsubscribeFromStatusUpdates()

> **unsubscribeFromStatusUpdates**: () => `object`

Defined in: [src/stores/sites/useSiteSync.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteSync.ts#L58)

Unsubscribe from status updates.
Cleanly removes status update subscription and cleans up event listeners.

#### Returns

`object`

##### message

> **message**: `string`

##### success

> **success**: `boolean`

##### unsubscribed

> **unsubscribed**: `boolean`
