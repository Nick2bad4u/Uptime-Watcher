# Interface: SiteOperationsActions

Defined in: [src/stores/sites/useSiteOperations.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L19)

## Properties

### addMonitorToSite()

> **addMonitorToSite**: (`siteId`, `monitor`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L21)

Add a monitor to an existing site

#### Parameters

##### siteId

`string`

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

#### Returns

`Promise`\<`void`\>

***

### createSite()

> **createSite**: (`siteData`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L23)

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

`Promise`\<`void`\>

***

### deleteSite()

> **deleteSite**: (`identifier`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L30)

Delete a site

#### Parameters

##### identifier

`string`

#### Returns

`Promise`\<`void`\>

***

### downloadSQLiteBackup()

> **downloadSQLiteBackup**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L32)

Download SQLite backup

#### Returns

`Promise`\<`void`\>

***

### initializeSites()

> **initializeSites**: () => `Promise`\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

Defined in: [src/stores/sites/useSiteOperations.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L34)

Initialize sites data from backend

#### Returns

`Promise`\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

***

### modifySite()

> **modifySite**: (`identifier`, `updates`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L36)

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

Defined in: [src/stores/sites/useSiteOperations.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L38)

Remove a monitor from a site

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### updateMonitorRetryAttempts()

> **updateMonitorRetryAttempts**: (`siteId`, `monitorId`, `retryAttempts`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L40)

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

Defined in: [src/stores/sites/useSiteOperations.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L42)

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

Defined in: [src/stores/sites/useSiteOperations.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L44)

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
