# Interface: DataImportExportConfig

Defined in: [electron/utils/database/DataImportExportService.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L33)

Configuration for data import/export operations.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/utils/database/DataImportExportService.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L34)

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/database/DataImportExportService.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L35)

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/database/DataImportExportService.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L36)

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/database/DataImportExportService.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L37)

#### history

> **history**: [`HistoryRepository`](../../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### settings

> **settings**: [`SettingsRepository`](../../../../services/database/SettingsRepository/classes/SettingsRepository.md)

#### site

> **site**: [`SiteRepository`](../../../../services/database/SiteRepository/classes/SiteRepository.md)
