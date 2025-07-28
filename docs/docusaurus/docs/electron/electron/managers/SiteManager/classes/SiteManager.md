# Class: SiteManager

Defined in: [electron/managers/SiteManager.ts:144](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L144)

Manages site operations and maintains in-memory cache.

## Remarks

The SiteManager is the central coordinator for all site-related operations
in the uptime monitoring system. It provides a high-level API that abstracts
the complexity of database operations, cache management, and cross-component
coordination while ensuring data consistency and performance.

The manager maintains a synchronized in-memory cache of all sites for fast
access patterns while ensuring all mutations go through proper database
transactions. Event emission keeps other system components informed of
site changes and enables reactive UI updates.

## Constructors

### Constructor

> **new SiteManager**(`dependencies`): `SiteManager`

Defined in: [electron/managers/SiteManager.ts:173](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L173)

Constructs a new SiteManager instance.

#### Parameters

##### dependencies

[`SiteManagerDependencies`](../interfaces/SiteManagerDependencies.md)

Required dependencies for site management operations.

#### Returns

`SiteManager`

#### Remarks

Initializes the SiteManager with all required dependencies including repositories,
database service, event emitter, and optional monitoring operations. Creates
internal service orchestrators for coordinated operations and sets up the
in-memory cache for performance optimization.

#### Example

```typescript
const siteManager = new SiteManager({ ... });
```

## Methods

### addSite()

> **addSite**(`siteData`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:231](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L231)

Adds a new site to the database and cache.

#### Parameters

##### siteData

[`Site`](../../../../shared/types/interfaces/Site.md)

The site data to add.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

The newly added site object.

#### Throws

If site validation fails or database operation fails.

#### Example

```typescript
const site = await siteManager.addSite(siteData);
```

***

### getSiteFromCache()

> **getSiteFromCache**(`identifier`): `undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

Defined in: [electron/managers/SiteManager.ts:272](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L272)

Gets a specific site from cache with smart background loading.

#### Parameters

##### identifier

`string`

The site identifier to retrieve.

#### Returns

`undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

The site object if found in cache, otherwise undefined.

#### Remarks

If the site is not found in cache, triggers background loading and emits a cache miss event.

#### Example

```typescript
const site = siteManager.getSiteFromCache("site_123");
```

***

### getSites()

> **getSites**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/managers/SiteManager.ts:313](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L313)

Gets all sites from the database with full monitor and history data.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to array of complete site objects.

#### Throws

If database operation fails.

#### Remarks

Retrieves all sites from the database including their associated monitors
and status history. This operation also updates the cache to ensure it
stays synchronized with the database. Use this method when you need
guaranteed fresh data or during cache refresh operations.

#### Example

```typescript
const allSites = await siteManager.getSites();
console.log(`Found ${allSites.length} sites`);
```

***

### getSitesCache()

> **getSitesCache**(): [`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:327](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L327)

Gets the standardized sites cache (for internal use by other managers).

#### Returns

[`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

The standardized cache instance for sites.

#### Remarks

Used for internal coordination between managers. External consumers should use getSites().

***

### getSitesFromCache()

> **getSitesFromCache**(): [`Site`](../../../../shared/types/interfaces/Site.md)[]

Defined in: [electron/managers/SiteManager.ts:344](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L344)

Gets sites from in-memory cache for fast access.

#### Returns

[`Site`](../../../../shared/types/interfaces/Site.md)[]

Array of site objects currently in cache.

#### Remarks

Returns the in-memory cache containing all sites for high-performance
access patterns. The cache is automatically synchronized with database
changes through event handling. Use this for internal operations and
when performance is critical.

Internal use only - external components should use getSites() for
guaranteed fresh data or subscribe to cache update events.

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:360](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L360)

Initializes the SiteManager by loading all sites into cache.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when initialization is complete.

#### Throws

If loading sites from database fails.

#### Remarks

This method should be called during application startup.

#### Example

```typescript
await siteManager.initialize();
```

***

### removeMonitor()

> **removeMonitor**(`siteIdentifier`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:384](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L384)

Removes a monitor from a site.

#### Parameters

##### siteIdentifier

`string`

The identifier of the site.

##### monitorId

`string`

The monitor ID to remove.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

True if the monitor was removed, false otherwise.

#### Throws

If database or cache update fails.

#### Example

```typescript
const success = await siteManager.removeMonitor("site_123", "monitor_456");
```

***

### removeSite()

> **removeSite**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:438](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L438)

Removes a site from the database and cache.

#### Parameters

##### identifier

`string`

The site identifier to remove.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

True if the site was removed, false otherwise.

#### Throws

If database or cache update fails.

#### Example

```typescript
const success = await siteManager.removeSite("site_123");
```

***

### updateSite()

> **updateSite**(`identifier`, `updates`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:478](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L478)

Updates a site in the database and cache.

#### Parameters

##### identifier

`string`

The site identifier to update.

##### updates

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Partial site data to update.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

The updated site object.

#### Throws

If validation, database, or cache update fails.

#### Example

```typescript
const updatedSite = await siteManager.updateSite("site_123", { name: "New Name" });
```

***

### updateSitesCache()

> **updateSitesCache**(`sites`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:558](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L558)

Updates the sites cache with new data, replacing all existing entries atomically.

#### Parameters

##### sites

[`Site`](../../../../shared/types/interfaces/Site.md)[]

Array of [Site](../../../../shared/types/interfaces/Site.md) objects to update the cache with.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when cache update is complete.

#### Remarks

Uses a temporary cache for atomic replacement to ensure consistency and avoid partial updates. Emits a cache-updated event after completion.

#### Example

```typescript
await siteManager.updateSitesCache(sitesArray);
```
