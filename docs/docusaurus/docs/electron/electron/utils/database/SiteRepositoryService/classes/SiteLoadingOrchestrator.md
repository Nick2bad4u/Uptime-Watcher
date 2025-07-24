# Class: SiteLoadingOrchestrator

Defined in: [electron/utils/database/SiteRepositoryService.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteRepositoryService.ts#L63)

**`Beta`**

Orchestrates the complete site loading process.
Coordinates data loading with side effects.

## Constructors

### Constructor

> **new SiteLoadingOrchestrator**(`siteRepositoryService`): `SiteLoadingOrchestrator`

Defined in: [electron/utils/database/SiteRepositoryService.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteRepositoryService.ts#L66)

**`Beta`**

#### Parameters

##### siteRepositoryService

[`SiteRepositoryService`](SiteRepositoryService.md)

#### Returns

`SiteLoadingOrchestrator`

## Methods

### loadSitesFromDatabase()

> **loadSitesFromDatabase**(`siteCache`, `monitoringConfig`): `Promise`\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>

Defined in: [electron/utils/database/SiteRepositoryService.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteRepositoryService.ts#L74)

**`Beta`**

Load sites from database and start monitoring.
Coordinates all aspects of site loading process.

#### Parameters

##### siteCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

##### monitoringConfig

[`MonitoringConfig`](../../interfaces/interfaces/MonitoringConfig.md)

#### Returns

`Promise`\<\` `message`: `string`; `sitesLoaded`: `number`; `success`: `boolean`; \`\>
