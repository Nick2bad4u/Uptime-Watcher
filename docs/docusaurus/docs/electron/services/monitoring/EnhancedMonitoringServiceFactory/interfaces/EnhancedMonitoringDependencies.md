# Interface: EnhancedMonitoringDependencies

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L97)

Dependencies required for creating and configuring enhanced monitoring
services.

## Remarks

This interface defines all the external dependencies that the enhanced
monitoring factory requires to create fully functional monitoring services.
Each dependency serves a specific purpose in the monitoring ecosystem and
must be properly configured before service creation.

**Dependency Categories:**

- **Data Access**: Repositories for persistent storage operations
- **Caching**: In-memory data access for performance optimization
- **Communication**: Event system for monitoring notifications
- **Configuration**: Dynamic settings and limits

## Example

```typescript
const dependencies: EnhancedMonitoringDependencies = {
    eventEmitter: new TypedEventBus(),
    getHistoryLimit: () => userSettings.historyLimit,
    historyRepository: new HistoryRepository(dbService),
    monitorRepository: new MonitorRepository(dbService),
    siteRepository: new SiteRepository(dbService),
    sites: new StandardizedCache<Site>(),
};
```

## Properties

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L106)

Event emitter for system-wide communication and monitoring notifications.

#### Remarks

Used to broadcast monitor status changes, operation events, and other
monitoring-related notifications throughout the application. Essential
for UI updates and cross-component communication.

***

### getHistoryLimit()

> **getHistoryLimit**: () => `number`

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:120](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L120)

Function to get the current maximum number of history entries to keep for
each monitor.

#### Returns

`number`

The maximum number of status history entries to retain per
  monitor

#### Remarks

This function provides dynamic access to the history limit setting, which
may change during runtime based on user configuration or system
constraints. Used for automatic history pruning during status updates.

***

### historyRepository

> **historyRepository**: [`HistoryRepository`](../../../database/HistoryRepository/classes/HistoryRepository.md)

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L130)

Repository for monitor status history operations and management.

#### Remarks

Handles persistence and retrieval of monitor status history entries,
including automatic pruning based on the configured history limit.
Essential for trend analysis and historical reporting.

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:140](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L140)

Repository for monitor entity operations and configuration management.

#### Remarks

Manages monitor entity persistence, status updates, configuration
changes, and monitor-related database operations. Core component for
monitor state management.

***

### siteRepository

> **siteRepository**: [`SiteRepository`](../../../database/SiteRepository/classes/SiteRepository.md)

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L151)

Repository for site entity operations and site-monitor relationship
management.

#### Remarks

Handles site entity persistence and manages the relationship between
sites and their associated monitors. Required for site-level monitoring
operations.

***

### sites

> **sites**: [`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:162](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L162)

In-memory cache for fast access to site and monitor configurations.

#### Remarks

Provides high-performance, in-memory access to site configurations and
monitor definitions, reducing database load during frequent monitoring
operations. Critical for maintaining acceptable monitoring performance at
scale.
