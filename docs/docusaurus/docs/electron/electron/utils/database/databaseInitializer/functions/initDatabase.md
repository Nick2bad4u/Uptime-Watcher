# Function: initDatabase()

> **initDatabase**(`databaseService`, `loadSitesCallback`, `eventEmitter`): `Promise`\<`void`\>

Defined in: [electron/utils/database/databaseInitializer.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/databaseInitializer.ts#L18)

Initialize the database and load sites.

## Parameters

### databaseService

[`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

The database service instance

### loadSitesCallback

() => `Promise`\<`void`\>

Callback function to load sites

### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Event emitter for error handling

## Returns

`Promise`\<`void`\>
