# Interface: SiteOperationsActions

Defined in: [src/stores/sites/useSiteOperations.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteOperations.ts#L28)

Common site CRUD operations interface. Used by both SiteOperationsActions and
SitesActions to eliminate duplication.

## Extends

- [`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md)

## Properties

### addMonitorToSite()

> **addMonitorToSite**: (`siteId`, `monitor`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L14)

Add a monitor to an existing site

#### Parameters

##### siteId

`string`

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`addMonitorToSite`](../../baseTypes/interfaces/BaseSiteOperations.md#addmonitortosite)

***

### createSite()

> **createSite**: (`siteData`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L16)

Create a new site

#### Parameters

##### siteData

###### identifier

`string`

###### monitoring?

`boolean`

###### monitors?

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

###### name?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`createSite`](../../baseTypes/interfaces/BaseSiteOperations.md#createsite)

***

### deleteSite()

> **deleteSite**: (`identifier`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L23)

Delete a site

#### Parameters

##### identifier

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`deleteSite`](../../baseTypes/interfaces/BaseSiteOperations.md#deletesite)

***

### downloadSQLiteBackup()

> **downloadSQLiteBackup**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L25)

Download SQLite backup

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`downloadSQLiteBackup`](../../baseTypes/interfaces/BaseSiteOperations.md#downloadsqlitebackup)

***

### removeMonitorFromSite()

> **removeMonitorFromSite**: (`siteId`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L27)

Remove a monitor from a site

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`removeMonitorFromSite`](../../baseTypes/interfaces/BaseSiteOperations.md#removemonitorfromsite)

***

### updateMonitorRetryAttempts()

> **updateMonitorRetryAttempts**: (`siteId`, `monitorId`, `retryAttempts`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L29)

Update monitor retry attempts

#### Parameters

##### siteId

`string`

##### monitorId

`string`

##### retryAttempts

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`updateMonitorRetryAttempts`](../../baseTypes/interfaces/BaseSiteOperations.md#updatemonitorretryattempts)

***

### updateMonitorTimeout()

> **updateMonitorTimeout**: (`siteId`, `monitorId`, `timeout`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L35)

Update monitor timeout

#### Parameters

##### siteId

`string`

##### monitorId

`string`

##### timeout

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`updateMonitorTimeout`](../../baseTypes/interfaces/BaseSiteOperations.md#updatemonitortimeout)

***

### updateSiteCheckInterval()

> **updateSiteCheckInterval**: (`siteId`, `monitorId`, `interval`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L41)

Update site check interval

#### Parameters

##### siteId

`string`

##### monitorId

`string`

##### interval

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BaseSiteOperations`](../../baseTypes/interfaces/BaseSiteOperations.md).[`updateSiteCheckInterval`](../../baseTypes/interfaces/BaseSiteOperations.md#updatesitecheckinterval)

***

### initializeSites()

> **initializeSites**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

Defined in: [src/stores/sites/useSiteOperations.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteOperations.ts#L30)

Initialize sites data from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

***

### modifySite()

> **modifySite**: (`identifier`, `updates`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteOperations.ts#L36)

Modify an existing site

#### Parameters

##### identifier

`string`

##### updates

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
