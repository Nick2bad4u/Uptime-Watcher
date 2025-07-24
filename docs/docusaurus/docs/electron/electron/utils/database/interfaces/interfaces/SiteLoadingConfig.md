# Interface: SiteLoadingConfig

Defined in: [electron/utils/database/interfaces.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/interfaces.ts#L35)

Configuration for site loading operations.

## Properties

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/database/interfaces.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/interfaces.ts#L37)

Typed event emitter for error handling

***

### logger

> **logger**: [`Logger`](../../../interfaces/interfaces/Logger.md)

Defined in: [electron/utils/database/interfaces.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/interfaces.ts#L39)

Logger instance

***

### repositories

> **repositories**: `object`

Defined in: [electron/utils/database/interfaces.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/interfaces.ts#L41)

Repository dependencies

#### history

> **history**: [`HistoryRepository`](../../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### settings

> **settings**: [`SettingsRepository`](../../../../services/database/SettingsRepository/classes/SettingsRepository.md)

#### site

> **site**: [`SiteRepository`](../../../../services/database/SiteRepository/classes/SiteRepository.md)
