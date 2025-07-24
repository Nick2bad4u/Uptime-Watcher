# Interface: MonitorManagerDependencies

Defined in: [electron/managers/MonitorManager.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/MonitorManager.ts#L11)

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../../services/database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/managers/MonitorManager.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/MonitorManager.ts#L12)

***

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/MonitorManager.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/MonitorManager.ts#L13)

***

### getHistoryLimit()

> **getHistoryLimit**: () => `number`

Defined in: [electron/managers/MonitorManager.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/MonitorManager.ts#L14)

#### Returns

`number`

***

### getSitesCache()

> **getSitesCache**: () => [`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/managers/MonitorManager.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/MonitorManager.ts#L15)

#### Returns

[`StandardizedCache`](../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../shared/types/interfaces/Site.md)\>

***

### repositories

> **repositories**: `object`

Defined in: [electron/managers/MonitorManager.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/MonitorManager.ts#L16)

#### history

> **history**: [`HistoryRepository`](../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### site

> **site**: [`SiteRepository`](../../../services/database/SiteRepository/classes/SiteRepository.md)

***

### siteService

> **siteService**: [`SiteService`](../../../services/site/SiteService/classes/SiteService.md)

Defined in: [electron/managers/MonitorManager.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/MonitorManager.ts#L21)
