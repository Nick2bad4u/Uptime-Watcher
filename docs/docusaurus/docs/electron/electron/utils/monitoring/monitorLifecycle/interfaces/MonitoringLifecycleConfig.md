# Interface: MonitoringLifecycleConfig

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorLifecycle.ts#L25)

Configuration object for monitoring lifecycle functions.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorLifecycle.ts#L26)

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorLifecycle.ts#L27)

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorLifecycle.ts#L28)

***

### monitorRepository

> **monitorRepository**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorLifecycle.ts#L29)

***

### monitorScheduler

> **monitorScheduler**: [`MonitorScheduler`](../../../../services/monitoring/MonitorScheduler/classes/MonitorScheduler.md)

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorLifecycle.ts#L30)

***

### sites

> **sites**: [`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorLifecycle.ts#L31)
