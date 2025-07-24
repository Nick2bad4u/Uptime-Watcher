# Interface: SiteSyncActions

Defined in: [src/stores/sites/useSiteSync.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteSync.ts#L17)

## Properties

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteSync.ts#L19)

Full sync from backend

#### Returns

`Promise`\<`void`\>

***

### getSyncStatus()

> **getSyncStatus**: () => `Promise`\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

Defined in: [src/stores/sites/useSiteSync.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteSync.ts#L21)

Get sync status

#### Returns

`Promise`\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

***

### subscribeToStatusUpdates()

> **subscribeToStatusUpdates**: (`callback`) => `object`

Defined in: [src/stores/sites/useSiteSync.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteSync.ts#L28)

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

Defined in: [src/stores/sites/useSiteSync.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteSync.ts#L34)

Subscribe to sync events

#### Returns

> (): `void`

##### Returns

`void`

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteSync.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteSync.ts#L36)

Sync sites from backend

#### Returns

`Promise`\<`void`\>

***

### unsubscribeFromStatusUpdates()

> **unsubscribeFromStatusUpdates**: () => `object`

Defined in: [src/stores/sites/useSiteSync.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteSync.ts#L38)

Unsubscribe from status updates

#### Returns

`object`

##### message

> **message**: `string`

##### success

> **success**: `boolean`

##### unsubscribed

> **unsubscribed**: `boolean`
