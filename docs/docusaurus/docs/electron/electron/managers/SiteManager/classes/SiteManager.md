# Class: SiteManager

Defined in: [electron/managers/SiteManager.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L130)

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

Defined in: [electron/managers/SiteManager.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L153)

Create a new SiteManager instance.

#### Parameters

##### dependencies

[`SiteManagerDependencies`](../interfaces/SiteManagerDependencies.md)

Required dependencies for site management operations

#### Returns

`SiteManager`

#### Remarks

Initializes the SiteManager with all required dependencies including repositories,
database service, event emitter, and optional monitoring operations. Creates
internal service orchestrators for coordinated operations and sets up the
in-memory cache for performance optimization.

## Methods

### addSite()

> **addSite**(`siteData`): `Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:203](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L203)

Add a new site to the database and cache.

#### Parameters

##### siteData

[`Site`](../../../../shared/types/interfaces/Site.md)

#### Returns

`Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

***

### getSiteFromCache()

> **getSiteFromCache**(`identifier`): `undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

Defined in: [electron/managers/SiteManager.ts:235](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L235)

Get a specific site from cache with smart background loading.

#### Parameters

##### identifier

`string`

#### Returns

`undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

***

### getSites()

> **getSites**(): `Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/managers/SiteManager.ts:277](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L277)

Get all sites from database with full monitor and history data.

#### Returns

`Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to array of complete site objects

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

Defined in: [electron/managers/SiteManager.ts:287](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L287)

Get the standardized sites cache (for internal use by other managers).

#### Returns

[`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

***

### getSitesFromCache()

> **getSitesFromCache**(): [`Site`](../../../../shared/types/interfaces/Site.md)[]

Defined in: [electron/managers/SiteManager.ts:305](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L305)

Get sites from in-memory cache for fast access.

#### Returns

[`Site`](../../../../shared/types/interfaces/Site.md)[]

The current site cache instance

#### Remarks

Returns the in-memory cache containing all sites for high-performance
access patterns. The cache is automatically synchronized with database
changes through event handling. Use this for internal operations and
when performance is critical.

Internal use only - external components should use getSites() for
guaranteed fresh data or subscribe to cache update events.

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [electron/managers/SiteManager.ts:313](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L313)

Initialize the SiteManager by loading all sites into cache.
This method should be called during application startup.

#### Returns

`Promise`\<`void`\>

***

### removeMonitor()

> **removeMonitor**(`siteIdentifier`, `monitorId`): `Promise`\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:328](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L328)

Remove a monitor from a site.

#### Parameters

##### siteIdentifier

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### removeSite()

> **removeSite**(`identifier`): `Promise`\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:374](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L374)

Remove a site from the database and cache.

#### Parameters

##### identifier

`string`

#### Returns

`Promise`\<`boolean`\>

***

### updateSite()

> **updateSite**(`identifier`, `updates`): `Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/SiteManager.ts:405](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L405)

Update a site in the database and cache.

#### Parameters

##### identifier

`string`

##### updates

`Partial`\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

#### Returns

`Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

***

### updateSitesCache()

> **updateSitesCache**(`sites`): `Promise`\<`void`\>

Defined in: [electron/managers/SiteManager.ts:474](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/SiteManager.ts#L474)

Update the sites cache with new data.

#### Parameters

##### sites

[`Site`](../../../../shared/types/interfaces/Site.md)[]

#### Returns

`Promise`\<`void`\>
