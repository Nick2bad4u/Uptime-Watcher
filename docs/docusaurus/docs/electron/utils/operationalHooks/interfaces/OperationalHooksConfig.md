# Interface: OperationalHooksConfig\<T\>

Defined in: [electron/utils/operationalHooks.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L69)

Configuration for operational hooks.

## Type Parameters

### T

`T` = `unknown`

## Properties

### backoff?

> `optional` **backoff**: `"linear"` \| `"exponential"`

Defined in: [electron/utils/operationalHooks.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L75)

Backoff strategy for retry delays.

#### Default Value

```ts
"exponential"
```

***

### context?

> `optional` **context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/utils/operationalHooks.ts:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L80)

Context data to include in events.

***

### emitEvents?

> `optional` **emitEvents**: `boolean`

Defined in: [electron/utils/operationalHooks.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L87)

Whether to emit events for this operation.

#### Default Value

```ts
true
```

***

### eventEmitter?

> `optional` **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/operationalHooks.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L92)

Event emitter for operation events.

***

### initialDelay?

> `optional` **initialDelay**: `number`

Defined in: [electron/utils/operationalHooks.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L99)

Initial delay between retries in milliseconds.

#### Default Value

```ts
100
```

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [electron/utils/operationalHooks.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L106)

Maximum number of retry attempts.

#### Default Value

```ts
3
```

***

### onFailure()?

> `optional` **onFailure**: (`error`, `attempts`) => `void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/operationalHooks.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L111)

Callback when operation fails permanently.

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### attempts

`number`

#### Returns

`void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### onRetry()?

> `optional` **onRetry**: (`attempt`, `error`) => `void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/operationalHooks.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L116)

Callback when retry is attempted.

#### Parameters

##### attempt

`number`

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### Returns

`void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### onSuccess()?

> `optional` **onSuccess**: (`result`) => `void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/operationalHooks.ts:121](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L121)

Callback when operation succeeds.

#### Parameters

##### result

`T`

#### Returns

`void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### operationName

> **operationName**: `string`

Defined in: [electron/utils/operationalHooks.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L126)

Name of the operation for logging and event emission.

***

### throwOnFailure?

> `optional` **throwOnFailure**: `boolean`

Defined in: [electron/utils/operationalHooks.ts:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L133)

Whether to throw on final failure.

#### Default Value

```ts
true
```
