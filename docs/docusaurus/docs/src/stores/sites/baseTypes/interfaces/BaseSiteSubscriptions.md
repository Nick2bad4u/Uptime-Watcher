# Interface: BaseSiteSubscriptions

Defined in: [src/stores/sites/baseTypes.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L118)

Common site subscription interface. Shared between different subscription
modules.

## Properties

### subscribeToStatusUpdates()

> **subscribeToStatusUpdates**: (`callback`) => `void`

Defined in: [src/stores/sites/baseTypes.ts:120](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L120)

Subscribe to status updates

#### Parameters

##### callback

(`update`) => `void`

#### Returns

`void`

***

### unsubscribeFromStatusUpdates()

> **unsubscribeFromStatusUpdates**: () => `void`

Defined in: [src/stores/sites/baseTypes.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L124)

Unsubscribe from status updates

#### Returns

`void`
