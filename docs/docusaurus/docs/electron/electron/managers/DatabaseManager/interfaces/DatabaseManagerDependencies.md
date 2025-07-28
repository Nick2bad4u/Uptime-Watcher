# Interface: DatabaseManagerDependencies

Defined in: [electron/managers/DatabaseManager.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L41)

Defines the dependencies required to construct a [DatabaseManager](../classes/DatabaseManager.md) instance.

## Remarks

This interface is used for dependency injection, enabling testability and modularity. All repositories and services required for database operations must be provided.

## See

[DatabaseManager](../classes/DatabaseManager.md)

## Properties

### configurationManager

> **configurationManager**: [`ConfigurationManager`](../../ConfigurationManager/classes/ConfigurationManager.md)

Defined in: [electron/managers/DatabaseManager.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L43)

The configuration manager for business rules and policies.

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/DatabaseManager.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L45)

The typed event emitter for system-wide coordination.

***

### repositories

> **repositories**: `object`

Defined in: [electron/managers/DatabaseManager.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L47)

The set of repositories used for all database operations.

#### database

> **database**: [`DatabaseService`](../../../services/database/DatabaseService/classes/DatabaseService.md)

The main database service.

#### history

> **history**: [`HistoryRepository`](../../../services/database/HistoryRepository/classes/HistoryRepository.md)

Repository for status history.

#### monitor

> **monitor**: [`MonitorRepository`](../../../services/database/MonitorRepository/classes/MonitorRepository.md)

Repository for monitor data.

#### settings

> **settings**: [`SettingsRepository`](../../../services/database/SettingsRepository/classes/SettingsRepository.md)

Repository for application settings.

#### site

> **site**: [`SiteRepository`](../../../services/database/SiteRepository/classes/SiteRepository.md)

Repository for site data.
