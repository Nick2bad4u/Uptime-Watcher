# Interface: DatabaseServiceFactoryDependencies

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L42)

Defines the dependencies required by the [DatabaseServiceFactory](../classes/DatabaseServiceFactory.md) for
service creation.

## Remarks

Includes all repositories, the database service, and the event emitter needed
for constructing database-related services.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L43)

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L44)

***

### repositories

> **repositories**: `object`

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L45)

#### history

> **history**: [`HistoryRepository`](../../../database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../database/MonitorRepository/classes/MonitorRepository.md)

#### settings

> **settings**: [`SettingsRepository`](../../../database/SettingsRepository/classes/SettingsRepository.md)

#### site

> **site**: [`SiteRepository`](../../../database/SiteRepository/classes/SiteRepository.md)
