# Class: StatusUpdateManager

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/utils/statusUpdateHandler.ts#L27)

Manages status update subscriptions

## Constructors

### Constructor

> **new StatusUpdateManager**(): `StatusUpdateManager`

#### Returns

`StatusUpdateManager`

## Methods

### isSubscribed()

> **isSubscribed**(): `boolean`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/utils/statusUpdateHandler.ts#L36)

Check if currently subscribed

#### Returns

`boolean`

***

### subscribe()

> **subscribe**(`handler`, `fullSyncHandler?`): `Promise`\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/utils/statusUpdateHandler.ts#L43)

Subscribe to status updates and monitoring events

#### Parameters

##### handler

(`update`) => `Promise`\<`void`\>

##### fullSyncHandler?

() => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### unsubscribe()

> **unsubscribe**(): `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/utils/statusUpdateHandler.ts#L116)

Unsubscribe from status updates and monitoring events

#### Returns

`void`
