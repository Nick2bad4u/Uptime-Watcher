# Class: SiteManager

Defined in: [electron/managers/SiteManager.ts:173](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L173)

## Remarks

The SiteManager is the central coordinator for all site-related operations in
the uptime monitoring system. It provides a high-level API that abstracts the
complexity of database operations, cache management, and cross-component
coordination while ensuring data consistency and performance.

The manager maintains a synchronized in-memory cache of all sites for fast
access patterns while ensuring all mutations go through proper database
transactions. Event emission keeps other system components informed of site
changes and enables reactive UI updates.

Manages site operations and maintains in-memory cache.

## Constructors

### Constructor

> **new SiteManager**(`dependencies`): `SiteManager`

Defined in: [electron/managers/SiteManager.ts:740](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L740)

Constructs a new SiteManager instance.

#### Parameters

##### dependencies

[`SiteManagerDependencies`](../interfaces/SiteManagerDependencies.md)

Required dependencies for site management
  operations.

#### Returns

`SiteManager`

#### Remarks

Initializes the SiteManager with all required dependencies including
repositories, database service, event emitter, and optional monitoring
operations. Creates internal service orchestrators for coordinated
operations and sets up the in-memory cache for performance optimization.

#### Example

```typescript
const siteManager = new SiteManager({ ... });
```

## Methods

### addSite()

> **addSite**(`siteData`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:209](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L209)

Adds a new site to the database and cache.

#### Parameters

##### siteData

[`Site`](../../../../shared/types/interfaces/Site.md)

The site data to add.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

The newly added site object.

#### Example

```typescript
const site = await siteManager.addSite(siteData);
```

#### Throws

If site validation fails or database operation fails.

***

### getSites()

> **getSites**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/managers/SiteManager.ts:263](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L263)

Gets all sites from the database with full monitor and history data.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to array of complete site objects.

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

#### Throws

If database operation fails.

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:286](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L286)

Initializes the SiteManager by loading all sites into cache.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when initialization is complete.

#### Remarks

This method should be called during application startup.

#### Example

```typescript
await siteManager.initialize();
```

#### Throws

If loading sites from database fails.

***

### removeMonitor()

> **removeMonitor**(`siteIdentifier`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:326](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L326)

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

#### Example

```typescript
const success = await siteManager.removeMonitor(
    "site_123",
    "monitor_456"
);
```

#### Throws

If database or cache update fails.

***

### removeSite()

> **removeSite**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:406](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L406)

Removes a site from the database and cache.

#### Parameters

##### identifier

`string`

The site identifier to remove.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

True if the site was removed, false otherwise.

#### Example

```typescript
const success = await siteManager.removeSite("site_123");
```

#### Throws

If database or cache update fails.

***

### updateSite()

> **updateSite**(`identifier`, `updates`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:455](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L455)

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

#### Example

```typescript
const updatedSite = await siteManager.updateSite("site_123", {
    name: "New Name",
});
```

#### Throws

If validation, database, or cache update fails.

***

### updateSitesCache()

> **updateSitesCache**(`sites`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:560](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L560)

Updates the sites cache with new data, replacing all existing entries
atomically.

#### Parameters

##### sites

[`Site`](../../../../shared/types/interfaces/Site.md)[]

Array of [Site](../../../../shared/types/interfaces/Site.md) objects to update the cache with.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when cache update is complete.

#### Remarks

Uses a temporary cache for atomic replacement to ensure consistency and
avoid partial updates. Emits a cache-updated event after completion.

#### Example

```typescript
await siteManager.updateSitesCache(sitesArray);
```

***

### getSiteFromCache()

> **getSiteFromCache**(`identifier`): `undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

Defined in: [electron/managers/SiteManager.ts:804](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L804)

Gets a specific site from cache with smart background loading.

#### Parameters

##### identifier

`string`

The site identifier to retrieve.

#### Returns

`undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

The site object if found in cache, otherwise undefined.

#### Remarks

If the site is not found in cache, triggers background loading and emits
a cache miss event.

#### Example

```typescript
const site = siteManager.getSiteFromCache("site_123");
```

***

### getSitesCache()

> **getSitesCache**(): [`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:850](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L850)

Gets the standardized sites cache (for internal use by other managers).

#### Returns

[`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

The standardized cache instance for sites.

#### Remarks

Used for internal coordination between managers. External consumers
should use getSites().

***

### getSitesFromCache()

> **getSitesFromCache**(): [`Site`](../../../../shared/types/interfaces/Site.md)[]

Defined in: [electron/managers/SiteManager.ts:868](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L868)

Gets sites from in-memory cache for fast access.

#### Returns

[`Site`](../../../../shared/types/interfaces/Site.md)[]

Array of site objects currently in cache.

#### Remarks

Returns the in-memory cache containing all sites for high-performance
access patterns. The cache is automatically synchronized with database
changes through event handling. Use this for internal operations and when
performance is critical.

Internal use only - external components should use getSites() for
guaranteed fresh data or subscribe to cache update events.
