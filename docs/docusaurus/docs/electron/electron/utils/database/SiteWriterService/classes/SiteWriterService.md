# Class: SiteWriterService

Defined in: [electron/utils/database/SiteWriterService.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteWriterService.ts#L38)

Service for handling site writing operations.
Separates data operations from side effects for better testability.

## Constructors

### Constructor

> **new SiteWriterService**(`config`): `SiteWriterService`

Defined in: [electron/utils/database/SiteWriterService.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteWriterService.ts#L46)

#### Parameters

##### config

[`SiteWritingConfig`](../../interfaces/interfaces/SiteWritingConfig.md) & `object`

#### Returns

`SiteWriterService`

## Methods

### createSite()

> **createSite**(`siteData`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/database/SiteWriterService.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteWriterService.ts#L95)

Create a new site in the database with its monitors.
Pure data operation without side effects.

#### Parameters

##### siteData

[`Site`](../../../../../shared/types/interfaces/Site.md)

Site configuration including monitors to create

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Promise resolving to the created site with assigned monitor IDs

#### Throws

DatabaseError When database operations fail

#### Throws

TransactionError When transaction rollback occurs

#### Remarks

This method performs atomic multi-step operations:
1. Creates the site record in the database
2. Removes any existing monitors for this site (cleanup)
3. Creates new monitors and assigns generated IDs

All operations are wrapped in a transaction to ensure data consistency.
Monitor IDs are assigned during creation and updated in the returned object.

#### Example

```typescript
const newSite = await siteWriter.createSite({
  identifier: 'my-site',
  name: 'My Website',
  monitoring: false,
  monitors: [
    {
      id: '', // Will be assigned during creation
      type: 'http',
      url: 'https://example.com',
      checkInterval: 30000,
      timeout: 5000,
      retryAttempts: 3,
      monitoring: false,
      status: 'pending',
      responseTime: 0,
      history: []
    }
  ]
});
console.log(newSite.monitors[0].id); // Generated ID like 'mon_123'
```

***

### deleteSite()

> **deleteSite**(`sitesCache`, `identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/database/SiteWriterService.ts:163](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteWriterService.ts#L163)

Delete a site and all its monitors from the database.
Pure data operation without side effects.

#### Parameters

##### sitesCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Cache containing sites to update after deletion

##### identifier

`string`

Site identifier to delete

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if site was found and deleted, false if not found

#### Throws

DatabaseError When database operations fail

#### Throws

TransactionError When transaction rollback occurs

#### Remarks

This method performs atomic multi-table deletion:
1. Removes the site from the cache
2. Deletes all associated monitors from the database
3. Deletes the site record from the database

All database operations are wrapped in a transaction to ensure consistency.
If the site is not found in the cache, it will still attempt database cleanup
to handle cases where cache and database are out of sync.

#### Example

```typescript
const deleted = await siteWriter.deleteSite(sitesCache, 'my-site-id');
if (deleted) {
  console.log('Site deleted successfully');
} else {
  console.log('Site not found');
}
```

***

### detectNewMonitors()

> **detectNewMonitors**(`originalMonitors`, `updatedMonitors`): `string`[]

Defined in: [electron/utils/database/SiteWriterService.ts:209](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteWriterService.ts#L209)

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

> **handleMonitorIntervalChanges**(`identifier`, `originalSite`, `newMonitors`, `monitoringConfig`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/SiteWriterService.ts:237](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteWriterService.ts#L237)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### updateSite()

> **updateSite**(`sitesCache`, `identifier`, `updates`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/database/SiteWriterService.ts:319](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/SiteWriterService.ts#L319)

Update a site with new values.
Pure data operation without side effects.

#### Parameters

##### sitesCache

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Cache containing sites to update

##### identifier

`string`

Site identifier to update

##### updates

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Partial site data with fields to update

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Promise resolving to the updated site object

#### Throws

SiteNotFoundError When the site is not found in cache

#### Throws

DatabaseError When database operations fail

#### Throws

TransactionError When transaction rollback occurs

#### Remarks

This method performs atomic updates while preserving monitor history:
1. Validates the site exists in the cache
2. Merges updates with existing site data
3. Persists changes to the database within a transaction
4. Updates or creates monitors while preserving their IDs and history

When monitors are updated, existing monitors are preserved and updated
rather than being deleted and recreated. This maintains monitor history
and prevents ID changes that could break external references.

#### Example

```typescript
const updatedSite = await siteWriter.updateSite(sitesCache, 'my-site', {
  name: 'Updated Site Name',
  monitoring: true,
  monitors: [
    {
      id: 'existing-monitor-id', // Existing monitor - will be updated
      type: 'http',
      url: 'https://updated-url.com',
      checkInterval: 60000,
      // ... other fields
    },
    {
      id: '', // New monitor - will get new ID
      type: 'port',
      host: 'example.com',
      port: 443,
      // ... other fields
    }
  ]
});
```
