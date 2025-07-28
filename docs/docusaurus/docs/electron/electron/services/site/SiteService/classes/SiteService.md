# Class: SiteService

Defined in: [electron/services/site/SiteService.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/site/SiteService.ts#L37)

Service for coordinating site operations across multiple repositories.

## Remarks

Handles complex operations that require coordination between site, monitor, and history data. Provides atomic deletion, detailed loading, and batch operations for sites and their related entities.

## Constructors

### Constructor

> **new SiteService**(`dependencies`): `SiteService`

Defined in: [electron/services/site/SiteService.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/site/SiteService.ts#L59)

Constructs a new SiteService instance.

#### Parameters

##### dependencies

[`SiteServiceDependencies`](../interfaces/SiteServiceDependencies.md)

The [SiteServiceDependencies](../interfaces/SiteServiceDependencies.md) required for service operations.

#### Returns

`SiteService`

## Methods

### deleteSiteWithRelatedData()

> **deleteSiteWithRelatedData**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/site/SiteService.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/site/SiteService.ts#L77)

Deletes a site and all its related data (monitors and history) atomically.

#### Parameters

##### identifier

`string`

The site identifier to delete.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if all deletions succeeded.

#### Remarks

Uses a transaction to ensure atomicity. Deletes all monitor history, monitors, and the site itself. Throws if any operation fails.

#### Throws

Error when any deletion operation fails.

***

### findByIdentifierWithDetails()

> **findByIdentifierWithDetails**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/services/site/SiteService.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/site/SiteService.ts#L139)

Finds a site by identifier with all related monitors and history data.

#### Parameters

##### identifier

`string`

The site identifier to find.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)\>

Promise resolving to the site with details, or undefined if not found.

#### Remarks

Replaces the complex logic that was previously in SiteRepository. Loads the site, its monitors, and all monitor history in a single operation.

***

### getAllWithDetails()

> **getAllWithDetails**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/services/site/SiteService.ts:193](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/site/SiteService.ts#L193)

Gets all sites with their related monitors and history data.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to an array of sites with complete data.

#### Remarks

Replaces the complex logic that was previously in SiteRepository. Optimized to fetch monitor history in parallel for better performance. Returns all sites with complete details.
