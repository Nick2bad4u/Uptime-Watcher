# Class: UptimeOrchestrator

Defined in: [electron/UptimeOrchestrator.ts:177](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L177)

Enhanced event bus with type safety and middleware support.

## Remarks

Provides compile-time type checking for events, automatic correlation tracking,
middleware processing, and comprehensive debugging capabilities. Events are
processed through a middleware chain before emission.

## Extends

- [`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md)\<`OrchestratorEvents`\>

## Constructors

### Constructor

> **new UptimeOrchestrator**(`dependencies?`): `UptimeOrchestrator`

Defined in: [electron/UptimeOrchestrator.ts:222](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L222)

Constructs a new UptimeOrchestrator with injected dependencies.

#### Parameters

##### dependencies?

[`UptimeOrchestratorDependencies`](../interfaces/UptimeOrchestratorDependencies.md)

The manager dependencies required for orchestration

#### Returns

`UptimeOrchestrator`

#### Throws

When dependencies are not provided or invalid

#### Remarks

Sets up event bus middleware and assigns provided managers.
Initialization is performed separately via the initialize() method.

Dependencies must be injected through the ServiceContainer pattern
rather than creating managers directly. This ensures proper
initialization order and dependency management.

#### Example

```typescript
const orchestrator = new UptimeOrchestrator({
  databaseManager,
  monitorManager,
  siteManager
});
await orchestrator.initialize();
```

#### Overrides

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`constructor`](../../events/TypedEventBus/classes/TypedEventBus.md#constructor)

## Accessors

### historyLimit

#### Get Signature

> **get** **historyLimit**(): `number`

Defined in: [electron/UptimeOrchestrator.ts:188](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L188)

Gets the current history retention limit.

##### Remarks

This getter provides convenient property-style access for internal use.
The corresponding getHistoryLimit() method exists for IPC compatibility
since Electron IPC can only serialize method calls, not property access.

##### Returns

`number`

The current history limit from DatabaseManager

## Methods

### addSite()

> **addSite**(`siteData`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/UptimeOrchestrator.ts:252](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L252)

Adds a new site and sets up monitoring for it.
Uses transaction-like behavior to ensure consistency.

#### Parameters

##### siteData

[`Site`](../../../shared/types/interfaces/Site.md)

The site data to add.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../shared/types/interfaces/Site.md)\>

Promise resolving to the added Site object.

#### Throws

When site creation fails due to validation errors

#### Throws

When monitoring setup fails critically

#### Throws

When site cleanup fails after monitoring setup failure

***

### checkSiteManually()

> **checkSiteManually**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/UptimeOrchestrator.ts:291](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L291)

Manually triggers a check for a site or monitor.

#### Parameters

##### identifier

`string`

The site identifier.

##### monitorId?

`string`

Optional monitor identifier.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../shared/types/interfaces/StatusUpdate.md)\>

Promise resolving to a StatusUpdate or undefined if no update available.

***

### clearMiddleware()

> **clearMiddleware**(): `void`

Defined in: [electron/events/TypedEventBus.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L168)

Clear all registered middleware.

#### Returns

`void`

#### Remarks

Removes all middleware functions from the processing chain.
Events will be emitted directly without middleware processing.

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`clearMiddleware`](../../events/TypedEventBus/classes/TypedEventBus.md#clearmiddleware)

***

### downloadBackup()

> **downloadBackup**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Defined in: [electron/UptimeOrchestrator.ts:302](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L302)

Downloads a backup of the SQLite database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Promise resolving to an object with:
  - buffer: Buffer containing the database backup
  - fileName: String with the generated backup filename

***

### emitTyped()

> **emitTyped**\<`K`\>(`event`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/events/TypedEventBus.ts:216](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L216)

Emit a typed event through the middleware chain.

#### Type Parameters

##### K

`K` *extends* keyof [`UptimeEvents`](../../events/eventTypes/interfaces/UptimeEvents.md)

The event name (must be a key in EventMap).

#### Parameters

##### event

`K`

The event name.

##### data

[`UptimeEvents`](../../events/eventTypes/interfaces/UptimeEvents.md)\[`K`\]

The event data (must match the type for this event).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the event has been emitted.

#### Remarks

Guarantees type safety between event name and data. The event is processed
through all registered middleware before being emitted to listeners.
Automatic metadata is added including correlation ID, timestamp, and bus ID.

**Middleware Processing:**
- Middleware is intended for cross-cutting concerns (logging, validation, rate limiting).
- Middleware receives the original event data for inspection but cannot modify
  the data that gets delivered to listeners.
- Data transformations should be performed before calling TypedEventBus.emitTyped.
- If middleware throws an error, event emission is aborted.

**Data Transformation Behavior:**
- **Objects**: Spread with added `_meta` property.
- **Arrays**: Preserved with non-enumerable `_meta` property.
- **Primitives**: Wrapped as `` value: primitiveData, _meta: metadata ``.
- **Objects with _meta**: Original `_meta` preserved as `_originalMeta`.

#### Example

```typescript
// Object event (typical case)
await bus.emitTyped('user:login', { userId: '123', timestamp: Date.now() });
// Listener receives: { userId: '123', timestamp: Date.now(), _meta: {...} }

// Array event
await bus.emitTyped('data:batch', [1, 2, 3]);
// Listener receives: [1, 2, 3] with _meta property attached

// Primitive event
await bus.emitTyped('count:updated', 42);
// Listener receives: { value: 42, _meta: {...} }
```

#### Throws

Error when middleware processing fails.

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`emitTyped`](../../events/TypedEventBus/classes/TypedEventBus.md#emittyped)

***

### exportData()

> **exportData**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/UptimeOrchestrator.ts:311](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L311)

Exports all application data as a JSON string.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to the exported data string.

***

### getDiagnostics()

> **getDiagnostics**(): [`EventBusDiagnostics`](../../events/TypedEventBus/interfaces/EventBusDiagnostics.md)

Defined in: [electron/events/TypedEventBus.ts:252](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L252)

Get diagnostic information about the event bus.

#### Returns

[`EventBusDiagnostics`](../../events/TypedEventBus/interfaces/EventBusDiagnostics.md)

Diagnostic data including listener counts and middleware information.

#### Remarks

Provides runtime information useful for debugging and monitoring.
Includes listener counts per event, middleware count, and configuration.

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`getDiagnostics`](../../events/TypedEventBus/classes/TypedEventBus.md#getdiagnostics)

***

### getHistoryLimit()

> **getHistoryLimit**(): `number`

Defined in: [electron/UptimeOrchestrator.ts:325](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L325)

Gets the current history retention limit (method version for IPC compatibility).

#### Returns

`number`

The current history limit.

#### Remarks

This method provides the same value as the historyLimit getter but
as a callable method. This is required for Electron IPC compatibility
since IPC can serialize method calls but not property access.

***

### getSites()

> **getSites**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/UptimeOrchestrator.ts:334](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L334)

Retrieves all sites from the site manager.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to an array of Site objects.

***

### importData()

> **importData**(`data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/UptimeOrchestrator.ts:344](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L344)

Imports application data from a JSON string.

#### Parameters

##### data

`string`

The JSON data string to import.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if import succeeded, false otherwise.

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/UptimeOrchestrator.ts:358](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L358)

Initializes the orchestrator and all its managers.
Ensures proper initialization order and error handling.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when initialization is complete.

#### Throws

When any manager initialization fails

#### Throws

When validation of initialized managers fails

***

### offTyped()

> **offTyped**\<`K`\>(`event`, `listener?`): `this`

Defined in: [electron/events/TypedEventBus.ts:286](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L286)

Remove typed event listener(s).

#### Type Parameters

##### K

`K` *extends* keyof [`UptimeEvents`](../../events/eventTypes/interfaces/UptimeEvents.md)

The event name (must be a key in EventMap).

#### Parameters

##### event

`K`

The event name to remove listeners for.

##### listener?

(`data`) => `void`

Specific listener to remove, or `undefined` to remove all listeners for the event.

#### Returns

`this`

This event bus instance for chaining.

#### Remarks

If no listener is specified, all listeners for the event are removed.

#### Example

```typescript
bus.offTyped('user:login'); // Remove all listeners for 'user:login'
bus.offTyped('user:login', myListener); // Remove specific listener
```

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`offTyped`](../../events/TypedEventBus/classes/TypedEventBus.md#offtyped)

***

### onceTyped()

> **onceTyped**\<`K`\>(`event`, `listener`): `this`

Defined in: [electron/events/TypedEventBus.ts:319](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L319)

Register a one-time typed event listener.

#### Type Parameters

##### K

`K` *extends* keyof [`UptimeEvents`](../../events/eventTypes/interfaces/UptimeEvents.md)

The event name (must be a key in EventMap).

#### Parameters

##### event

`K`

The event name to listen for.

##### listener

(`data`) => `void`

Function to call when the event is emitted (called only once).

#### Returns

`this`

This event bus instance for chaining.

#### Remarks

The listener is automatically removed after the first time the event is emitted.

#### Example

```typescript
bus.onceTyped('user:login', (data) => {
  console.log('User logged in:', data.userId);
});
```

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`onceTyped`](../../events/TypedEventBus/classes/TypedEventBus.md#oncetyped)

***

### onTyped()

> **onTyped**\<`K`\>(`event`, `listener`): `this`

Defined in: [electron/events/TypedEventBus.ts:342](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L342)

Register a typed event listener with guaranteed type safety.

#### Type Parameters

##### K

`K` *extends* keyof [`UptimeEvents`](../../events/eventTypes/interfaces/UptimeEvents.md)

The event name (must be a key in EventMap).

#### Parameters

##### event

`K`

The event name to listen for.

##### listener

(`data`) => `void`

Function to call when the event is emitted.

#### Returns

`this`

This event bus instance for chaining.

#### Remarks

The listener receives the original event data plus automatically added metadata.
TypeScript will enforce that the listener signature matches the event data type.

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`onTyped`](../../events/TypedEventBus/classes/TypedEventBus.md#ontyped)

***

### removeMiddleware()

> **removeMiddleware**(`middleware`): `boolean`

Defined in: [electron/events/TypedEventBus.ts:362](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L362)

Remove a specific middleware from the processing chain.

#### Parameters

##### middleware

[`EventMiddleware`](../../events/TypedEventBus/type-aliases/EventMiddleware.md)

The middleware function to remove.

#### Returns

`boolean`

`true` if middleware was found and removed, `false` otherwise.

#### Remarks

If the middleware is found, it is removed from the chain.

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`removeMiddleware`](../../events/TypedEventBus/classes/TypedEventBus.md#removemiddleware)

***

### removeMonitor()

> **removeMonitor**(`siteIdentifier`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/UptimeOrchestrator.ts:390](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L390)

Removes a monitor from a site and stops its monitoring.
Uses a two-phase commit pattern to ensure atomicity.

#### Parameters

##### siteIdentifier

`string`

The site identifier.

##### monitorId

`string`

The monitor identifier.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if removed, false otherwise.

#### Throws

When the removal operation fails critically

#### Throws

When database inconsistency occurs and cannot be resolved

***

### removeSite()

> **removeSite**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/UptimeOrchestrator.ts:460](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L460)

Removes a site by its identifier.

#### Parameters

##### identifier

`string`

The site identifier.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if removed, false otherwise.

#### Remarks

This method delegates to SiteManager for the actual removal operation.
Site removal events (site:removed) are emitted by the SiteManager through
the event forwarding system, not directly by this orchestrator method.

***

### resetSettings()

> **resetSettings**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/UptimeOrchestrator.ts:481](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L481)

Resets all application settings to their default values.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when settings have been reset.

#### Remarks

This method delegates to the DatabaseManager to reset all settings
to their default values in the database. The operation is performed
within a database transaction to ensure consistency.

This includes:
- History limit reset to default value
- Any other persisted settings reset to defaults
- Backend cache invalidation

***

### setHistoryLimit()

> **setHistoryLimit**(`limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/UptimeOrchestrator.ts:499](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L499)

Sets the history retention limit for monitor data.

#### Parameters

##### limit

`number`

The new history limit (number of entries to retain per monitor).
               Values less than or equal to 0 will disable history pruning.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when the limit is set.

#### Remarks

This method delegates to the DatabaseManager to update the history limit
in the database and prune existing history entries if necessary.

The operation is performed within a database transaction to ensure
consistency between the setting update and history pruning.

***

### startMonitoring()

> **startMonitoring**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/UptimeOrchestrator.ts:508](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L508)

Starts monitoring for all sites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when monitoring has started.

***

### startMonitoringForSite()

> **startMonitoringForSite**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/UptimeOrchestrator.ts:519](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L519)

Starts monitoring for a specific site and monitor.

#### Parameters

##### identifier

`string`

The site identifier.

##### monitorId?

`string`

Optional monitor identifier.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if started, false otherwise.

***

### stopMonitoring()

> **stopMonitoring**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/UptimeOrchestrator.ts:528](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L528)

Stops monitoring for all sites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when monitoring has stopped.

***

### stopMonitoringForSite()

> **stopMonitoringForSite**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/UptimeOrchestrator.ts:541](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L541)

Stops monitoring for a specific site and monitor.

#### Parameters

##### identifier

`string`

The site identifier.

##### monitorId?

`string`

Optional monitor identifier.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if stopped, false otherwise.

***

### updateSite()

> **updateSite**(`identifier`, `updates`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/UptimeOrchestrator.ts:552](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/UptimeOrchestrator.ts#L552)

Updates a site with the given changes.

#### Parameters

##### identifier

`string`

The site identifier.

##### updates

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../shared/types/interfaces/Site.md)\>

Partial site data to update.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../shared/types/interfaces/Site.md)\>

Promise resolving to the updated Site object.

***

### use()

> **use**(`middleware`): `void`

Defined in: [electron/events/TypedEventBus.ts:385](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L385)

Register middleware to process events before emission.

#### Parameters

##### middleware

[`EventMiddleware`](../../events/TypedEventBus/type-aliases/EventMiddleware.md)

Middleware function to register.

#### Returns

`void`

#### Remarks

Middleware is executed in registration order. Each middleware must call
`next()` to continue the chain or throw an error to abort processing.
A maximum middleware limit prevents memory leaks from excessive registrations.
If you need more middleware, consider increasing the limit in the constructor
or combining multiple middleware functions into one.

#### Throws

Error when the maximum middleware limit is exceeded.

#### Inherited from

[`TypedEventBus`](../../events/TypedEventBus/classes/TypedEventBus.md).[`use`](../../events/TypedEventBus/classes/TypedEventBus.md#use)
