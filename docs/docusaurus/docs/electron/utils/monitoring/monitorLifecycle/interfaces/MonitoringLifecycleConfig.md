# Interface: MonitoringLifecycleConfig

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L34)

Configuration object for monitoring lifecycle functions.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L39)

Database service for executing transactions and maintaining data
consistency

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L44)

Event emitter for communicating monitoring state changes to other
components

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L46)

Logger instance for debugging and operational information

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L48)

Repository for monitor data access and manipulation

***

### monitorScheduler

> **monitorScheduler**: [`MonitorScheduler`](../../../../services/monitoring/MonitorScheduler/classes/MonitorScheduler.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L50)

Scheduler service for managing monitor execution intervals and timing

***

### sites

> **sites**: [`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L52)

Cache containing site data with associated monitors

***

### siteService?

> `optional` **siteService**: `object`

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L54)

Service for site operations and cache management

#### findByIdentifierWithDetails()

> **findByIdentifierWithDetails**: (`identifier`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)\>

##### Parameters

###### identifier

`string`

##### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)\>
