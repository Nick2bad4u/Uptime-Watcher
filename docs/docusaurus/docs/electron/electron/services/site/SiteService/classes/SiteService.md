# Class: SiteService

Defined in: [electron/services/site/SiteService.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/site/SiteService.ts#L28)

Service for coordinating site operations across multiple repositories.
Handles complex operations that require coordination between site, monitor, and history data.

## Constructors

### Constructor

> **new SiteService**(`dependencies`): `SiteService`

Defined in: [electron/services/site/SiteService.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/site/SiteService.ts#L39)

#### Parameters

##### dependencies

[`SiteServiceDependencies`](../interfaces/SiteServiceDependencies.md)

#### Returns

`SiteService`

## Methods

### deleteSiteWithRelatedData()

> **deleteSiteWithRelatedData**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/site/SiteService.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/site/SiteService.ts#L55)

Delete a site and all its related data (monitors and history).
Uses transaction to ensure atomicity.

#### Parameters

##### identifier

`string`

Site identifier to delete

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if all deletions succeeded

#### Throws

Error When any deletion operation fails

***

### findByIdentifierWithDetails()

> **findByIdentifierWithDetails**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/services/site/SiteService.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/site/SiteService.ts#L114)

Find a site by identifier with all related monitors and history data.
This replaces the complex logic that was previously in SiteRepository.

#### Parameters

##### identifier

`string`

Site identifier to find

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)\>

Promise resolving to site with details or undefined if not found

***

### getAllWithDetails()

> **getAllWithDetails**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/services/site/SiteService.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/site/SiteService.ts#L168)

Get all sites with their related monitors and history data.
This replaces the complex logic that was previously in SiteRepository.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to array of sites with complete data

#### Remarks

Optimized to fetch monitor history in parallel for better performance.
