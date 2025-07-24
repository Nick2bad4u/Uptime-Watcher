# Function: createTypedEventBus()

> **createTypedEventBus**\<`EventMap`\>(`name?`, `options?`): [`TypedEventBus`](../classes/TypedEventBus.md)\<`EventMap`\>

Defined in: [electron/events/TypedEventBus.ts:519](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L519)

Utility function to create a typed event bus instance.

## Type Parameters

### EventMap

`EventMap` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

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
