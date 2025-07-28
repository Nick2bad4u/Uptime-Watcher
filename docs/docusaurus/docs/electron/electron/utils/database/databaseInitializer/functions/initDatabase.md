# Function: initDatabase()

> **initDatabase**(`databaseService`, `loadSitesCallback`, `eventEmitter`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/databaseInitializer.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/databaseInitializer.ts#L23)

Initialize the database and load sites.

Handles database setup and site loading with proper error handling.
Errors are emitted via the event bus and re-thrown following project guidelines.

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

## Throws

Will re-throw any errors after logging and emitting events
