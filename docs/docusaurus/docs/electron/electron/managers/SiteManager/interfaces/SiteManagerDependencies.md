# Interface: SiteManagerDependencies

Defined in: [electron/managers/SiteManager.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L110)

Dependency injection configuration for [SiteManager](../classes/SiteManager.md).

## Remarks

Provides all required dependencies for SiteManager operation, including
repository services, database access, event communication, and optional
monitoring integration for coordinated operations.

## Properties

### configurationManager

> **configurationManager**: [`ConfigurationManager`](../../ConfigurationManager/classes/ConfigurationManager.md)

Defined in: [electron/managers/SiteManager.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L112)

Configuration manager for business rules and validation.

***

### databaseService

> **databaseService**: [`DatabaseService`](../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/managers/SiteManager.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L114)

Database service for transaction management.

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/SiteManager.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L116)

Event emitter for system-wide communication.

***

### historyRepository

> **historyRepository**: [`HistoryRepository`](../../../services/database/HistoryRepository/classes/HistoryRepository.md)

Defined in: [electron/managers/SiteManager.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L118)

History repository for status history management.

***

### monitoringOperations?

> `optional` **monitoringOperations**: [`IMonitoringOperations`](IMonitoringOperations.md)

Defined in: [electron/managers/SiteManager.ts:120](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L120)

Optional MonitorManager dependency for coordinated operations.

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../services/database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/managers/SiteManager.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L122)

Monitor repository for monitor-related operations.

***

### settingsRepository

> **settingsRepository**: [`SettingsRepository`](../../../services/database/SettingsRepository/classes/SettingsRepository.md)

Defined in: [electron/managers/SiteManager.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L124)

Settings repository for configuration management.

***

### siteRepository

> **siteRepository**: [`SiteRepository`](../../../services/database/SiteRepository/classes/SiteRepository.md)

Defined in: [electron/managers/SiteManager.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/SiteManager.ts#L126)

Site repository for database operations.
