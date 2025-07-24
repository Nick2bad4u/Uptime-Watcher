# Interface: SiteSyncActions

Defined in: [src/stores/sites/useSiteSync.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSiteSync.ts#L17)

## Properties

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSiteSync.ts#L19)

Full sync from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getSyncStatus()

> **getSyncStatus**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

Defined in: [src/stores/sites/useSiteSync.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSiteSync.ts#L21)

Get sync status

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

***

### subscribeToStatusUpdates()

> **subscribeToStatusUpdates**: (`callback`) => `object`

Defined in: [src/stores/sites/useSiteSync.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSiteSync.ts#L28)

Subscribe to status updates

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

Defined in: [src/stores/sites/useSiteSync.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSiteSync.ts#L34)

Subscribe to sync events

#### Returns

> (): `void`

##### Returns

`void`

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSiteSync.ts#L36)

Sync sites from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### unsubscribeFromStatusUpdates()

> **unsubscribeFromStatusUpdates**: () => `object`

Defined in: [src/stores/sites/useSiteSync.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSiteSync.ts#L38)

Unsubscribe from status updates

#### Returns

`object`

##### message

> **message**: `string`

##### success

> **success**: `boolean`

##### unsubscribed

> **unsubscribed**: `boolean`
