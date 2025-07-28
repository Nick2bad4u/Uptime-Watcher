# Variable: SiteService

> `const` **SiteService**: `object`

Defined in: [src/stores/sites/services/SiteService.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/services/SiteService.ts#L15)

## Type declaration

### addSite()

> **addSite**(`site`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../../shared/types/interfaces/Site.md)\>

Adds a new site to the backend.

#### Parameters

##### site

[`Site`](../../../../../../shared/types/interfaces/Site.md)

The site object to add.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../../shared/types/interfaces/Site.md)\>

The newly created site object as returned by the backend.

#### Throws

If the electron API is unavailable or the backend operation fails.

#### Example

```typescript
const newSite = await SiteService.addSite({ name: "Example", url: "https://example.com" });
```

### checkSiteNow()

> **checkSiteNow**(`siteId`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Triggers an immediate check for a site's monitor.

#### Parameters

##### siteId

`string`

The identifier of the site to check.

##### monitorId

`string`

The identifier of the monitor to check.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the check is triggered.

#### Throws

If the electron API is unavailable or the backend operation fails.

#### Example

```typescript
await SiteService.checkSiteNow("site123", "monitor456");
```

### downloadSQLiteBackup()

> **downloadSQLiteBackup**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer); `fileName`: `string`; \`\>

Downloads a backup of the SQLite database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer); `fileName`: `string`; \`\>

An object containing the backup buffer and the file name.

#### Throws

If the electron API is unavailable or the backup operation fails.

#### Example

```typescript
const backup = await SiteService.downloadSQLiteBackup();
```

### getSites()

> **getSites**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../../shared/types/interfaces/Site.md)[]\>

Retrieves all sites from the backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../../shared/types/interfaces/Site.md)[]\>

An array of site objects.

#### Throws

If the electron API is unavailable or the backend operation fails.

#### Example

```typescript
const sites = await SiteService.getSites();
```

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Ensures the electron API is available before making backend calls.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the electron API is ready.

#### Throws

If the electron API is not available.

#### Remarks

This method should be called before any backend operation.

### removeMonitor()

> **removeMonitor**(`siteIdentifier`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Removes a monitor from a site.

#### Parameters

##### siteIdentifier

`string`

The identifier of the site.

##### monitorId

`string`

The identifier of the monitor to remove.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the monitor is removed.

#### Throws

If the electron API is unavailable or the backend operation fails.

#### Example

```typescript
await SiteService.removeMonitor("site123", "monitor456");
```

### removeSite()

> **removeSite**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Removes a site from the backend.

#### Parameters

##### identifier

`string`

The identifier of the site to remove.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the site is removed.

#### Throws

If the electron API is unavailable or the backend operation fails.

#### Example

```typescript
await SiteService.removeSite("site123");
```

### updateSite()

> **updateSite**(`identifier`, `updates`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Updates an existing site with the provided changes.

#### Parameters

##### identifier

`string`

The identifier of the site to update.

##### updates

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../../../shared/types/interfaces/Site.md)\>

Partial site object containing fields to update.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the site is updated.

#### Throws

If the electron API is unavailable or the backend operation fails.

#### Example

```typescript
await SiteService.updateSite("site123", { name: "New Name" });
```
