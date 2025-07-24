# Interface: SiteManagerDependencies

Defined in: [electron/managers/SiteManager.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L88)

Dependency injection configuration for SiteManager.

## Remarks

Provides all required dependencies for SiteManager operation, including
repository services, database access, event communication, and optional
monitoring integration for coordinated operations.

## Properties

### configurationManager

> **configurationManager**: [`ConfigurationManager`](../../ConfigurationManager/classes/ConfigurationManager.md)

Defined in: [electron/managers/SiteManager.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L90)

Configuration manager for business rules and validation

***

### databaseService

> **databaseService**: [`DatabaseService`](../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/managers/SiteManager.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L92)

Database service for transaction management

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/SiteManager.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L94)

Event emitter for system-wide communication

***

### historyRepository

> **historyRepository**: [`HistoryRepository`](../../../services/database/HistoryRepository/classes/HistoryRepository.md)

Defined in: [electron/managers/SiteManager.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L96)

History repository for status history management

***

### monitoringOperations?

> `optional` **monitoringOperations**: [`IMonitoringOperations`](IMonitoringOperations.md)

Defined in: [electron/managers/SiteManager.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L98)

Optional MonitorManager dependency for coordinated operations

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../services/database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/managers/SiteManager.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L100)

Monitor repository for monitor-related operations

***

### settingsRepository

> **settingsRepository**: [`SettingsRepository`](../../../services/database/SettingsRepository/classes/SettingsRepository.md)

Defined in: [electron/managers/SiteManager.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L102)

Settings repository for configuration management

***

### siteRepository

> **siteRepository**: [`SiteRepository`](../../../services/database/SiteRepository/classes/SiteRepository.md)

Defined in: [electron/managers/SiteManager.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/SiteManager.ts#L104)

Site repository for database operations
