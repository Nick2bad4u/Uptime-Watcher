# Interface: EnhancedMonitorCheckConfig

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L97)

Configuration interface for enhanced monitor checking with comprehensive
service dependencies.

## Remarks

This configuration object provides all necessary dependencies for the
enhanced monitor checker to operate safely with operation correlation and
race condition prevention. Each dependency serves a specific purpose in the
monitoring operation lifecycle.

## Example

```typescript
const config: EnhancedMonitorCheckConfig = {
    eventEmitter: typedEventBus,
    getHistoryLimit: () => 100,
    historyRepository: historyRepo,
    monitorRepository: monitorRepo,
    operationRegistry: registry,
    siteRepository: siteRepo,
    sites: sitesCache,
    statusUpdateService: updateService,
    timeoutManager: timeoutMgr,
};
```

## Properties

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L106)

Event emitter for system-wide communication and monitor event
propagation.

#### Remarks

Used to emit monitor status changes, operation events, and other
monitoring-related notifications throughout the application.

***

### getHistoryLimit()

> **getHistoryLimit**: () => `number`

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L118)

Function to get the maximum number of history entries to keep for each
monitor.

#### Returns

`number`

The maximum number of status history entries to retain

#### Remarks

This function provides the current history limit setting, which may
change during runtime based on user configuration or system constraints.

***

### historyRepository

> **historyRepository**: [`HistoryRepository`](../../../database/HistoryRepository/classes/HistoryRepository.md)

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L127)

Repository for history operations and status history management.

#### Remarks

Handles persistence and retrieval of monitor status history entries,
including automatic pruning based on the configured history limit.

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:136](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L136)

Repository for monitor entity operations and status updates.

#### Remarks

Manages monitor entity persistence, updates monitor status and
configuration, and handles monitor-related database operations.

***

### operationRegistry

> **operationRegistry**: [`MonitorOperationRegistry`](../../MonitorOperationRegistry/classes/MonitorOperationRegistry.md)

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L146)

Operation registry for correlation and race condition prevention.

#### Remarks

Tracks active monitor operations to prevent concurrent checks on the same
monitor and provides operation correlation for debugging and state
management.

***

### siteRepository

> **siteRepository**: [`SiteRepository`](../../../database/SiteRepository/classes/SiteRepository.md)

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:155](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L155)

Repository for site entity operations and site-monitor relationships.

#### Remarks

Handles site entity persistence and manages the relationship between
sites and their associated monitors.

***

### sites

> **sites**: [`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:166](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L166)

Sites cache for quick access to site and monitor data without database
queries.

#### Remarks

Provides fast, in-memory access to site configurations and monitor
definitions, reducing database load during frequent monitoring
operations.

***

### statusUpdateService

> **statusUpdateService**: [`MonitorStatusUpdateService`](../../MonitorStatusUpdateService/classes/MonitorStatusUpdateService.md)

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L176)

Status update service for safe concurrent status updates.

#### Remarks

Provides operation-aware status updates that prevent race conditions when
multiple monitor checks might attempt to update the same monitor's status
simultaneously.

***

### timeoutManager

> **timeoutManager**: [`OperationTimeoutManager`](../../OperationTimeoutManager/classes/OperationTimeoutManager.md)

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:185](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L185)

Timeout manager for operation cleanup and resource management.

#### Remarks

Manages operation timeouts, cleanup procedures, and ensures resources are
properly released when monitor operations complete or are cancelled.
