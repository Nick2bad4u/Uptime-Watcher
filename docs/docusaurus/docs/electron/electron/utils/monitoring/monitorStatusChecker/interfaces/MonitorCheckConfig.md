# Interface: MonitorCheckConfig

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L61)

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

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L63)

**`Alpha`**

Database service for transaction management

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L65)

**`Alpha`**

Typed event bus for high-level event communication

***

### historyLimit

> **historyLimit**: `number`

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L67)

**`Alpha`**

Maximum number of history entries to retain per monitor

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L69)

**`Alpha`**

Logger instance for operation tracking

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L71)

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

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L77)

**`Alpha`**

In-memory site cache for performance optimization

***

### siteService

> **siteService**: [`SiteService`](../../../../services/site/SiteService/classes/SiteService.md)

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L79)

**`Alpha`**

Service for coordinated site operations
