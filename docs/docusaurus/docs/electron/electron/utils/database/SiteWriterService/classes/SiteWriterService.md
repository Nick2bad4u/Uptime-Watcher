# Class: SiteWriterService

Defined in: [electron/utils/database/SiteWriterService.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteWriterService.ts#L20)

Service for handling site writing operations.
Separates data operations from side effects for better testability.

## Constructors

### Constructor

> **new SiteWriterService**(`config`): `SiteWriterService`

Defined in: [electron/utils/database/SiteWriterService.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteWriterService.ts#L28)

#### Parameters

##### config

[`SiteWritingConfig`](../../interfaces/interfaces/SiteWritingConfig.md) & `object`

#### Returns

`SiteWriterService`

## Methods

### createSite()

> **createSite**(`siteData`): `Promise`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/database/SiteWriterService.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteWriterService.ts#L38)

Create a new site in the database with its monitors.
Pure data operation without side effects.

#### Parameters

##### siteData

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`Promise`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

***

### deleteSite()

> **deleteSite**(`sitesCache`, `identifier`): `Promise`\<`boolean`\>

Defined in: [electron/utils/database/SiteWriterService.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteWriterService.ts#L79)

Delete a site and all its monitors from the database.
Pure data operation without side effects.

#### Parameters

##### sitesCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

##### identifier

`string`

#### Returns

`Promise`\<`boolean`\>

***

### detectNewMonitors()

> **detectNewMonitors**(`originalMonitors`, `updatedMonitors`): `string`[]

Defined in: [electron/utils/database/SiteWriterService.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteWriterService.ts#L125)

Detect new monitors that were added to an existing site.

#### Parameters

##### originalMonitors

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

The original monitors before update

##### updatedMonitors

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

The updated monitors after update

#### Returns

`string`[]

Array of new monitor IDs (may include empty strings for monitors without IDs)

#### Remarks

This method handles two scenarios:
1. **Monitors with IDs**: Compares IDs to detect new ones
2. **Monitors without IDs**: Detects new monitors by comparing monitor objects
   since IDs are assigned during database creation

Monitors without IDs are returned with empty string placeholders to indicate
they need special handling during monitor setup operations.

***

### handleMonitorIntervalChanges()

> **handleMonitorIntervalChanges**(`identifier`, `originalSite`, `newMonitors`, `monitoringConfig`): `Promise`\<`void`\>

Defined in: [electron/utils/database/SiteWriterService.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteWriterService.ts#L153)

Handle monitoring state changes when monitor intervals are modified.
Side effect operation separated from data updates.

#### Parameters

##### identifier

`string`

##### originalSite

[`Site`](../../../../../shared/types/interfaces/Site.md)

##### newMonitors

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

##### monitoringConfig

[`MonitoringConfig`](../../interfaces/interfaces/MonitoringConfig.md)

#### Returns

`Promise`\<`void`\>

***

### updateSite()

> **updateSite**(`sitesCache`, `identifier`, `updates`): `Promise`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/database/SiteWriterService.ts:191](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/SiteWriterService.ts#L191)

Update a site with new values.
Pure data operation without side effects.

#### Parameters

##### sitesCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

##### identifier

`string`

##### updates

`Partial`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`Promise`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>
