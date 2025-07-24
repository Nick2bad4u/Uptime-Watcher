# Interface: SitesActions

Defined in: [src/stores/sites/types.ts:7](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L7)

## Properties

### addMonitorToSite()

> **addMonitorToSite**: (`siteId`, `monitor`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:9](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L9)

Add a monitor to an existing site

#### Parameters

##### siteId

`string`

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

#### Returns

`Promise`\<`void`\>

***

### addSite()

> **addSite**: (`site`) => `void`

Defined in: [src/stores/sites/types.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L11)

Add a site to the store

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### checkSiteNow()

> **checkSiteNow**: (`siteId`, `monitorId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L13)

Check a site now

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### createSite()

> **createSite**: (`siteData`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L15)

Create a new site

#### Parameters

##### siteData

###### identifier

`string`

###### monitors?

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

###### name?

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteSite()

> **deleteSite**: (`identifier`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L17)

Delete a site

#### Parameters

##### identifier

`string`

#### Returns

`Promise`\<`void`\>

***

### downloadSQLiteBackup()

> **downloadSQLiteBackup**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L19)

Download SQLite backup

#### Returns

`Promise`\<`void`\>

***

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L21)

Full sync from backend

#### Returns

`Promise`\<`void`\>

***

### getSelectedMonitorId()

> **getSelectedMonitorId**: (`siteId`) => `undefined` \| `string`

Defined in: [src/stores/sites/types.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L23)

Get selected monitor ID for a site

#### Parameters

##### siteId

`string`

#### Returns

`undefined` \| `string`

***

### getSelectedSite()

> **getSelectedSite**: () => `undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/stores/sites/types.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L25)

Get the currently selected site

#### Returns

`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)

***

### getSyncStatus()

> **getSyncStatus**: () => `Promise`\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

Defined in: [src/stores/sites/types.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L27)

Get sync status

#### Returns

`Promise`\<\` `lastSync`: `undefined` \| `null` \| `number`; `siteCount`: `number`; `success`: `boolean`; `synchronized`: `boolean`; \`\>

***

### initializeSites()

> **initializeSites**: () => `Promise`\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

Defined in: [src/stores/sites/types.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L34)

Initialize sites data from backend

#### Returns

`Promise`\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

***

### modifySite()

> **modifySite**: (`identifier`, `updates`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L36)

Modify an existing site

#### Parameters

##### identifier

`string`

##### updates

`Partial`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`Promise`\<`void`\>

***

### removeMonitorFromSite()

> **removeMonitorFromSite**: (`siteId`, `monitorId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L38)

Remove a monitor from a site

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### removeSite()

> **removeSite**: (`identifier`) => `void`

Defined in: [src/stores/sites/types.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L40)

Remove a site from the store

#### Parameters

##### identifier

`string`

#### Returns

`void`

***

### setSelectedMonitorId()

> **setSelectedMonitorId**: (`siteId`, `monitorId`) => `void`

Defined in: [src/stores/sites/types.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L42)

Set selected monitor ID for a site

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`void`

***

### setSelectedSite()

> **setSelectedSite**: (`site`) => `void`

Defined in: [src/stores/sites/types.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L44)

Set selected site

#### Parameters

##### site

`undefined` | [`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/types.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L46)

Set sites data

#### Parameters

##### sites

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`

***

### startSiteMonitoring()

> **startSiteMonitoring**: (`siteId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L48)

Start monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

`Promise`\<`void`\>

***

### startSiteMonitorMonitoring()

> **startSiteMonitorMonitoring**: (`siteId`, `monitorId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L50)

Start monitoring for a site monitor

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### stopSiteMonitoring()

> **stopSiteMonitoring**: (`siteId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L52)

Stop monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

`Promise`\<`void`\>

***

### stopSiteMonitorMonitoring()

> **stopSiteMonitorMonitoring**: (`siteId`, `monitorId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L54)

Stop monitoring for a site monitor

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### subscribeToStatusUpdates()

> **subscribeToStatusUpdates**: (`callback`) => `void`

Defined in: [src/stores/sites/types.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L56)

Subscribe to status updates

#### Parameters

##### callback

(`update`) => `void`

#### Returns

`void`

***

### subscribeToSyncEvents()

> **subscribeToSyncEvents**: () => () => `void`

Defined in: [src/stores/sites/types.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L58)

Subscribe to sync events

#### Returns

> (): `void`

##### Returns

`void`

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L60)

Sync sites from backend

#### Returns

`Promise`\<`void`\>

***

### unsubscribeFromStatusUpdates()

> **unsubscribeFromStatusUpdates**: () => `void`

Defined in: [src/stores/sites/types.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L62)

Unsubscribe from status updates

#### Returns

`void`

***

### updateMonitorRetryAttempts()

> **updateMonitorRetryAttempts**: (`siteId`, `monitorId`, `retryAttempts`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L64)

Update monitor retry attempts

#### Parameters

##### siteId

`string`

##### monitorId

`string`

##### retryAttempts

`number`

#### Returns

`Promise`\<`void`\>

***

### updateMonitorTimeout()

> **updateMonitorTimeout**: (`siteId`, `monitorId`, `timeout`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L66)

Update monitor timeout

#### Parameters

##### siteId

`string`

##### monitorId

`string`

##### timeout

`number`

#### Returns

`Promise`\<`void`\>

***

### updateSiteCheckInterval()

> **updateSiteCheckInterval**: (`siteId`, `monitorId`, `interval`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/types.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/types.ts#L68)

Update site check interval

#### Parameters

##### siteId

`string`

##### monitorId

`string`

##### interval

`number`

#### Returns

`Promise`\<`void`\>
