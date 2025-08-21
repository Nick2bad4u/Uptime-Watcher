# Interface: BaseSiteOperations

Defined in: [src/stores/sites/baseTypes.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L12)

Common site CRUD operations interface. Used by both SiteOperationsActions and
SitesActions to eliminate duplication.

## Extended by

- [`SiteOperationsActions`](../../useSiteOperations/interfaces/SiteOperationsActions.md)

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

***

### downloadSQLiteBackup()

> **downloadSQLiteBackup**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L25)

Download SQLite backup

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

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
