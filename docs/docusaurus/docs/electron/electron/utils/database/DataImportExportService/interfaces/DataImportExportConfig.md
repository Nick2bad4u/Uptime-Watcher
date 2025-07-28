# Interface: DataImportExportConfig

Defined in: [electron/utils/database/DataImportExportService.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L25)

Configuration for data import/export operations.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/utils/database/DataImportExportService.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L26)

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/database/DataImportExportService.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L27)

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/database/DataImportExportService.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L28)

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/database/DataImportExportService.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L29)

#### history

> **history**: [`HistoryRepository`](../../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### settings

> **settings**: [`SettingsRepository`](../../../../services/database/SettingsRepository/classes/SettingsRepository.md)

#### site

> **site**: [`SiteRepository`](../../../../services/database/SiteRepository/classes/SiteRepository.md)
