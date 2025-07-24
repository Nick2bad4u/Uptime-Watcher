# Variable: SiteService

> `const` **SiteService**: `object`

Defined in: [src/stores/sites/services/SiteService.ts:10](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/services/SiteService.ts#L10)

## Type declaration

### addSite()

> **addSite**(`site`): `Promise`\<[`Site`](../../../../../../shared/types/interfaces/Site.md)\>

Add a new site

#### Parameters

##### site

[`Site`](../../../../../../shared/types/interfaces/Site.md)

#### Returns

`Promise`\<[`Site`](../../../../../../shared/types/interfaces/Site.md)\>

### checkSiteNow()

> **checkSiteNow**(`siteId`, `monitorId`): `Promise`\<`void`\>

Check a site now

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

### downloadSQLiteBackup()

> **downloadSQLiteBackup**(): `Promise`\<\` `buffer`: `ArrayBuffer`; `fileName`: `string`; \`\>

Download SQLite backup

#### Returns

`Promise`\<\` `buffer`: `ArrayBuffer`; `fileName`: `string`; \`\>

### getSites()

> **getSites**(): `Promise`\<[`Site`](../../../../../../shared/types/interfaces/Site.md)[]\>

Get all sites from the backend

#### Returns

`Promise`\<[`Site`](../../../../../../shared/types/interfaces/Site.md)[]\>

### initialize()

> **initialize**(): `Promise`\<`void`\>

Initialize the service by ensuring electron API is available

#### Returns

`Promise`\<`void`\>

### removeMonitor()

> **removeMonitor**(`siteIdentifier`, `monitorId`): `Promise`\<`void`\>

Remove a monitor from a site

#### Parameters

##### siteIdentifier

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

### removeSite()

> **removeSite**(`identifier`): `Promise`\<`void`\>

Remove a site

#### Parameters

##### identifier

`string`

#### Returns

`Promise`\<`void`\>

### updateSite()

> **updateSite**(`identifier`, `updates`): `Promise`\<`void`\>

Update an existing site

#### Parameters

##### identifier

`string`

##### updates

`Partial`\<[`Site`](../../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`Promise`\<`void`\>
