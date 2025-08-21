# Interface: SiteManagerDependencies

Defined in: [electron/managers/SiteManager.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L139)

## Remarks

Provides all required dependencies for SiteManager operation, including
repository services, database access, event communication, and optional
monitoring integration for coordinated operations.

Dependency injection configuration for [SiteManager](../classes/SiteManager.md).

## Properties

### configurationManager

> **configurationManager**: [`ConfigurationManager`](../../ConfigurationManager/classes/ConfigurationManager.md)

Defined in: [electron/managers/SiteManager.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L141)

Configuration manager for business rules and validation.

***

### databaseService

> **databaseService**: [`DatabaseService`](../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/managers/SiteManager.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L143)

Database service for transaction management.

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/SiteManager.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L145)

Event emitter for system-wide communication.

***

### historyRepository

> **historyRepository**: [`HistoryRepository`](../../../services/database/HistoryRepository/classes/HistoryRepository.md)

Defined in: [electron/managers/SiteManager.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L147)

History repository for status history management.

***

### monitoringOperations?

> `optional` **monitoringOperations**: [`IMonitoringOperations`](IMonitoringOperations.md)

Defined in: [electron/managers/SiteManager.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L149)

Optional MonitorManager dependency for coordinated operations.

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../services/database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/managers/SiteManager.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L151)

Monitor repository for monitor-related operations.

***

### settingsRepository

> **settingsRepository**: [`SettingsRepository`](../../../services/database/SettingsRepository/classes/SettingsRepository.md)

Defined in: [electron/managers/SiteManager.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L153)

Settings repository for configuration management.

***

### siteRepository

> **siteRepository**: [`SiteRepository`](../../../services/database/SiteRepository/classes/SiteRepository.md)

Defined in: [electron/managers/SiteManager.ts:155](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L155)

Site repository for database operations.
