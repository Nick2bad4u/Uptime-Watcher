# Interface: DataImportExportConfig

Defined in: [electron/utils/database/DataImportExportService.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L23)

Configuration for data import/export operations.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/utils/database/DataImportExportService.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L24)

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/database/DataImportExportService.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L25)

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/database/DataImportExportService.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L26)

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/database/DataImportExportService.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L27)

#### history

> **history**: [`HistoryRepository`](../../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### settings

> **settings**: [`SettingsRepository`](../../../../services/database/SettingsRepository/classes/SettingsRepository.md)

#### site

> **site**: [`SiteRepository`](../../../../services/database/SiteRepository/classes/SiteRepository.md)
