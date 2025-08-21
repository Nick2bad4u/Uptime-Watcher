# Class: StatusUpdateManager

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/statusUpdateHandler.ts#L109)

Manages status update subscriptions and event handling with efficient
incremental updates.

## Remarks

Provides a centralized manager for subscribing to and handling real-time
status updates from the backend. Handles IPC event management and cleanup
automatically. Prioritizes incremental updates over full syncs for better
performance.

## Example

```typescript
const manager = new StatusUpdateManager({
    fullSyncFromBackend: () => syncSites(),
    getSites: () => store.getSites(),
    setSites: (sites) => store.setSites(sites),
});

manager.subscribe();
```

## Constructors

### Constructor

> **new StatusUpdateManager**(`options`): `StatusUpdateManager`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:213](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/statusUpdateHandler.ts#L213)

Constructs a new StatusUpdateManager instance.

#### Parameters

##### options

[`StatusUpdateHandlerOptions`](../interfaces/StatusUpdateHandlerOptions.md)

Configuration options for the status update manager

#### Returns

`StatusUpdateManager`

#### Remarks

Initializes the manager with the required dependencies for status update
handling. Does not start listening for events until subscribe() is
called.

## Methods

### isSubscribed()

> **isSubscribed**(): `boolean`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:228](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/statusUpdateHandler.ts#L228)

Check if currently subscribed to status updates.

#### Returns

`boolean`

True if subscribed and listening for events, false otherwise

#### Remarks

Returns true when event listeners are active.

***

### subscribe()

> **subscribe**(): `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:248](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/statusUpdateHandler.ts#L248)

Subscribe to status updates from the backend with efficient incremental
processing.

#### Returns

`void`

#### Remarks

Sets up IPC event listeners for monitor status changes and monitoring
lifecycle events. Automatically performs an initial full sync when
subscribing. Prioritizes incremental updates over full syncs for better
performance.

#### Example

```typescript
manager.subscribe();
```

***

### unsubscribe()

> **unsubscribe**(): `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:338](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/statusUpdateHandler.ts#L338)

Unsubscribe from all status update events.

#### Returns

`void`

#### Remarks

Cleans up all IPC event listeners and resets internal state. Safe to call
multiple times - will not throw if already unsubscribed.

#### Example

```typescript
manager.unsubscribe();
console.log(manager.isSubscribed()); // false
```
