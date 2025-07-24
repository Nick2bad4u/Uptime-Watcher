# Interface: OperationalHooksConfig\<T\>

Defined in: [electron/utils/operationalHooks.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L13)

Configuration for operational hooks.

## Type Parameters

### T

`T` = `unknown`

## Properties

### backoff?

> `optional` **backoff**: `"exponential"` \| `"linear"`

Defined in: [electron/utils/operationalHooks.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L18)

Backoff strategy for retry delays.

#### Default Value

```ts
"exponential"
```

***

### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [electron/utils/operationalHooks.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L23)

Context data to include in events.

***

### emitEvents?

> `optional` **emitEvents**: `boolean`

Defined in: [electron/utils/operationalHooks.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L29)

Whether to emit events for this operation.

#### Default Value

```ts
true
```

***

### eventEmitter?

> `optional` **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/operationalHooks.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L34)

Event emitter for operation events.

***

### initialDelay?

> `optional` **initialDelay**: `number`

Defined in: [electron/utils/operationalHooks.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L40)

Initial delay between retries in milliseconds.

#### Default Value

```ts
100
```

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [electron/utils/operationalHooks.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L46)

Maximum number of retry attempts.

#### Default Value

```ts
3
```

***

### onFailure()?

> `optional` **onFailure**: (`error`, `attempts`) => `void` \| `Promise`\<`void`\>

Defined in: [electron/utils/operationalHooks.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L51)

Callback when operation fails permanently.

#### Parameters

##### error

`Error`

##### attempts

`number`

#### Returns

`void` \| `Promise`\<`void`\>

***

### onRetry()?

> `optional` **onRetry**: (`attempt`, `error`) => `void` \| `Promise`\<`void`\>

Defined in: [electron/utils/operationalHooks.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L56)

Callback when retry is attempted.

#### Parameters

##### attempt

`number`

##### error

`Error`

#### Returns

`void` \| `Promise`\<`void`\>

***

### onSuccess()?

> `optional` **onSuccess**: (`result`) => `void` \| `Promise`\<`void`\>

Defined in: [electron/utils/operationalHooks.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L61)

Callback when operation succeeds.

#### Parameters

##### result

`T`

#### Returns

`void` \| `Promise`\<`void`\>

***

### operationName

> **operationName**: `string`

Defined in: [electron/utils/operationalHooks.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L66)

Name of the operation for logging and event emission.

***

### throwOnFailure?

> `optional` **throwOnFailure**: `boolean`

Defined in: [electron/utils/operationalHooks.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L72)

Whether to throw on final failure.

#### Default Value

```ts
true
```
