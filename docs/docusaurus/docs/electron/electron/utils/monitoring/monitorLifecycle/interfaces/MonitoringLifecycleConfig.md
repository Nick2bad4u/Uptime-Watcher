# Interface: MonitoringLifecycleConfig

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L36)

Configuration object for monitoring lifecycle functions.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L38)

Database service for executing transactions and maintaining data consistency

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L40)

Event emitter for communicating monitoring state changes to other components

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L42)

Logger instance for debugging and operational information

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L44)

Repository for monitor data access and manipulation

***

### monitorScheduler

> **monitorScheduler**: [`MonitorScheduler`](../../../../services/monitoring/MonitorScheduler/classes/MonitorScheduler.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L46)

Scheduler service for managing monitor execution intervals and timing

***

### sites

> **sites**: [`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L48)

Cache containing site data with associated monitors
