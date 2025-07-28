# Class: SiteLoadingOrchestrator

Defined in: [electron/utils/database/SiteRepositoryService.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteRepositoryService.ts#L79)

**`Beta`**

Orchestrates the complete site loading process.
Coordinates data loading with side effects.

## Constructors

### Constructor

> **new SiteLoadingOrchestrator**(`siteRepositoryService`): `SiteLoadingOrchestrator`

Defined in: [electron/utils/database/SiteRepositoryService.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteRepositoryService.ts#L82)

**`Beta`**

#### Parameters

##### siteRepositoryService

[`SiteRepositoryService`](SiteRepositoryService.md)

#### Returns

`SiteLoadingOrchestrator`

## Methods

### loadSitesFromDatabase()

> **loadSitesFromDatabase**(`siteCache`, `monitoringConfig`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

Defined in: [electron/utils/database/SiteRepositoryService.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteRepositoryService.ts#L90)

**`Beta`**

Load sites from database and start monitoring.
Coordinates all aspects of site loading process.

#### Parameters

##### siteCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

##### monitoringConfig

[`MonitoringConfig`](../../interfaces/interfaces/MonitoringConfig.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>
