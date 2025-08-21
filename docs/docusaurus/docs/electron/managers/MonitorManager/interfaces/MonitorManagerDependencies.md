# Interface: MonitorManagerDependencies

Defined in: [electron/managers/MonitorManager.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/MonitorManager.ts#L99)

Defines the dependencies required by [MonitorManager](../classes/MonitorManager.md) for orchestration
and data access.

## Remarks

All dependencies are injected to support testability and separation of
concerns. This interface is used for dependency injection in the
[MonitorManager](../classes/MonitorManager.md) constructor.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/managers/MonitorManager.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/MonitorManager.ts#L106)

Database service for transactional operations.

#### Remarks

Used for all database access and transaction management.

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/MonitorManager.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/MonitorManager.ts#L113)

Event bus for emitting and listening to monitor events.

#### Remarks

Used for all event-driven communication between backend and frontend.

***

### getHistoryLimit()

> **getHistoryLimit**: () => `number`

Defined in: [electron/managers/MonitorManager.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/MonitorManager.ts#L122)

Returns the history limit for status checks.

#### Returns

`number`

The maximum number of status updates to keep in history.

#### Remarks

Used to determine how many status updates to retain in history.

***

### getSitesCache()

> **getSitesCache**: () => [`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/MonitorManager.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/MonitorManager.ts#L131)

Returns the current sites cache.

#### Returns

[`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

The current [StandardizedCache](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md) of [Site](../../../../shared/types/interfaces/Site.md) objects.

#### Remarks

Provides access to the in-memory cache of all sites.

***

### repositories

> **repositories**: `object`

Defined in: [electron/managers/MonitorManager.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/MonitorManager.ts#L139)

Repository interfaces for DB access.

#### history

> **history**: [`HistoryRepository`](../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### site

> **site**: [`SiteRepository`](../../../services/database/SiteRepository/classes/SiteRepository.md)

#### Remarks

Provides access to the repositories for history, monitor, and site
entities.

***

### siteService

> **siteService**: [`SiteService`](../../../services/site/SiteService/classes/SiteService.md)

Defined in: [electron/managers/MonitorManager.ts:150](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/MonitorManager.ts#L150)

Service for site-level business logic.

#### Remarks

Used for site-related business operations and orchestration.
