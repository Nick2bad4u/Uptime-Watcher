# Class: SiteRepositoryService

Defined in: [electron/utils/database/SiteRepositoryService.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/SiteRepositoryService.ts#L117)

**`Beta`**

Service for handling site repository operations.

## Remarks

Provides pure data operations for site management without side effects,
enabling easy testing and clean separation of concerns. All methods are
designed to be deterministic and focused on data transformation and
retrieval operations.

The service abstracts repository complexity and provides a clean interface
for higher-level components while maintaining transaction safety and
comprehensive error handling throughout all operations.

## Constructors

### Constructor

> **new SiteRepositoryService**(`config`): `SiteRepositoryService`

Defined in: [electron/utils/database/SiteRepositoryService.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/SiteRepositoryService.ts#L137)

**`Beta`**

Create a new SiteRepositoryService instance.

#### Parameters

##### config

[`SiteLoadingConfig`](../../interfaces/interfaces/SiteLoadingConfig.md)

Configuration with required dependencies

#### Returns

`SiteRepositoryService`

#### Remarks

Initializes the service with injected dependencies for repositories,
logging, and event communication. All dependencies are required
for proper operation and comprehensive functionality.

## Methods

### applyHistoryLimitSetting()

> **applyHistoryLimitSetting**(`monitoringConfig`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/SiteRepositoryService.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/SiteRepositoryService.ts#L147)

**`Beta`**

Apply history limit setting.
Side effect operation separated from data loading.

#### Parameters

##### monitoringConfig

[`MonitoringConfig`](../../interfaces/interfaces/MonitoringConfig.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getHistoryLimitSetting()

> **getHistoryLimitSetting**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| `number`\>

Defined in: [electron/utils/database/SiteRepositoryService.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/SiteRepositoryService.ts#L159)

**`Beta`**

Load history limit setting from database.
Pure data operation without side effects.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| `number`\>

***

### getSitesFromDatabase()

> **getSitesFromDatabase**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/utils/database/SiteRepositoryService.ts:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/SiteRepositoryService.ts#L195)

**`Beta`**

Get sites from database with their monitors and history.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to array of complete site objects

#### Throws

SiteLoadingError When database operation fails

#### Remarks

Performs a complete site loading operation including all associated
monitors and their status history. This is a pure data operation
without side effects, making it ideal for testing and composition.

The operation builds complete site objects by fetching site metadata,
associated monitors, and historical data in an efficient manner while
maintaining proper error handling throughout the process.

***

### loadSitesIntoCache()

> **loadSitesIntoCache**(`siteCache`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/SiteRepositoryService.ts:217](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/SiteRepositoryService.ts#L217)

**`Beta`**

Load sites into cache.
Pure data operation that populates the cache.

#### Parameters

##### siteCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
