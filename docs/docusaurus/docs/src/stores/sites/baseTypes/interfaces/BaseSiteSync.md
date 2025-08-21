# Interface: BaseSiteSync

Defined in: [src/stores/sites/baseTypes.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L75)

Common site synchronization operations interface. Shared between different
sync-related modules.

## Properties

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L77)

Full sync from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getSyncStatus()

> **getSyncStatus**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

Defined in: [src/stores/sites/baseTypes.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L79)

Get sync status

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

***

### subscribeToSyncEvents()

> **subscribeToSyncEvents**: () => () => `void`

Defined in: [src/stores/sites/baseTypes.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L86)

Subscribe to sync events

#### Returns

> (): `void`

##### Returns

`void`

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L88)

Sync sites from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
