# Class: SiteLoadingOrchestrator

Defined in: [electron/utils/database/SiteRepositoryService.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/SiteRepositoryService.ts#L56)

Orchestrates the complete site loading process. Coordinates data loading with
side effects.

## Constructors

### Constructor

> **new SiteLoadingOrchestrator**(`siteRepositoryService`): `SiteLoadingOrchestrator`

Defined in: [electron/utils/database/SiteRepositoryService.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/SiteRepositoryService.ts#L95)

#### Parameters

##### siteRepositoryService

[`SiteRepositoryService`](SiteRepositoryService.md)

#### Returns

`SiteLoadingOrchestrator`

## Methods

### loadSitesFromDatabase()

> **loadSitesFromDatabase**(`siteCache`, `monitoringConfig`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

Defined in: [electron/utils/database/SiteRepositoryService.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/SiteRepositoryService.ts#L63)

Load sites from database and start monitoring. Coordinates all aspects of
site loading process.

#### Parameters

##### siteCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

##### monitoringConfig

[`MonitoringConfig`](../../interfaces/interfaces/MonitoringConfig.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>
