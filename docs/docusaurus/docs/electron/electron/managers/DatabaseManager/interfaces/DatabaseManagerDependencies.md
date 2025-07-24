# Interface: DatabaseManagerDependencies

Defined in: [electron/managers/DatabaseManager.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/DatabaseManager.ts#L31)

Dependencies interface for DatabaseManager constructor.

## Properties

### eventEmitter

> **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/DatabaseManager.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/DatabaseManager.ts#L32)

***

### repositories

> **repositories**: `object`

Defined in: [electron/managers/DatabaseManager.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/DatabaseManager.ts#L33)

#### database

> **database**: [`DatabaseService`](../../../services/database/DatabaseService/classes/DatabaseService.md)

#### history

> **history**: [`HistoryRepository`](../../../services/database/HistoryRepository/classes/HistoryRepository.md)

#### monitor

> **monitor**: [`MonitorRepository`](../../../services/database/MonitorRepository/classes/MonitorRepository.md)

#### settings

> **settings**: [`SettingsRepository`](../../../services/database/SettingsRepository/classes/SettingsRepository.md)

#### site

> **site**: [`SiteRepository`](../../../services/database/SiteRepository/classes/SiteRepository.md)
