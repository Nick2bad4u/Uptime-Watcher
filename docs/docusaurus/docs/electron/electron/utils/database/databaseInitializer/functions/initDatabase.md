# Function: initDatabase()

> **initDatabase**(`databaseService`, `loadSitesCallback`, `eventEmitter`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/databaseInitializer.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/databaseInitializer.ts#L18)

Initialize the database and load sites.

## Parameters

### databaseService

[`DatabaseService`](../../../../services/database/DatabaseService/classes/DatabaseService.md)

The database service instance

### loadSitesCallback

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Callback function to load sites

### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Event emitter for error handling

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
