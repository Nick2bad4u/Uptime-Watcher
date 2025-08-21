# Interface: SiteWritingConfig

Defined in: [electron/utils/database/interfaces.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L56)

Configuration for site writing operations.

## Properties

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/database/interfaces.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L58)

Logger instance

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/database/interfaces.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L60)

Repository dependencies

#### monitor

> **monitor**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### site

> **site**: [`SiteRepository`](../../../../services/database/SiteRepository/classes/SiteRepository.md)
