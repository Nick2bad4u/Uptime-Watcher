# Interface: DatabaseManagerDependencies

Defined in: [electron/managers/DatabaseManager.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/DatabaseManager.ts#L88)

Defines the dependencies required to construct a [DatabaseManager](../classes/DatabaseManager.md)
instance.

## Remarks

This interface is used for dependency injection, enabling testability and
modularity. All repositories and services required for database operations
must be provided.

## See

[DatabaseManager](../classes/DatabaseManager.md)

## Properties

### configurationManager

> **configurationManager**: [`ConfigurationManager`](../../ConfigurationManager/classes/ConfigurationManager.md)

Defined in: [electron/managers/DatabaseManager.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/DatabaseManager.ts#L90)

The configuration manager for business rules and policies.

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/DatabaseManager.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/DatabaseManager.ts#L92)

The typed event emitter for system-wide coordination.

***

### repositories

> **repositories**: `object`

Defined in: [electron/managers/DatabaseManager.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/DatabaseManager.ts#L94)

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
