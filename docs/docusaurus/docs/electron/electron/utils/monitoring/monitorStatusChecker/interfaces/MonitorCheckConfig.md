# Interface: MonitorCheckConfig

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L60)

**`Alpha`**

Configuration object for monitor checking functions.

## Remarks

Provides all necessary dependencies for monitor checking operations,
including repository access, database services, cache management,
and event emission capabilities. Designed for dependency injection
and comprehensive testing support.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L62)

**`Alpha`**

Database service for transaction management

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L64)

**`Alpha`**

Typed event bus for high-level event communication

***

### historyLimit

> **historyLimit**: `number`

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L66)

**`Alpha`**

Maximum number of history entries to retain per monitor

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L68)

**`Alpha`**

Logger instance for operation tracking

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L70)

**`Alpha`**

Repository services for database operations

#### history

> **history**: [`HistoryRepository`](../../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### site

> **site**: [`SiteRepository`](../../../../services/database/SiteRepository/classes/SiteRepository.md)

***

### sites

> **sites**: [`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L76)

**`Alpha`**

In-memory site cache for performance optimization

***

### siteService

> **siteService**: [`SiteService`](../../../../services/site/SiteService/classes/SiteService.md)

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L78)

**`Alpha`**

Service for coordinated site operations
