# Function: createTypedEventBus()

> **createTypedEventBus**\<`EventMap`\>(`name?`, `options?`): [`TypedEventBus`](../classes/TypedEventBus.md)\<`EventMap`\>

Defined in: [electron/events/TypedEventBus.ts:522](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L522)

Factory function to create a new typed event bus instance.

## Type Parameters

### EventMap

`EventMap` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Map of event names to their data types.

## Parameters

### name?

`string`

Optional name for the bus (used in logging and diagnostics).

### options?

Optional configuration options for the event bus.

#### maxMiddleware?

`number`

## Returns

[`TypedEventBus`](../classes/TypedEventBus.md)\<`EventMap`\>

A new [TypedEventBus](../classes/TypedEventBus.md) instance.

## Remarks

This function is a convenience wrapper for the [TypedEventBus](../classes/TypedEventBus.md) constructor.

## Example

```typescript
const bus = createTypedEventBus<MyEvents>('my-bus', { maxMiddleware: 30 });
```
