# Class: TypedEventBus\<EventMap\>

Defined in: [electron/events/TypedEventBus.ts:148](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L148)

Enhanced event bus with type safety and middleware support.

## Remarks

Provides compile-time type checking for events, automatic correlation
tracking, middleware processing, and comprehensive debugging capabilities.
Events are processed through a middleware chain before emission.

**Type Constraints:** EventMap values must be object types (not primitives)
to support metadata enhancement.

## Extends

- [`EventEmitter`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/events.d.ts#L102)

## Extended by

- [`UptimeOrchestrator`](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

## Type Parameters

### EventMap

`EventMap` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Map of event names to their data types. Values must be
  object types.

## Constructors

### Constructor

> **new TypedEventBus**\<`EventMap`\>(`name?`, `options?`): `TypedEventBus`\<`EventMap`\>

Defined in: [electron/events/TypedEventBus.ts:330](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L330)

Create a new typed event bus.

#### Parameters

##### name?

`string`

Optional name for the bus (used in logging and
  diagnostics).

##### options?

Optional configuration options.

###### maxMiddleware?

`number`

#### Returns

`TypedEventBus`\<`EventMap`\>

#### Remarks

If no name is provided, a unique correlation ID will be generated. The
bus is configured with a reasonable max listener limit for development
use. A maximum middleware limit prevents memory leaks from excessive
middleware registration.

#### Example

```typescript
// Default configuration
const bus = new TypedEventBus<MyEvents>("my-bus");

// Custom middleware limit
const bus = new TypedEventBus<MyEvents>("my-bus", {
    maxMiddleware: 30,
});
```

#### Throws

Error when `maxMiddleware` is not positive.

#### Overrides

`EventEmitter.constructor`

## Methods

### emitTyped()

> **emitTyped**\<`K`\>(`event`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/events/TypedEventBus.ts:212](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L212)

Emit a typed event through the middleware chain.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

The event name (must be a key in EventMap).

#### Parameters

##### event

`K`

The event name.

##### data

`EventMap`\[`K`\]

The event data (must match the type for this event).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the event has been emitted.

#### Remarks

Guarantees type safety between event name and data. The event is
processed through all registered middleware before being emitted to
listeners. Automatic metadata is added including correlation ID,
timestamp, and bus ID.

**Middleware Processing:**

- Middleware is intended for cross-cutting concerns (logging, validation,
  rate limiting). - Middleware receives the original event data for
  inspection but cannot modify the data that gets delivered to
  listeners.
- Data transformations should be performed before calling
  [TypedEventBus.emitTyped](#emittyped). - If middleware throws an error, event
  emission is aborted.

**Data Transformation Behavior:**

- **Objects**: Spread with added `_meta` property.
- **Arrays**: Preserved with non-enumerable `_meta` property.
- **Primitives**: Wrapped as `` value: primitiveData, _meta: metadata ``.
- **Objects with _meta**: Original `_meta` preserved as `_originalMeta`.

#### Example

```typescript
// Object event (typical case)
await bus.emitTyped("user:login", {
    userId: "123",
    timestamp: Date.now(),
});
// Listener receives: { userId: '123', timestamp: Date.now(), _meta: {...} }

// Array event
await bus.emitTyped("data:batch", [1, 2, 3]);
// Listener receives: [1, 2, 3] with _meta property attached

// Primitive event
await bus.emitTyped("count:updated", 42);
// Listener receives: { value: 42, _meta: {...} }
```

#### Throws

Error when middleware processing fails.

***

### clearMiddleware()

> **clearMiddleware**(): `void`

Defined in: [electron/events/TypedEventBus.ts:358](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L358)

Clear all registered middleware.

#### Returns

`void`

#### Remarks

Removes all middleware functions from the processing chain. Events will
be emitted directly without middleware processing.

***

### getDiagnostics()

> **getDiagnostics**(): [`EventBusDiagnostics`](../interfaces/EventBusDiagnostics.md)

Defined in: [electron/events/TypedEventBus.ts:377](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L377)

Get diagnostic information about the event bus.

#### Returns

[`EventBusDiagnostics`](../interfaces/EventBusDiagnostics.md)

Diagnostic data including listener counts and middleware
  information.

#### Remarks

Provides runtime information useful for debugging and monitoring.
Includes listener counts per event, middleware count, and configuration.

***

### offTyped()

> **offTyped**\<`K`\>(`event`, `listener?`): `this`

Defined in: [electron/events/TypedEventBus.ts:420](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L420)

Remove typed event listener(s).

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

The event name (must be a key in EventMap).

#### Parameters

##### event

`K`

The event name to remove listeners for.

##### listener?

(`data`) => `void`

Specific listener to remove, or `undefined` to remove
  all listeners for the event.

#### Returns

`this`

This event bus instance for chaining.

#### Remarks

If no listener is specified, all listeners for the event are removed.

#### Example

```typescript
bus.offTyped("user:login"); // Remove all listeners for 'user:login'
bus.offTyped("user:login", myListener); // Remove specific listener
```

***

### onceTyped()

> **onceTyped**\<`K`\>(`event`, `listener`): `this`

Defined in: [electron/events/TypedEventBus.ts:461](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L461)

Register a one-time typed event listener.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

The event name (must be a key in EventMap).

#### Parameters

##### event

`K`

The event name to listen for.

##### listener

(`data`) => `void`

Function to call when the event is emitted (called only
  once).

#### Returns

`this`

This event bus instance for chaining.

#### Remarks

The listener is automatically removed after the first time the event is
emitted.

#### Example

```typescript
bus.onceTyped("user:login", (data) => {
    console.log("User logged in:", data.userId);
});
```

***

### onTyped()

> **onTyped**\<`K`\>(`event`, `listener`): `this`

Defined in: [electron/events/TypedEventBus.ts:490](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L490)

Register a typed event listener with guaranteed type safety.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

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

The listener receives the original event data plus automatically added
metadata. TypeScript will enforce that the listener signature matches the
event data type.

***

### removeMiddleware()

> **removeMiddleware**(`middleware`): `boolean`

Defined in: [electron/events/TypedEventBus.ts:514](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L514)

Remove a specific middleware from the processing chain.

#### Parameters

##### middleware

[`EventMiddleware`](../type-aliases/EventMiddleware.md)

The middleware function to remove.

#### Returns

`boolean`

`true` if middleware was found and removed, `false` otherwise.

#### Remarks

If the middleware is found, it is removed from the chain.

***

### use()

> **use**(`middleware`): `void`

Defined in: [electron/events/TypedEventBus.ts:542](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L542)

Register middleware to process events before emission.

#### Parameters

##### middleware

[`EventMiddleware`](../type-aliases/EventMiddleware.md)

Middleware function to register.

#### Returns

`void`

#### Remarks

Middleware is executed in registration order. Each middleware must call
`next()` to continue the chain or throw an error to abort processing. A
maximum middleware limit prevents memory leaks from excessive
registrations. If you need more middleware, consider increasing the limit
in the constructor or combining multiple middleware functions into one.

#### Throws

Error when the maximum middleware limit is exceeded.
