# Class: StatusUpdateManager

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/utils/statusUpdateHandler.ts#L27)

Manages status update subscriptions

## Constructors

### Constructor

> **new StatusUpdateManager**(): `StatusUpdateManager`

#### Returns

`StatusUpdateManager`

## Methods

### isSubscribed()

> **isSubscribed**(): `boolean`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/utils/statusUpdateHandler.ts#L36)

Check if currently subscribed

#### Returns

`boolean`

***

### subscribe()

> **subscribe**(`handler`, `fullSyncHandler?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/utils/statusUpdateHandler.ts#L43)

Subscribe to status updates and monitoring events

#### Parameters

##### handler

(`update`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

##### fullSyncHandler?

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### unsubscribe()

> **unsubscribe**(): `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/utils/statusUpdateHandler.ts#L116)

Unsubscribe from status updates and monitoring events

#### Returns

`void`
