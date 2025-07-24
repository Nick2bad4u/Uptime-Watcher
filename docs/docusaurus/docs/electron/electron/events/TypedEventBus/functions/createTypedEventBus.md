# Function: createTypedEventBus()

> **createTypedEventBus**\<`EventMap`\>(`name?`, `options?`): [`TypedEventBus`](../classes/TypedEventBus.md)\<`EventMap`\>

Defined in: [electron/events/TypedEventBus.ts:519](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/TypedEventBus.ts#L519)

Utility function to create a typed event bus instance.

## Type Parameters

### EventMap

`EventMap` *extends* `Record`\<`string`, `unknown`\>

## Parameters

### name?

`string`

Optional name for the bus

### options?

Optional configuration options

#### maxMiddleware?

`number`

## Returns

[`TypedEventBus`](../classes/TypedEventBus.md)\<`EventMap`\>

A new TypedEventBus instance

## Remarks

Convenience factory function for creating typed event bus instances.
Equivalent to `new TypedEventBus`EventMap`(name, options)`.

## Example

```typescript
interface AppEvents {
  'user:login': { userId: string };
}

const bus = createTypedEventBus<AppEvents>('main-bus', { maxMiddleware: 50 });
```
