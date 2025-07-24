# Class: TypedEventBus\<EventMap\>

Defined in: [electron/events/TypedEventBus.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L126)

Enhanced event bus with type safety and middleware support.

## Remarks

Provides compile-time type checking for events, automatic correlation tracking,
middleware processing, and comprehensive debugging capabilities. Events are
processed through a middleware chain before emission.

## Extends

- `EventEmitter`

## Extended by

- [`UptimeOrchestrator`](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

## Type Parameters

### EventMap

`EventMap` *extends* `Record`\<`string`, `unknown`\>

Map of event names to their data types

## Constructors

### Constructor

> **new TypedEventBus**\<`EventMap`\>(`name?`, `options?`): `TypedEventBus`\<`EventMap`\>

Defined in: [electron/events/TypedEventBus.ts:158](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L158)

Create a new typed event bus.

#### Parameters

##### name?

`string`

Optional name for the bus (used in logging and diagnostics)

##### options?

Optional configuration options

###### maxMiddleware?

`number`

#### Returns

`TypedEventBus`\<`EventMap`\>

#### Throws

Error When maxMiddleware is not positive

#### Remarks

If no name is provided, a unique correlation ID will be generated.
The bus is configured with a reasonable max listener limit for development use.
A maximum middleware limit prevents memory leaks from excessive middleware registration.

**Configuration Guidelines:**
- options.maxMiddleware: Maximum number of middleware functions allowed (default: 20, must be positive)
- Values ≤ 0 will throw an error
- Consider performance impact with high middleware counts

#### Example

```typescript
// Default configuration
const bus = new TypedEventBus<MyEvents>('my-bus');

// Custom middleware limit
const bus = new TypedEventBus<MyEvents>('my-bus', { maxMiddleware: 30 });
```

#### Overrides

`EventEmitter.constructor`

## Methods

### clearMiddleware()

> **clearMiddleware**(): `void`

Defined in: [electron/events/TypedEventBus.ts:181](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L181)

Clear all registered middleware.

#### Returns

`void`

#### Remarks

Removes all middleware functions from the processing chain.
Events will be emitted directly without middleware processing.

***

### emitTyped()

> **emitTyped**\<`K`\>(`event`, `data`): `Promise`\<`void`\>

Defined in: [electron/events/TypedEventBus.ts:228](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L228)

Emit a typed event through the middleware chain.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The event name (must be a key in EventMap)

##### data

`EventMap`\[`K`\]

The event data (must match the type for this event)

#### Returns

`Promise`\<`void`\>

#### Throws

Error When middleware processing fails

#### Remarks

Guarantees type safety between event name and data. The event is processed
through all registered middleware before being emitted to listeners.
Automatic metadata is added including correlation ID, timestamp, and bus ID.

**Middleware Processing:**
- Middleware is intended for cross-cutting concerns (logging, validation, rate limiting)
- Middleware receives the original event data for inspection but cannot modify
  the data that gets delivered to listeners
- Data transformations should be performed before calling emitTyped()
- If middleware throws an error, event emission is aborted

**Data Transformation Behavior:**
- **Objects**: Spread with added _meta property
- **Arrays**: Preserved with non-enumerable _meta property
- **Primitives**: Wrapped as ` value: primitiveData, _meta: metadata `
- **Objects with _meta**: Original _meta preserved as _originalMeta

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

***

### getDiagnostics()

> **getDiagnostics**(): [`EventBusDiagnostics`](../interfaces/EventBusDiagnostics.md)

Defined in: [electron/events/TypedEventBus.ts:264](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L264)

Get diagnostic information about the event bus.

#### Returns

[`EventBusDiagnostics`](../interfaces/EventBusDiagnostics.md)

Diagnostic data including listener counts and middleware information

#### Remarks

Provides runtime information useful for debugging and monitoring.
Includes listener counts per event, middleware count, and configuration.

***

### offTyped()

> **offTyped**\<`K`\>(`event`, `listener?`): `this`

Defined in: [electron/events/TypedEventBus.ts:291](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L291)

Remove typed event listener(s).

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The event name

##### listener?

(`data`) => `void`

Specific listener to remove, or undefined to remove all listeners

#### Returns

`this`

This event bus instance for chaining

#### Remarks

If no listener is specified, all listeners for the event are removed.

***

### onceTyped()

> **onceTyped**\<`K`\>(`event`, `listener`): `this`

Defined in: [electron/events/TypedEventBus.ts:316](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L316)

Register a one-time typed event listener.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The event name to listen for

##### listener

(`data`) => `void`

Function to call when the event is emitted (called only once)

#### Returns

`this`

This event bus instance for chaining

#### Remarks

The listener is automatically removed after the first time the event is emitted.

***

### onTyped()

> **onTyped**\<`K`\>(`event`, `listener`): `this`

Defined in: [electron/events/TypedEventBus.ts:338](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L338)

Register a typed event listener with guaranteed type safety.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The event name to listen for

##### listener

(`data`) => `void`

Function to call when the event is emitted

#### Returns

`this`

This event bus instance for chaining

#### Remarks

The listener receives the original event data plus automatically added metadata.
TypeScript will enforce that the listener signature matches the event data type.

***

### removeMiddleware()

> **removeMiddleware**(`middleware`): `boolean`

Defined in: [electron/events/TypedEventBus.ts:355](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L355)

Remove a specific middleware from the processing chain.

#### Parameters

##### middleware

[`EventMiddleware`](../type-aliases/EventMiddleware.md)

The middleware function to remove

#### Returns

`boolean`

`true` if middleware was found and removed, `false` otherwise

***

### use()

> **use**(`middleware`): `void`

Defined in: [electron/events/TypedEventBus.ts:379](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L379)

Register middleware to process events before emission.

#### Parameters

##### middleware

[`EventMiddleware`](../type-aliases/EventMiddleware.md)

Middleware function to register

#### Returns

`void`

#### Throws

Error When the maximum middleware limit is exceeded

#### Remarks

Middleware is executed in registration order. Each middleware must call
`next()` to continue the chain or throw an error to abort processing.

A maximum middleware limit prevents memory leaks from excessive registrations.
If you need more middleware, consider increasing the limit in the constructor
or combining multiple middleware functions into one.
