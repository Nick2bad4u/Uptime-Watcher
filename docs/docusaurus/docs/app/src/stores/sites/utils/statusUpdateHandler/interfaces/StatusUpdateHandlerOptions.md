# Interface: StatusUpdateHandlerOptions

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/statusUpdateHandler.ts#L27)

Configuration options for status update handler operations.

## Remarks

Defines the required dependencies and callbacks for managing status update subscriptions.
All functions should be stable references to avoid unnecessary re-subscriptions.

## Properties

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/statusUpdateHandler.ts#L34)

Function to trigger full sync from backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Remarks

Called when incremental updates fail or when a complete refresh is needed.

***

### getSites()

> **getSites**: () => [`Site`](../../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/statusUpdateHandler.ts#L42)

Function to get current sites array.

#### Returns

[`Site`](../../../../../../shared/types/interfaces/Site.md)[]

#### Remarks

Should return the current state of sites from the store.

***

### onUpdate()?

> `optional` **onUpdate**: (`update`) => `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/statusUpdateHandler.ts#L50)

Optional callback for additional processing of updates.

#### Parameters

##### update

[`StatusUpdate`](../../../../../../shared/types/interfaces/StatusUpdate.md)

#### Returns

`void`

#### Remarks

Called before applying the update to the store. Can be used for logging or side effects.

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/statusUpdateHandler.ts#L58)

Function to set sites array in store.

#### Parameters

##### sites

[`Site`](../../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`

#### Remarks

Should update the store with the new sites array.
