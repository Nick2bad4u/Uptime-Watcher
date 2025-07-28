# Interface: DatabaseServiceFactoryDependencies

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L32)

Defines the dependencies required by the [DatabaseServiceFactory](../classes/DatabaseServiceFactory.md) for service creation.

## Remarks

Includes all repositories, the database service, and the event emitter needed for constructing database-related services.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L33)

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L34)

***

### repositories

> **repositories**: `object`

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L35)

#### history

> **history**: [`HistoryRepository`](../../../database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../database/MonitorRepository/classes/MonitorRepository.md)

#### settings

> **settings**: [`SettingsRepository`](../../../database/SettingsRepository/classes/SettingsRepository.md)

#### site

> **site**: [`SiteRepository`](../../../database/SiteRepository/classes/SiteRepository.md)
