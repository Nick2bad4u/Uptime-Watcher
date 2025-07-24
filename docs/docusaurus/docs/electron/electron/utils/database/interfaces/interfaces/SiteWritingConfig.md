# Interface: SiteWritingConfig

Defined in: [electron/utils/database/interfaces.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/interfaces.ts#L52)

Configuration for site writing operations.

## Properties

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/database/interfaces.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/interfaces.ts#L54)

Logger instance

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/database/interfaces.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/interfaces.ts#L56)

Repository dependencies

#### monitor

> **monitor**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### site

> **site**: [`SiteRepository`](../../../../services/database/SiteRepository/classes/SiteRepository.md)
