# Type Alias: EventMiddleware()\<T\>

> **EventMiddleware**\<`T`\> = (`event`, `data`, `next`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\> \| `void`

Defined in: [electron/events/TypedEventBus.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L100)

Middleware function for event processing.

## Type Parameters

### T

`T` = `unknown`

The type of event data payload.

## Parameters

### event

`string`

Name of the event being processed.

### data

`T`

Event data payload (read-only for inspection).

### next

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\> \| `void`

Function to call to continue to the next middleware.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\> \| `void`

A promise that resolves when the middleware chain is complete.

## Remarks

Middleware can inspect event data, add logging, collect metrics, perform validation,
or handle other cross-cutting concerns. Middleware should NOT modify the data object,
as modifications will not be reflected in the final event delivered to listeners.
Call `next()` to continue processing or throw an error to stop the middleware chain.
Data transformations should be performed before calling [TypedEventBus.emitTyped](../classes/TypedEventBus.md#emittyped).

## Example

```typescript
const loggingMiddleware: EventMiddleware = async (event, data, next) => {
  console.log(`Processing event: ${event}`);
  await next(); // Continue to next middleware
  console.log(`Completed event: ${event}`);
};
```

## Throws

Error if the middleware wishes to abort event processing.
